const { supabase } = require('../../lib/supabase');

async function enriquecerRegistros(registros) {
    if (!registros || registros.length === 0) return [];
    const { data: crachas } = await supabase.from('crachas').select('id, nome_completo');
    const mapaCrachas = {};
    if (crachas) {
        crachas.forEach(c => {
            mapaCrachas[c.id] = c.nome_completo;
        });
    }
    return registros.map(item => ({
        ...item,
        cracha_entrada: item.cracha_entrada_id ? { id: item.cracha_entrada_id, nome_completo: mapaCrachas[item.cracha_entrada_id] || `Crachá ${item.cracha_entrada_id}` } : null,
        cracha_saida: item.cracha_saida_id ? { id: item.cracha_saida_id, nome_completo: mapaCrachas[item.cracha_saida_id] || `Crachá ${item.cracha_saida_id}` } : null
    }));
}

async function uploadBase64(base64String, pasta, prefixo) {
    if (!base64String || !base64String.startsWith('data:image')) return null;
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;
    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const extension = mimeType.split('/')[1];
    const fileName = `${pasta}/${prefixo}_${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
    const { error } = await supabase.storage.from('registro-portaria').upload(fileName, buffer, { contentType: mimeType, upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('registro-portaria').getPublicUrl(fileName);
    return data.publicUrl;
}

async function registrarEntrada(dados) {
    const { pessoa_id, cracha_entrada_id, equipamentos } = dados;
    const registrosParaInserir = [];
    for (const eqp of equipamentos) {
        let linkFoto = await uploadBase64(eqp.foto_equipamento_url, 'fotos', 'eqp');
        registrosParaInserir.push({
            pessoa_id,
            cracha_entrada_id,
            equipamento_descricao: eqp.equipamento_descricao,
            marca_modelo: eqp.marca_modelo,
            numero_serie: eqp.numero_serie,
            quantidade: eqp.quantidade,
            observacao: eqp.observacao,
            foto_equipamento_url: linkFoto
        });
    }
    const { data, error } = await supabase.from('registros_portaria').insert(registrosParaInserir).select();
    if (error) throw error;
    return data;
}

async function registrarSaida(id, dados) {
    let linkAssinaturaSaida = null;
    if (dados.assinatura_terceiro) {
        linkAssinaturaSaida = await uploadBase64(dados.assinatura_terceiro, 'assinaturas', 'saida');
    }
    const { data, error } = await supabase
        .from('registros_portaria')
        .update({
            data_hora_saida: new Date(),
            cracha_saida_id: dados.cracha_saida,
            autorizado_por: dados.autorizadoPor,
            retirado_por: dados.retiradoPor,
            observacao: dados.observacao_saida ? `Saída: ${dados.observacao_saida}` : undefined,
            assinatura_terceiro: linkAssinaturaSaida || undefined
        })
        .eq('id', id)
        .select();
    if (error) throw error;
    return data;
}

async function listarPendentes() {
    const { data, error } = await supabase
        .from('registros_portaria')
        .select(`id, data_hora_entrada, equipamento_descricao, marca_modelo, numero_serie, quantidade, observacao, foto_equipamento_url, assinatura_terceiro, autorizado_por, cracha_entrada_id, cracha_saida_id, pessoas_terceiras (nome, documento, empresas_terceiras (nome))`)
        .is('data_hora_saida', null);
    if (error) throw error;
    return await enriquecerRegistros(data);
}

async function listarHistorico() {
    const { data, error } = await supabase
        .from('registros_portaria')
        .select(`id, data_hora_entrada, data_hora_saida, equipamento_descricao, marca_modelo, numero_serie, quantidade, observacao, foto_equipamento_url, assinatura_terceiro, autorizado_por, cracha_entrada_id, cracha_saida_id, pessoas_terceiras (nome, documento, empresas_terceiras (nome))`)
        .order('data_hora_entrada', { ascending: false });
    if (error) throw error;
    return await enriquecerRegistros(data);
}

async function registrarSaidaLote(dados) {
    let linkAssinaturaSaida = null;
    if (dados.assinatura_terceiro) {
        linkAssinaturaSaida = await uploadBase64(dados.assinatura_terceiro, 'assinaturas', 'saida');
    }
    const { data, error } = await supabase
        .from('registros_portaria')
        .update({
            data_hora_saida: new Date(),
            cracha_saida_id: dados.cracha_saida,
            autorizado_por: dados.autorizadoPor,
            retirado_por: dados.retiradoPor,
            observacao: dados.observacao_saida ? `Saída Lote: ${dados.observacao_saida}` : undefined,
            assinatura_terceiro: linkAssinaturaSaida || undefined,
            codigo_saida: dados.codigo_saida
        })
        .in('id', dados.ids)
        .select();
    if (error) throw error;
    return data;
}

module.exports = { registrarEntrada, registrarSaida, listarPendentes, listarHistorico, registrarSaidaLote };
