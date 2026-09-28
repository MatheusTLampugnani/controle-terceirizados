const express = require('express');
const { cadastrarEmpresaSchema } = require('../modules/empresas/empresas.schema');
const { cadastrarEmpresa, listarEmpresas } = require('../modules/empresas/empresas.service');
const { getZodErrorMessage } = require('../modules/shared/utils');

const router = express.Router();

router.post('/empresas', async (req, res) => {
    try {
        const validated = cadastrarEmpresaSchema.parse({ body: req.body });
        const data = await cadastrarEmpresa(validated.body.nome, validated.body.cnpj);
        return res.status(201).json({ mensagem: 'Empresa cadastrada!', dados: data });
    } catch (err) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ erro: getZodErrorMessage(err) });
        }
        return res.status(400).json({ erro: err.message });
    }
});

router.get('/empresas', async (req, res) => {
    try {
        const data = await listarEmpresas();
        return res.status(200).json(data);
    } catch (err) {
        return res.status(400).json({ erro: err.message });
    }
});

module.exports = router;
