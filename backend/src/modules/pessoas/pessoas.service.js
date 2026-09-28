const { supabase } = require('../../lib/supabase');

async function cadastrarPessoa(empresa_id, nome, documento) {
    const { data, error } = await supabase.from('pessoas_terceiras').insert([{ empresa_id, nome, documento }]).select();
    if (error) throw error;
    return data;
}

async function listarPessoas() {
    const { data, error } = await supabase.from('pessoas_terceiras').select('*, empresas_terceiras(nome)').order('nome');
    if (error) throw error;
    return data;
}

module.exports = { cadastrarPessoa, listarPessoas };
