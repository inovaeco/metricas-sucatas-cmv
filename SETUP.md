# Sistema CMV - INOVA ECOPEÇAS
## Guia de Configuração Completa

### 1. Configuração do Supabase

#### 1.1 Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma nova organização ou use uma existente
4. Clique em "New Project"
5. Preencha:
   - Nome: `inova-ecopecas-cmv`
   - Database Password: (crie uma senha forte)
   - Region: South America (São Paulo)
6. Clique em "Create new project"

#### 1.2 Executar Scripts SQL
1. No painel do Supabase, vá para "SQL Editor"
2. Execute o script `scripts/01-create-tables.sql`
3. Execute o script `scripts/02-seed-data.sql`

#### 1.3 Configurar Variáveis de Ambiente
1. No painel do Supabase, vá para "Settings" > "API"
2. Copie:
   - Project URL
   - anon/public key
3. No seu projeto, crie um arquivo `.env.local`:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=sua_project_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
\`\`\`

### 2. Deploy no Vercel

#### 2.1 Conectar ao GitHub
1. Faça push do código para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "Import Project"
4. Selecione seu repositório

#### 2.2 Configurar Variáveis de Ambiente no Vercel
1. Na página de configuração do projeto no Vercel
2. Adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Clique em "Deploy"

### 3. Configuração da Integração Supabase no v0

#### 3.1 Adicionar Integração
1. No v0, vá para "Project Settings"
2. Clique em "Integrations"
3. Adicione "Supabase"
4. Cole a URL e a chave do seu projeto

### 4. Funcionalidades do Sistema

#### 4.1 Cadastro de Sucatas
- Marca, Modelo, Ano, Custo, Data de Entrada, Lote
- Listagem com filtros
- Edição e exclusão

#### 4.2 Registro de Vendas
- Seleção de sucata
- Nome da peça, valor, data, canal de venda
- Vinculação automática ao CMV

#### 4.3 Dashboard
- Métricas de CMV por sucata
- Gráficos interativos
- Análise de lucro/prejuízo
- Relatórios por período

### 5. Uso Simultâneo
O sistema suporta uso simultâneo em múltiplos dispositivos através do Supabase, com sincronização em tempo real.

### 6. Backup e Segurança
- Dados armazenados no Supabase (PostgreSQL)
- Backups automáticos
- SSL/TLS para todas as conexões
- Autenticação e autorização configuráveis

### 7. Suporte
Para dúvidas ou problemas, consulte:
- Documentação do Supabase: [docs.supabase.com](https://docs.supabase.com)
- Documentação do Vercel: [vercel.com/docs](https://vercel.com/docs)
