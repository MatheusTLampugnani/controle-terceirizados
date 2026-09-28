const { z } = require('zod');

const registrarEntradaSchema = z.object({
    body: z.object({
        pessoa_id: z.number().or(z.string()),
        cracha_entrada_id: z.number().or(z.string()),
        equipamentos: z.array(z.object({
            equipamento_descricao: z.string().optional().nullable(),
            marca_modelo: z.string().optional().nullable(),
            numero_serie: z.string().optional().nullable(),
            quantidade: z.number().or(z.string()).optional().nullable(),
            observacao: z.string().optional().nullable(),
            foto_equipamento_url: z.string().optional().nullable()
        }))
    })
});

const registrarSaidaSchema = z.object({
    params: z.object({
        id: z.number().or(z.string())
    }),
    body: z.object({
        cracha_saida: z.number().or(z.string()),
        observacao_saida: z.string().optional().nullable(),
        assinatura_terceiro: z.string().optional().nullable(),
        autorizadoPor: z.string().optional().nullable(),
        retiradoPor: z.string().optional().nullable()
    })
});

const registrarSaidaLoteSchema = z.object({
    body: z.object({
        ids: z.array(z.number().or(z.string())),
        cracha_saida: z.number().or(z.string()),
        observacao_saida: z.string().optional().nullable(),
        assinatura_terceiro: z.string().optional().nullable(),
        autorizadoPor: z.string().optional().nullable(),
        retiradoPor: z.string().optional().nullable(),
        codigo_saida: z.string().optional().nullable()
    })
});

module.exports = { registrarEntradaSchema, registrarSaidaSchema, registrarSaidaLoteSchema };
