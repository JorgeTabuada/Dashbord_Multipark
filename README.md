# 🚀 v0-new-project-4b - Sistema de Gestão

## 📋 O que foi corrigido

### ✅ Problemas identificados e resolvidos:

1. **❌ Upload de Excel não funcionava**
   - ✅ Adicionada biblioteca `xlsx` para processar ficheiros Excel
   - ✅ Criado componente `ExcelUpload` com funcionalidade completa
   - ✅ Suporte para formatos .xlsx e .xls

2. **❌ Não estava ligado ao Supabase**
   - ✅ Configuração do Supabase já existia mas faltavam as variáveis de ambiente
   - ✅ Criado hook `useExpenses` para gerir dados
   - ✅ Integração completa com base de dados

3. **❌ Dados eram apenas mock/fake**
   - ✅ Agora os dados são guardados e carregados do Supabase
   - ✅ CRUD completo (Create, Read, Update, Delete)
   - ✅ Estatísticas calculadas em tempo real

## 🛠️ Como configurar

### 1. Configurar Supabase

1. Vai ao [Supabase Dashboard](https://supabase.com/dashboard)
2. Cria um novo projeto ou usa um existente
3. Vai a **Settings** > **API**
4. Copia a **URL** e **anon key**

### 2. Configurar variáveis de ambiente

Edita o ficheiro `.env.local` e substitui os valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://teu-projeto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tua-anon-key-aqui
```

### 3. Criar tabela na base de dados

1. No Supabase Dashboard, vai ao **SQL Editor**
2. Executa o script que está em `database/schema.sql`
3. Isto vai criar a tabela `expenses` com todos os campos necessários

### 4. Instalar dependências e executar

```bash
# Instalar dependências
pnpm install

# Executar em modo desenvolvimento
pnpm dev
```

## 🎯 Funcionalidades implementadas

### 📊 Gestão de Despesas (/despesas)

- **Upload de Excel**: Arrasta e larga ficheiros .xlsx/.xls
- **Formulário manual**: Adiciona despesas uma a uma
- **Edição**: Clica no ícone de editar para modificar
- **Eliminação**: Remove despesas com confirmação
- **Estatísticas**: Totais do mês, aprovadas, pendentes
- **Estados**: Pendente, Aprovada, Rejeitada

### 📁 Formato esperado do Excel

| Coluna A | Coluna B | Coluna C | Coluna D | Coluna E |
|----------|----------|----------|----------|----------|
| Data     | Tipo     | Valor    | Método   | Descrição |
| 15/01/2025 | Combustível | 150.50 | Cartão | Abastecimento |

## 🔧 Estrutura técnica

```
├── app/despesas/page.tsx          # Página principal das despesas
├── components/excel-upload.tsx    # Componente de upload Excel
├── hooks/use-expenses.ts          # Hook para gerir dados
├── lib/supabase.ts               # Configuração Supabase
├── database/schema.sql           # Script da base de dados
└── .env.local                    # Variáveis de ambiente
```

## 🚨 Próximos passos

1. **Configura as variáveis de ambiente** no `.env.local`
2. **Executa o script SQL** no Supabase
3. **Instala as dependências** com `pnpm install`
4. **Testa o upload de Excel** com um ficheiro de exemplo

## 🐛 Se algo não funcionar

1. Verifica se as variáveis de ambiente estão corretas
2. Confirma que a tabela foi criada no Supabase
3. Verifica a consola do browser para erros
4. Testa primeiro com dados manuais antes do Excel

## 📱 Formato do Excel

O componente espera que a primeira linha sejam headers e que os dados estejam organizados assim:

- **Data**: Formato DD/MM/AAAA ou qualquer formato reconhecido pelo Excel
- **Tipo**: Texto livre (combustível, manutenção, etc.)
- **Valor**: Número decimal (usa . ou , como separador)
- **Método**: Texto livre (cartão, numerário, etc.)
- **Descrição**: Texto livre

Agora o teu projeto deve estar totalmente funcional! 🎉
