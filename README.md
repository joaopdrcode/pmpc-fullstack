# PMPC — Plataforma de Monitoramento de Preços de Combustível

Plataforma para **gestão e visualização de preços** (produtos, fornecedores e registos de preço por litro), com área web (dashboard, comparativo, cadastro) e API REST.

---

## Stack principal — frontend


| Camada        | Tecnologias                              |
| ------------- | ---------------------------------------- |
| **Linguagem** | TypeScript                               |
| **Framework** | Next.js 16 (App Router), React 19        |
| **Estilos**   | Tailwind CSS 4                           |
| **Gráficos**  | Recharts                                 |
| **Tooling**   | ESLint 9 (`eslint-config-next`), PostCSS |


Estrutura: páginas em `frontend/app/`, componentes em `frontend/components/`, serviços HTTP em `frontend/services/`, utilitários em `frontend/lib/`.

---

## Stack principal — backend


| Camada            | Tecnologias                                |
| ----------------- | ------------------------------------------ |
| **Linguagem**     | JavaScript (Node.js)                       |
| **Runtime**       | Node com `node --watch` em desenvolvimento |
| **HTTP**          | Express 4                                  |
| **Base de dados** | Cliente `pg` (node-postgres)               |
| **Configuração**  | dotenv                                     |


API montada em `/api/v1` (ex.: `/api/v1/produtos`, `/api/v1/precos`).

---

## Stack — base de dados


| Item              | Detalhe                                                                                |
| ----------------- | -------------------------------------------------------------------------------------- |
| **SGBD**          | PostgreSQL 16 (imagem Docker `postgres:16-alpine`)                                     |
| **Migrações**     | `db/schema.sql`, aplicado automaticamente pelo serviço `migrate` no Docker Compose |
| **Administração** | Adminer (serviço opcional no Docker, porta 8080)                                       |


---

## Como rodar o projeto

### Clonar

```bash
git clone <url-do-repositorio>
cd pmpc
```

### Variáveis de ambiente

Na raiz existe `.env.example`. Para o fluxo abaixo basta criar `frontend/.env.local` (ex.: `NEXT_PUBLIC_API_URL=http://localhost:3001`).

### Início rápido

```bash
npm install
npm run stack
```

`npm run stack` (com o Docker Desktop rodando): na raiz do repositório, executa `docker compose up -d` (Postgres, aplicação do `db/schema.sql` pelo serviço de migração do Compose, Adminer e backend em containers), espera até a API responder em `http://127.0.0.1:3001/api/v1/health` e inicia o Next.js em modo desenvolvimento com `npm run dev --workspace=frontend`, ficando o terminal associado a esse processo.

Requisitos: **Docker** com **Docker Compose** **v2.20+** (comando `docker compose`) e Node.js **18+**. Ficheiro `frontend/.env.local` com `NEXT_PUBLIC_API_URL` (ver `.env.example`).

### Parar o projeto

- `Ctrl+C` no terminal onde corre `npm run stack` — interrompe só o **Next.js**, os containers Docker continuam em execução.
- `npm run db:down` ou `docker compose down` na raiz — para a stack Docker (Postgres, Adminer, backend, etc.). O script `db:down` corresponde a `docker compose down`.

---

## Pontos em aberto (perguntas de um formulário)

1. **Filtro do endpoint** `GET /precos` — Foram acrescentados filtros por fornecedor, data inicial e final, valor mínimo e máximo, para aumentar as possibilidades de pesquisa: usar uma data ou valor fixos, ou intervalos (mínimo / máximo) conforme necessidade.
2. **Mesmo fornecedor, mesmo produto, mais do que um registo no mesmo dia** — Mantêm-se **todos** os registos no histórico (é possível ver todos os lançamentos). No **gráfico** e no **dashboard**, considera-se o **último registo desse fornecedor nesse dia** (evita duplicar pontos no mesmo eixo temporal com o mesmo significado de “preço vigente” naquele dia).

