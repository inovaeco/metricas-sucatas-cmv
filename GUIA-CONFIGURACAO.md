# 🚀 GUIA COMPLETO - Sistema CMV INOVA ECOPEÇAS

## 📋 PASSO A PASSO PARA CONFIGURAÇÃO ONLINE

### 1️⃣ BAIXAR O CÓDIGO
1. Clique no botão **"Download Code"** no canto superior direito
2. Escolha **"Create new project"** 
3. Aguarde o download do arquivo ZIP
4. Extraia o arquivo em uma pasta no seu computador

### 2️⃣ CONFIGURAR GITHUB
1. Acesse [github.com](https://github.com) e faça login
2. Clique em **"New repository"**
3. Nome: `sistema-cmv-inova-ecopecas`
4. Marque como **Public** ou **Private** (sua escolha)
5. Clique **"Create repository"**

### 3️⃣ SUBIR CÓDIGO PARA GITHUB
1. Abra o terminal/prompt na pasta do projeto
2. Execute os comandos:
\`\`\`bash
git init
git add .
git commit -m "Sistema CMV INOVA ECOPEÇAS - versão inicial"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/sistema-cmv-inova-ecopecas.git
git push -u origin main
\`\`\`

### 4️⃣ CONFIGURAR SUPABASE
1. Acesse [supabase.com](https://supabase.com)
2. Clique **"Start your project"** → **"New project"**
3. Nome: `inova-ecopecas-cmv`
4. Senha do banco: **anote essa senha!**
5. Região: **South America (São Paulo)**
6. Clique **"Create new project"**

### 5️⃣ EXECUTAR SCRIPTS SQL
1. No Supabase, vá em **"SQL Editor"**
2. Clique **"New query"**
3. Cole o conteúdo do arquivo `scripts/01-create-tables.sql`
4. Clique **"Run"**
5. Repita com `scripts/02-seed-data.sql`

### 6️⃣ CONFIGURAR VERCEL
1. Acesse [vercel.com](https://vercel.com)
2. Clique **"New Project"**
3. Conecte sua conta GitHub
4. Selecione o repositório `sistema-cmv-inova-ecopecas`
5. Clique **"Deploy"**

### 7️⃣ CONECTAR SUPABASE NO VERCEL
1. No Vercel, vá em **"Settings"** → **"Environment Variables"**
2. Adicione as variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL`: (copie do Supabase → Settings → API)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (copie do Supabase → Settings → API)
3. Clique **"Save"**
4. Vá em **"Deployments"** → **"Redeploy"**

### 8️⃣ TESTAR O SISTEMA
1. Acesse a URL do seu projeto no Vercel
2. Cadastre uma sucata de teste
3. Registre uma venda
4. Verifique se os dados aparecem no dashboard

## ✅ RESULTADO FINAL
- ✅ Sistema online 24/7
- ✅ Acesso de qualquer dispositivo
- ✅ Dados sincronizados em tempo real
- ✅ Backup automático no Supabase
- ✅ URL personalizada no Vercel

## 🆘 SUPORTE
Se tiver dúvidas:
1. Verifique se todas as variáveis estão corretas
2. Confirme se os scripts SQL foram executados
3. Teste a conexão com o banco no Supabase

## 📱 ACESSO MÓVEL
O sistema é responsivo e funciona perfeitamente em:
- 📱 Celulares
- 📱 Tablets  
- 💻 Computadores
- 🖥️ Smart TVs com navegador

**Pronto! Seu sistema CMV está online e funcionando! 🎉**
