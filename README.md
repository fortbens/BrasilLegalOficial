# Brasil Legal — Regularização Imobiliária & Gestão de Ativos

> Plataforma integrada de Regularização Imobiliária Extrajudicial, CRM Técnico Registral, Gestão Documental por Inteligência Artificial (Google Gemini), Emissão de Boletos e Splits Bancários, Assinatura Eletrônica e Programa Indique & Ganhe B2B.

---

## 🏛️ Sobre o Projeto

A **Brasil Legal** é uma solução completa voltada a proprietários, incorporadores, corretores de imóveis, topógrafos, engenheiros e advogados para saneamento fundiário ágil, usucapião extrajudicial (Provimento 65 do CNJ e Lei 13.465/2017) e regularização de matrículas cartorárias.

### 🚀 Principais Módulos & Recursos

1. **Site Institucional & Página de Vendas Pública:**
   - Landing page com diagnóstico registral em 4 minutos;
   - Seções dinâmicas configuráveis via CMS integrado (Hero, Serviços, Como Funciona, Blog, Depoimentos, Dúvidas);
   - Link direto e integrado para o **Programa Indique e Ganhe** com link de indicação parametrizado (`?ref=`);
   - Botão flutuante do WhatsApp e canal oficial de contato: `atendimento@brasillegal.com.br`.

2. **Programa Indique e Ganhe B2B:**
   - Comissionamento automático de 5% a 10% por imóvel regularizado via Pix;
   - Gerador de link de indicação exclusivo para parceiros com cópia rápida e compartilhamento direto via WhatsApp;
   - Painel do parceiro com extrato de indicações, comissões pendentes e pagas.

3. **CRM Técnico & Comercial Registral:**
   - Funil de vendas (Leads, Triagem Notarial, Topografia/RTK, Protocolo em Cartório, Matrícula Emitida);
   - Gestão de contatos, negócios e imóveis com histórico temporal.

4. **Auditoria Documental & Inteligência Notarial com Google Gemini:**
   - Extração automática de dados de matrículas imobiliárias, certidões de ônus e contratos de gaveta;
   - Comparativo de minutas contratuais e identificação automática de inconsistências registrais.

5. **Assinatura Eletrônica de Contratos & Splits Bancários:**
   - Emissão e gestão de contratos com validade jurídica (ICP-Brasil / MP 2.200-2/2001);
   - Split automático de honorários e custas cartorárias entre parceiros e empresa.

6. **Identidade Visual & White-Label:**
   - Logo oficial da Brasil Legal com versões clara, escura e ícone;
   - Seletor de cores, personalização de CSS e persistência integral das configurações.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React, Motion (Framer Motion), Recharts
- **Backend:** Node.js, Express, ESBuild, TSX
- **Inteligência Artificial:** Google Gen AI SDK (`@google/genai`)
- **Build Tool:** Vite 6

---

## 📋 Pré-requisitos

- **Node.js:** Versão 18.0.0 ou superior (recomendado Node 20+)
- **NPM:** Versão 9 ou superior

---

## ⚙️ Instalação e Execução Local

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/brasil-legal.git
   cd brasil-legal
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Copie o arquivo de exemplo e defina suas chaves:
   ```bash
   cp .env.example .env
   ```
   Variáveis suportadas:
   - `GEMINI_API_KEY`: Chave da API do Google Gemini (obtenha em [Google AI Studio](https://aistudio.google.com)).
   - `PORT`: Porta do servidor (padrão: `3000`).

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a aplicação em `http://localhost:3000`.

---

## 🏗️ Build para Produção

Para gerar os arquivos estáticos e empacotar o backend:

```bash
npm run build
```

Para rodar o servidor em produção:

```bash
npm start
```

---

## 🌐 URLs de Acesso

- **Site Institucional Público:** `http://localhost:3000/#site` (ou `?view=site` / `/site`)
- **Tela de Autenticação / Login:** `http://localhost:3000/#login` (Single Sign-On com Google e credenciais corporativas)
- **Painel Operacional CRM / ERP:** `http://localhost:3000/#painel` (acesso restrito a colaboradores autorizados)

---

## 👥 Gestão Multiusuário e Perfis de Acesso

- **Usuário Principal / Administrador Geral:** Emerson Carneiro (`diretorcarneiro@gmail.com`)
- **Autenticação:**
  - Login tradicional (e-mail e senha corporativa)
  - **Login com Conta Google** (Google SSO para e-mails `@gmail.com` e Google Workspace)
  - Cadastro manual de colaboradores pelo Administrador com envio automático de e-mail de boas-vindas e convite de primeiro acesso

---

## 📞 Contato & Suporte Institucional

- **Diretor Responsável:** Emerson Carneiro
- **E-mail Oficial:** [diretorcarneiro@gmail.com](mailto:diretorcarneiro@gmail.com)
- **WhatsApp Oficial:** [+55 11 99864-2424](https://wa.me/5511998642424) (11 998642424)
- **Horário de Atendimento:** Segunda a Sexta das 8h às 18h

---

© 2026 Brasil Legal Soluções Imobiliárias e Registrais Ltda. Todos os direitos reservados.
