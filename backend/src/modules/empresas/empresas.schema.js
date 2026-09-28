const { z } = require('zod');

const cadastrarEmpresaSchema = z.object({
    body: z.object({
        nome: z.string().min(1, 'Nome da empresa é obrigatório'),
        cnpj: z.string().optional()
    })
});

module.exports = { cadastrarEmpresaSchema };
