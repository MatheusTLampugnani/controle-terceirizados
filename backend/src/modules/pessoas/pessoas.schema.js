const { z } = require('zod');

const cadastrarPessoaSchema = z.object({
    body: z.object({
        empresa_id: z.number().or(z.string()).optional().nullable(),
        nome: z.string().min(1, 'Nome é obrigatório'),
        documento: z.string().optional().nullable()
    })
});

module.exports = { cadastrarPessoaSchema };
