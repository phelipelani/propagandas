

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Importa nossas rotas
import propagandaRoutes from './src/routes/propaganda.routes.js';


const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Habilita CORS para todas as origens
app.use(express.json()); // Para parsear JSON no corpo das requisições

// -- Configuração para servir arquivos estáticos (nosso frontend) --
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// A pasta 'public' conterá nosso HTML de teste
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api/propagandas', propagandaRoutes);

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});