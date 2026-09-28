const express = require('express');
const { registrarEntradaSchema, registrarSaidaSchema, registrarSaidaLoteSchema } = require('../modules/registros/registros.schema');
const { registrarEntrada, registrarSaida, listarPendentes, listarHistorico, registrarSaidaLote } = require('../modules/registros/registros.service');
const { getZodErrorMessage } = require('../modules/shared/utils');

const router = express.Router();

router.post('/entrada', async (req, res) => {
    try {
        const validated = registrarEntradaSchema.parse({ body: req.body });
        const data = await registrarEntrada(validated.body);
        return res.status(201).json({ mensagem: 'Lote de entrada registrado com sucesso!', dados: data });
    } catch (err) {
        if (err.name === 'ZodError') return res.status(400).json({ erro: getZodErrorMessage(err) });
        return res.status(400).json({ erro: err.message });
    }
});

router.put('/saida/:id', async (req, res) => {
    try {
        const validated = registrarSaidaSchema.parse({ params: req.params, body: req.body });
        const data = await registrarSaida(validated.params.id, validated.body);
        return res.status(200).json({ mensagem: 'Saída registrada com sucesso!', dados: data });
    } catch (err) {
        if (err.name === 'ZodError') return res.status(400).json({ erro: getZodErrorMessage(err) });
        return res.status(400).json({ erro: err.message });
    }
});

router.get('/pendentes', async (req, res) => {
    try {
        const data = await listarPendentes();
        return res.status(200).json(data);
    } catch (err) {
        return res.status(400).json({ erro: err.message });
    }
});

router.get('/historico', async (req, res) => {
    try {
        const data = await listarHistorico();
        return res.status(200).json(data);
    } catch (err) {
        return res.status(400).json({ erro: err.message });
    }
});

router.put('/saida-lote', async (req, res) => {
    try {
        const validated = registrarSaidaLoteSchema.parse({ body: req.body });
        const data = await registrarSaidaLote(validated.body);
        return res.status(200).json({ mensagem: 'Saídas registradas com sucesso!', dados: data });
    } catch (err) {
        if (err.name === 'ZodError') return res.status(400).json({ erro: getZodErrorMessage(err) });
        return res.status(400).json({ erro: err.message });
    }
});

module.exports = router;
