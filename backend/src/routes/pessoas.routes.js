const express = require('express');
const { cadastrarPessoaSchema } = require('../modules/pessoas/pessoas.schema');
const { cadastrarPessoa, listarPessoas } = require('../modules/pessoas/pessoas.service');
const { getZodErrorMessage } = require('../modules/shared/utils');

const router = express.Router();

router.post('/pessoas', async (req, res) => {
    try {
        const validated = cadastrarPessoaSchema.parse({ body: req.body });
        const data = await cadastrarPessoa(validated.body.empresa_id, validated.body.nome, validated.body.documento);
        return res.status(201).json({ dados: data });
    } catch (err) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ erro: getZodErrorMessage(err) });
        }
        return res.status(400).json({ erro: err.message });
    }
});

router.get('/pessoas', async (req, res) => {
    try {
        const data = await listarPessoas();
        return res.status(200).json(data);
    } catch (err) {
        return res.status(400).json({ erro: err.message });
    }
});

module.exports = router;
