const { supabase } = require('../../lib/supabase');

async function login(id) {
    const { data, error } = await supabase
        .from('crachas')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        throw new Error('Crachá não encontrado no sistema!');
    }
    return data;
}

module.exports = { login };
