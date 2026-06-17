<div align="center">

# FinanceControl
Transforme comprovantes e recibos em inteligência financeira com o poder da IA — em segundos.
</div>

## 📌 Sobre o Projeto

O **FinanceControl** é uma aplicação web completa que permite gerenciar suas finanças pessoais de forma inovadora e com o auxílio de Inteligência Artificial. Com ele, você não precisa mais digitar gastos manualmente: basta enviar fotos ou PDFs dos seus comprovantes, e o sistema (utilizando a API do Google Gemini) irá extrair, ler e categorizar automaticamente suas transações, oferecendo insights valiosos sobre sua saúde financeira.

## 🚀 Funcionalidades Principais

- **Upload e Extração por IA (OCR)**: Envie comprovantes, notas fiscais, recibos e boletos (PDF, JPEG, PNG). A IA extrai automaticamente os dados cruciais como Data, Valor, Estabelecimento e a Categoria adequada para o gasto.
- **Dashboard Financeiro Dinâmico**: Acompanhe de forma visual o total de seus gastos no mês, visualize gráficos de distribuição por categoria (Donut Chart) e veja em tempo real o seu gasto contra o planejado na sua meta orçamentária.
- **Gestão de Metas Orçamentárias**: Crie limites de gastos (orçamentos) por categorias, acompanhe a evolução do consumo através de barras de progresso e receba dicas geradas automaticamente.
- **Assistente Financeiro IA (Chat)**: Um consultor integrado que conhece todas as suas transações. Ele pode responder perguntas sobre seus hábitos de consumo, ajudar a criar novas metas ou simplesmente dar conselhos baseados na sua carteira real.
- **Planilha de Transações**: Interface tabular robusta para visualizar, editar em tempo real (inline-edit) e remover seus lançamentos, com filtros rápidos por categorias.
- **Exportação de Dados**: Geração instantânea de Relatórios Executivos em PDF e exportação de todas as transações cadastradas no formato CSV (compatível com Excel).

## 🛠 Stack Técnica

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion (para transações e microinterações), Lucide React (Ícones SVG).
- **Backend API**: Node.js com Express e TypeScript (`tsx`).
- **Banco de Dados**: SQLite gerenciado via **Prisma ORM**.
- **Inteligência Artificial**: Integração direta com o Google Gemini (via `@google/genai` SDK) para processamento de imagens (OCR) multimodal e processamento de linguagem natural (Chat).

## ⚙️ Como Rodar o Projeto Localmente

**Pré-requisitos**:
- Node.js (v18+)
- Uma chave da API válida do [Google Gemini (Google AI Studio)](https://aistudio.google.com/)

**Passo a Passo**:

1. **Clone o repositório e instale as dependências**:
   ```bash
   npm install
   ```

2. **Configuração do Banco de Dados**:
   O banco SQLite já vem mapeado pelo Prisma. Para garantir que as tabelas estejam criadas e atualizadas, rode:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Configuração das Variáveis de Ambiente**:
   Crie ou edite o arquivo `.env.local` na raiz do projeto contendo a sua chave da API:
   ```env
   GEMINI_API_KEY="sua_chave_da_api_aqui"
   ```
   *(Dica: Caso prefira, a interface web do FinanceControl também possui uma aba de "Configurações" onde a chave pode ser inserida e testada em tempo real)*.

4. **Inicie o Servidor de Desenvolvimento**:
   Um único comando iniciará o Backend (Porta 3001) e o Frontend (Porta 3000) de forma simultânea.
   ```bash
   npm run dev
   ```

5. **Acesse a Aplicação**:
   Abra no seu navegador: [http://localhost:3000](http://localhost:3000)

---

### 🧩 Estrutura do Sistema (Arquitetura)

- `/src` - Código fonte do frontend (React). Dividido em `/components` de UI, `/pages` para cada aba do painel e gerenciamento de estado global.
- `/server` - API backend construída em Node/Express. Responsável por receber os prompts, intermediar os uploads de imagens (`multer`), se comunicar de forma segura com o Gemini e gerenciar os endpoints de banco de dados.
- `/prisma` - Definições e schema (`schema.prisma`) do banco SQLite, contendo os modelos `Transaction`, `Goal` (Metas) e `ChatMessage` (Histórico da IA).
