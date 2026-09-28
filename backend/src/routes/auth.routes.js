const express = require('express');
const { loginSchema } = require('../modules/auth/auth.schema');
const { login } = require('../modules/auth/auth.service');
const { getZodErrorMessage } = require('../modules/shared/utils');

const router = express.Router();

router.get('/login/:id', async (req, res) => {
    try {
        const validated = loginSchema.parse({ params: req.params });
        const usuario = await login(validated.params.id);
        return res.status(200).json({ mensagem: 'Login autorizado!', usuario });
    } catch (err) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ erro: getZodErrorMessage(err) });
        }
        return res.status(404).json({ erro: err.message });
    }
});

module.exports = router;
