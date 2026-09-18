require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);


/** Função auxiliar para enriquecer os registros com os nomes dos crachás **/
async function enriquecerRegistros(registros) {
    if (!registros || registros.length === 0) return [];

    // Busca todos os crachás de uma vez para otimizar
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


/** Função de entrada **/
app.post('/api/portaria/entrada', async (req, res) => {
    const {
        pessoa_id,
        equipamento_descricao,
        marca_modelo,
        numero_serie,
        quantidade,
        observacao,
        cracha_entrada_id,
        foto_equipamento_url,
        assinatura_terceiro
    } = req.body;

    try {
        const uploadBase64 = async (base64String, pasta, prefixo) => {
            if (!base64String || !base64String.startsWith('data:image')) return null;

            const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) return null;

            const mimeType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            const extension = mimeType.split('/')[1];

            const fileName = `${pasta}/${prefixo}_${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;

            const { error } = await supabase.storage
                .from('registro-portaria')
                .upload(fileName, buffer, {
                    contentType: mimeType,
                    upsert: false
                });

            if (error) throw error;

            const { data } = supabase.storage
                .from('registro-portaria')
                .getPublicUrl(fileName);

            return data.publicUrl;
        };

        let linkFoto = await uploadBase64(foto_equipamento_url, 'fotos', 'eqp');
        let linkAssinatura = await uploadBase64(assinatura_terceiro, 'assinaturas', 'ass');

        const { data, error } = await supabase
            .from('registros_portaria')
            .insert([{
                pessoa_id,
                equipamento_descricao,
                marca_modelo,
                numero_serie,
                quantidade,
                observacao,
                cracha_entrada_id: cracha_entrada_id,
                foto_equipamento_url: linkFoto,
                assinatura_terceiro: linkAssinatura
            }])
            .select();

        if (error) throw error;

        return res.status(201).json({ mensagem: 'Entrada registrada com sucesso!', dados: data });
    } catch (err) {
        console.error("ERRO NO UPLOAD/INSERT:", err);
        return res.status(400).json({ erro: err.message });
    }
});


/** Função de saída **/
app.put('/api/portaria/saida/:id', async (req, res) => {
    const { id } = req.params;
    const { cracha_saida, observacao_saida, assinatura_terceiro, autorizadoPor, retiradoPor } = req.body;

    try {
        let linkAssinaturaSaida = null;
        if (assinatura_terceiro && assinatura_terceiro.startsWith('data:image')) {
            const matches = assinatura_terceiro.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const mimeType = matches[1];
                const buffer = Buffer.from(matches[2], 'base64');
                const fileName = `assinaturas/saida_${Date.now()}_${Math.random().toString(36).substring(7)}.png`;

                const { error: uploadError } = await supabase.storage
                    .from('registro-portaria')
                    .upload(fileName, buffer, { contentType: mimeType });

                if (!uploadError) {
                    const { data } = supabase.storage
                        .from('registro-portaria')
                        .getPublicUrl(fileName);
                    linkAssinaturaSaida = data.publicUrl;
                }
            }
        }

        const { data, error } = await supabase
            .from('registros_portaria')
            .update({
                data_hora_saida: new Date(),
                cracha_saida_id: cracha_saida,
                autorizado_por: autorizadoPor,
                retirado_por: retiradoPor,
                observacao: observacao_saida ? `Saída: ${observacao_saida}` : undefined,
                assinatura_terceiro: linkAssinaturaSaida || undefined
            })
            .eq('id', id)
            .select();

        if (error) throw error;

        return res.status(200).json({ mensagem: 'Saída registrada com sucesso!', dados: data });
    } catch (err) {
        console.error("ERRO NA SAÍDA:", err);
        return res.status(400).json({ erro: err.message });
    }
});


/** Função de consultas (Pendentes) **/
app.get('/api/portaria/pendentes', async (req, res) => {
    const { data, error } = await supabase
        .from('registros_portaria')
        .select(`
            id,
            data_hora_entrada,
            equipamento_descricao,
            marca_modelo,
            numero_serie,
            quantidade,
            observacao,
            foto_equipamento_url,
            assinatura_terceiro,
            autorizado_por,
            cracha_entrada_id,
            cracha_saida_id,
            pessoas_terceiras (
                nome, 
                documento, 
                empresas_terceiras (nome)
            )
        `)
        .is('data_hora_saida', null);

    if (error) {
        console.error("\nERRO DO SUPABASE:", error);
        return res.status(400).json({ erro: error.message, detalhes: error });
    }

    const dadosEnriquecidos = await enriquecerRegistros(data);
    return res.status(200).json(dadosEnriquecidos);
});


/** Função de cadastro de empresas **/
app.post('/api/portaria/empresas', async (req, res) => {
    const { nome, cnpj } = req.body;

    try {
        const { data, error } = await supabase
            .from('empresas_terceiras')
            .insert([{ nome, cnpj }])
            .select();

        if (error) throw error;

        return res.status(201).json({ mensagem: 'Empresa cadastrada!', dados: data });
    } catch (err) {
        console.error("Erro ao cadastrar empresa:", err);
        return res.status(400).json({ erro: err.message });
    }
});


/** Função de consultas de empresas **/
app.get('/api/portaria/empresas', async (req, res) => {
    const { data, error } = await supabase.from('empresas_terceiras').select('*').order('nome');
    if (error) return res.status(400).json({ erro: error.message });
    return res.status(200).json(data);
});


/** Função de cadastro de pessoas **/
app.post('/api/portaria/pessoas', async (req, res) => {
    const { empresa_id, nome, documento } = req.body;
    const { data, error } = await supabase.from('pessoas_terceiras').insert([{ empresa_id, nome, documento }]).select();
    if (error) return res.status(400).json({ erro: error.message });
    return res.status(201).json({ dados: data });
});


/** Função de consultas de pessoas **/
app.get('/api/portaria/pessoas', async (req, res) => {
    const { data, error } = await supabase.from('pessoas_terceiras').select('*, empresas_terceiras(nome)').order('nome');
    if (error) return res.status(400).json({ erro: error.message });
    return res.status(200).json(data);
});


/** Função de login **/
app.get('/api/portaria/login/:id', async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('crachas')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        return res.status(404).json({ erro: 'Crachá não encontrado no sistema!' });
    }

    return res.status(200).json({ mensagem: 'Login autorizado!', usuario: data });
});


/** Função de consultas de registros (Histórico) **/
app.get('/api/portaria/historico', async (req, res) => {
    const { data, error } = await supabase
        .from('registros_portaria')
        .select(`
            id,
            data_hora_entrada,
            data_hora_saida,
            equipamento_descricao,
            marca_modelo,
            numero_serie,
            quantidade,
            observacao,
            foto_equipamento_url,
            assinatura_terceiro,
            autorizado_por,
            cracha_entrada_id,
            cracha_saida_id,
            pessoas_terceiras (
                nome, 
                documento, 
                empresas_terceiras (nome)
            )
        `)
        .order('data_hora_entrada', { ascending: false });

    if (error) {
        console.error("ERRO AO BUSCAR HISTÓRICO:", error);
        return res.status(400).json({ erro: error.message });
    }

    const dadosEnriquecidos = await enriquecerRegistros(data);
    return res.status(200).json(dadosEnriquecidos);
});

app.use(express.static(path.join(__dirname, '../../frontend/dist')));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
});

app.listen(10000, () => {
    console.log('Servidor rodando na porta 10000');
});