# 📦 Sistema de Controle de Portaria de Terceiros — Videplast

> **Versão:** 2.0 — Arquitetura Modular Monolith, Validação com Zod e Desacoplamento Full-Stack  
> **Status:** Em Produção  
> **Classificação:** Interno — Videplast

---

## 📋 Sumário

1. [Visão Geral](#-visão-geral)
2. [O que Há de Novo nesta Versão (Changelog & Melhorias)](#-o-que-há-de-novo-nesta-versão)
3. [Arquitetura do Sistema](#-arquitetura-do-sistema)
4. [Módulos do Sistema](#-módulos-do-sistema)
5. [Estrutura de Pastas](#-estrutura-de-pastas)
6. [Instalação e Configuração Local](#-instalação-e-configuração-local)
7. [Deploy e Produção](#-deploy-e-produção)

---

## 🎯 Visão Geral

O **Sistema de Controle de Portaria** é uma aplicação web full-stack desenvolvida sob medida para a **Videplast**, com foco em agilizar, rastrear e auditar o fluxo de entrada e saída de terceiros, ferramentas e equipamentos nas dependências da fábrica.

### Principais Capacidades:
* **Controle Unificado:** Registro rápido de empresas terceirizadas e funcionários prestadores de serviço.
* **Inventário de Equipamentos em Planta:** Bipagem e controle fotográfico de equipamentos que adentram a fábrica.
* **Auditoria Completa de Alterações:** Rastreabilidade detalhada de movimentações com registro do crachá do porteiro autorizador, horários de entrada/saída, autorizantes internos e captura de assinaturas.
* **Interface Dinâmica:** Dashboard em tempo real atualizando os ativos pendentes na fábrica e o histórico completo de movimentações.
* **Progressive Web App (PWA):** Compatível para rodar nas portarias e dispositivos móveis da equipe de segurança.

---

## 🚀 O que Há de Novo nesta Versão

### 1. 🏛️ Arquitetura Modular Monolith no Backend
* O backend Express legava toda a lógica de negócio, rotas e acesso ao banco em um único arquivo monolítico.
* O sistema foi completamente reorganizado em **módulos independentes por domínio** (`modules/`), com barreiras de isolamento rígidas.
* As rotas HTTP em `routes/` foram convertidas em controladores finos, delegando a regra de negócio para os serviços do domínio.

### 2. 🛡️ Validação Estrita de Entrada com Zod
* Todos os endpoints agora passam por validação declarativa de payloads (`req.body`, `req.query`, `req.params`) com esquemas **Zod**.
* Tratamento centralizado de erros de validação com proteção contra injeções ou falhas silenciosas de dados.

### 3. 🔌 Conexão Unificada com Supabase
* Implementada a camada singleton `lib/supabase.js`, unificando conexões, controle de ciclo de vida e sanitização de credenciais de ambiente.

### 4. ⚛️ Desacoplamento do Frontend com Custom Hooks
* O componente principal de Dashboard e App misturavam estado de autenticação, lógica de busca e modais.
* Extraídos hooks de domínio isolados e reutilizáveis:
  * `useAuth`: Autenticação por crachá do porteiro e persistência de sessão.
  * `useRegistros`: Lógica unificada para gerenciamento do histórico, filtros dinâmicos e controle de pendentes.

### 5. 🌐 Centralização de API e Proxy no Vite
* Criação de cliente centralizado `frontend/src/lib/api.js` com Axios configurado.
* Configuração de proxy reverso em desenvolvimento no `vite.config.js`, eliminando dependências rígidas de portas e erros de CORS.

---

## 🏛️ Arquitetura do Sistema

```text
                             ┌───────────────────────────────┐
                             │       Navegador / PWA         │
                             │  (React 19 + Vite + Bootstrap)│
                             └──────────────┬────────────────┘
                                            │ HTTP / JSON
                                            ▼
                             ┌───────────────────────────────┐
                             │    Backend Express (Node.js)  │
                             │         (app.js limpo)        │
                             └──────────────┬────────────────┘
                                            │ Rotas Finas
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
          ┌─────────────────────┐                       ┌─────────────────────┐
          │   Camada de Rotas   │                       │  Validação com Zod  │
          │     (routes/*.js)   │ ──(valida entrada)──► │  (modules/*/schemas)│
          └──────────┬──────────┘                       └─────────────────────┘
                     │ Executa negócio
                     ▼
          ┌─────────────────────┐
          │  Serviços de Domínio│
          │ (modules/*/services)│
          └──────────┬──────────┘
                     │ Consulta / Persiste
                     ▼
          ┌─────────────────────┐
          │    lib/supabase.js  │ ◄─── Conexão Singleton
          └──────────┬──────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │ Supabase PostgreSQL │
          │   (BaaS na Nuvem)   │
          └─────────────────────┘
```

---

## 📦 Módulos do Sistema

### Backend (`backend/src/modules/`)

| Domínio | Responsabilidade |
| :--- | :--- |
| **`auth/`** | Autenticação dos porteiros pelo número do crachá corporativo. |
| **`empresas/`** | Cadastro, busca e validação de CNPJ das empresas terceirizadas prestadoras de serviço. |
| **`pessoas/`** | Gestão de colaboradores vinculados às empresas, documentos e validação na portaria. |
| **`registros/`** | Motor principal do sistema: Controle de entrada/saída de equipamentos, lotes de ferramentas, capturas de fotos e assinaturas. |
| **`shared/`** | Utilitários transversais de formatação e tratamento unificado de erros de validação Zod. |

### Frontend (`frontend/src/modules/`)

| Módulo | Hook Principal | Responsabilidade |
| :--- | :--- | :--- |
| **`auth/`** | `useAuth()` | Gerencia autenticação de operadores e persistência da sessão na portaria. |
| **`registros/`** | `useRegistros()` | Orquestra consultas de equipamentos na planta, histórico e filtros de busca em tempo real. |

---

## 📂 Estrutura de Pastas

```text
sistema-portaria/
├── backend/
│   ├── src/
│   │   ├── lib/
│   │   │   └── supabase.js              # Conexão singleton
│   │   ├── modules/                     # Domínios de negócio
│   │   │   ├── auth/                    
│   │   │   ├── empresas/                
│   │   │   ├── pessoas/                 
│   │   │   ├── registros/               
│   │   │   └── shared/                  
│   │   └── routes/                      # Controladores finos HTTP
│   │       ├── auth.routes.js
│   │       ├── empresas.routes.js
│   │       ├── pessoas.routes.js
│   │       └── registros.routes.js
│   ├── app.js                           # Entry point principal
│   ├── package.json
│   └── .env.example                     # Modelo de ambiente
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/                  # Modais e Componentes Reutilizáveis
│   │   ├── lib/
│   │   │   └── api.js                   # Instância Axios com Proxy
│   │   ├── modules/                     # Hooks por Domínio (auth, registros)
│   │   ├── pages/                       # Login e Dashboard
│   │   ├── utils/                       # Gerador de PDF e utilitários globais
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js                   # Configuração de Proxy para localhost:10000
│   └── package.json
└── README.md
```

---

## 💻 Instalação e Configuração Local

### Pré-requisitos
* **Node.js**: v18+ ou v20+
* **NPM**: v9+
* Conexão com a internet para sincronização com o **Supabase**.

### 1. Configurar o Ambiente do Backend
Crie um arquivo `.env` dentro da pasta `backend/` baseando-se no modelo:
```bash
cp backend/.env.example backend/.env
```
Preencha as variáveis de ambiente:
```env
PORT=10000
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 2. Instalar Dependências
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Executar em Desenvolvimento

**No Windows PowerShell:**
```powershell
# Terminal 1 — Backend (Porta 10000)
cd backend; npm run dev

# Terminal 2 — Frontend (Porta 5173 com proxy para 10000)
cd frontend; npm run dev
```

Acesse no navegador: **`http://localhost:5173`**

---

## 🚢 Deploy e Produção

No ambiente de produção, o servidor Express (rodando `app.js`) atua como servidor completo, servindo os arquivos estáticos compilados do frontend localizados em `frontend/dist/` e expondo todos os endpoints sob a rota `/api`.

Para efetuar o build estático do frontend antes do deploy:
```bash
cd frontend
npm run build
```

---

© 2026 **TI Infraestrutura — Videplast Indústria de Embalagens Ltda.**  
Todos os direitos reservados. Uso restrito e interno.