const { supabase } = require('../../lib/supabase');

async function cadastrarEmpresa(nome, cnpj) {
    const { data, error } = await supabase
        .from('empresas_terceiras')
        .insert([{ nome, cnpj }])
        .select();
    if (error) throw error;
    return data;
}

async function listarEmpresas() {
    const { data, error } = await supabase.from('empresas_terceiras').select('*').order('nome');
    if (error) throw error;
    return data;
}

module.exports = { cadastrarEmpresa, listarEmpresas };
