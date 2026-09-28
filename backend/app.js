require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./src/routes/auth.routes');
const empresasRoutes = require('./src/routes/empresas.routes');
const pessoasRoutes = require('./src/routes/pessoas.routes');
const registrosRoutes = require('./src/routes/registros.routes');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/portaria', authRoutes);
app.use('/api/portaria', empresasRoutes);
app.use('/api/portaria', pessoasRoutes);
app.use('/api/portaria', registrosRoutes);

app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
