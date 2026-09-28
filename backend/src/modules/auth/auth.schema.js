const { z } = require('zod');

const loginSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'ID do crachá é obrigatório')
    })
});

module.exports = { loginSchema };
