# 🎓 Gabarita UECE — Plataforma de Apoio ao Vestibulando

> **Projeto de Extensão 4 — Universidade Estadual do Ceará (UECE)**  
> Uma plataforma digital aberta, gratuita e direcionada para auxiliar estudantes na preparação completa para a **1ª e 2ª fase do vestibular da UECE**.

🔗 **Acesse o site em produção:** [https://gabarita-uece.vercel.app/](https://gabarita-uece.vercel.app/)

---

## 📌 1. A Proposta do Projeto

O **Gabarita UECE** nasce com o propósito de democratizar o acesso a materiais de estudo com curadoria de alto nível, além de oferecer ferramentas inteligentes voltadas estritamente para o perfil de cobrança da banca examinadora da UECE (**CEV/UECE**).

### 🎯 O Problema (Hipótese em Validação)
Muitos vestibulandos enfrentam barreiras como:
1. **Dispersão de materiais**: Dificuldade em encontrar provas anteriores organizadas, gabaritos oficiais, resoluções comentadas e estatísticas dos conteúdos mais recorrentes.
2. **Desafios da 2ª Fase e Redação**: Dificuldade em treinar redação com correções rápidas baseadas nos critérios reais da UECE (gêneros textuais específicos como crônica, artigo de opinião e carta argumentativa).
3. **Acessibilidade**: Falta de alternativas gratuitas de qualidade para estudantes de escolas públicas ou que estudam por conta própria.

---

## 🚀 2. Módulos da Plataforma

```
Gabarita UECE
├── 📚 Módulo 1: Acervo de Estudos Curado
│   ├── Provas anteriores da UECE com gabaritos oficiais
│   ├── Questões organizadas por disciplina, ano e recorrência
│   ├── Resoluções e explicações detalhadas passo a passo
│   └── Filtros por 1ª Fase e Específicas da 2ª Fase
│
└── 🤖 Módulo 2: Assistente de Inteligência Artificial
    ├── Geração de questões inéditas no formato padrão de 4 alternativas (A, B, C, D)
    ├── Tira-dúvidas contextualizado com os conteúdos do edital
    └── Simulador e análise de redação baseada nos critérios da banca examinadora
```

---

## 🛠️ 3. Arquitetura Técnica & Tecnologias

A aplicação adota uma arquitetura fullstack unificada (Monorepo), otimizando tempo de desenvolvimento, custos de infraestrutura e performance.

| Camada | Tecnologia | Justificativa |
| :--- | :--- | :--- |
| **Front-end** | [Next.js (App Router)](https://nextjs.org/) + [React](https://react.dev/) | Interface moderna, rápida, responsiva para web e mobile (Server Components). |
| **Estilização** | [TailwindCSS v4](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/) | Design system contemporâneo com tema escuro, glassmorphism e microinterações. |
| **Back-end** | [Next.js Serverless Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) | APIs serverless escaláveis sem necessidade de manter servidores dedicados. |
| **Banco de Dados** | [PostgreSQL (Neon.tech)](https://neon.tech/) | Banco relacional serverless gratuito hospedado na região de São Paulo (`sa-east-1`). |
| **ORM** | [Prisma ORM](https://www.prisma.io/) | Modelagem de dados com tipagem estrita no TypeScript e migrações declarativas. |
| **Hospedagem & CI/CD** | [Vercel](https://vercel.com/) | Deploy contínuo integrado ao GitHub com distribuição global e HTTPS nativo. |

---

## 💻 4. Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 20 ou superior)
- **npm** (incluso com o Node.js)
- Conta gratuita no [Neon.tech](https://neon.tech/) para o banco PostgreSQL (ou PostgreSQL local)

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/kaynanxd/Gabarita-UECE.git
   cd Gabarita-UECE
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Configurar as variáveis de ambiente:**
   Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```
   Preencha o `.env` com a sua URL do banco PostgreSQL:
   ```env
   DATABASE_URL="postgresql://usuario:senha@ep-xyz-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"
   DIRECT_URL="postgresql://usuario:senha@ep-xyz.sa-east-1.aws.neon.tech/neondb?sslmode=require"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Sincronizar as tabelas do banco de dados:**
   ```bash
   npx prisma db push
   ```

5. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🗄️ 5. Comandos Úteis do Prisma ORM

- **Visualizar dados em interface gráfica:**
  ```bash
  npx prisma studio
  ```
  *(Abre o painel em `http://localhost:5555` para ver/editar tabelas)*

- **Regenerar tipagens TypeScript:**
  ```bash
  npx prisma generate
  ```

- **Criar nova migração:**
  ```bash
  npx prisma migrate dev --name nome_da_alteracao
  ```

---

## 📁 6. Estrutura do Repositório

```
Gabarita-UECE/
├── .env.example                    # Modelo de variáveis de ambiente
├── prisma/
│   └── schema.prisma               # Modelos do banco (Users, Subjects, Exams, Questions, etc.)
├── public/
│   └── question-assets/            # Assets das questões (figures/, crops/, texts/ e manifest.json)
├── question-bank/                  # Acervo estruturado em JSONL (2015.1 a 2023.2) e schemas
├── scripts/question-bank/          # Scripts de extração, normalização e validação
├── src/
│   ├── app/                        # App Router (Páginas, Acervo, Prática e APIs Serverless)
│   │   ├── acervo/                 # Visualização de provas por edição, fase e disciplina
│   │   ├── praticar/               # Simulados e modo treino
│   │   ├── api/
│   │   │   ├── health/             # Endpoint de healthcheck da API
│   │   │   ├── questions/          # Endpoint de consulta de questões
│   │   │   └── validation/         # Endpoint da pesquisa de escuta ativa
│   │   ├── globals.css             # Design tokens e classes globais
│   │   ├── layout.tsx              # Root Layout e metadados SEO
│   │   └── page.tsx                # Landing Page da plataforma
│   ├── components/                 # Componentes de interface reutilizáveis
│   │   ├── ArchiveQuestionViewer.tsx # Visualizador de questões no Acervo
│   │   ├── PracticeApp.tsx         # Aplicação interativa de simulados/treino
│   │   ├── QuestionVisuals.tsx     # Renderização de textos de apoio, figuras e recortes
│   │   └── ValidationForm.tsx      # Formulário de escuta dos vestibulandos
│   └── lib/
│       ├── prisma.ts               # Singleton do Prisma Client
│       └── question-bank.ts        # Loader do acervo e mapeamento de assets visuais
├── AUDITORIA_BANCO_QUESTOES.md     # Relatório de auditoria e correções do banco
├── package.json
└── tsconfig.json
```

---

## ✅ 7. Estado do Banco de Questões & Assets

O banco textual conta com **5.286 questões canônicas** (edições **2015.1 a 2023.2**, 1ª e 2ª fase), validadas sem erros via `node scripts/question-bank/validate.mjs` após higienização de enunciados truncados, alinhamento de alternativas e normalização de símbolos matemáticos/químicos legados.

Os recursos visuais e textos-base compartilhados estão extraídos em `public/question-assets/` e integrados ao carregamento ([question-bank.ts](src/lib/question-bank.ts)) e à exibição ([QuestionVisuals.tsx](src/components/QuestionVisuals.tsx), [ArchiveQuestionViewer.tsx](src/components/ArchiveQuestionViewer.tsx) e [PracticeApp.tsx](src/components/PracticeApp.tsx)):

```text
public/question-assets/
├── manifest.json   # Índice por questionId: { figures, crops }
├── figures/        # 83 figuras de enunciados (mapas, charges, gráficos, tabelas, estruturas)
├── crops/          # 3 recortes de questões de Química com alternativas visuais
└── texts/          # 214 textos-base compartilhados (135 provas de Línguas, 1.948 questões em index.json)
```

- **Ordem de exibição na interface:** Texto de apoio (com numeração de linhas preservada) -> Enunciado -> Figuras/recortes -> Alternativas.
- **Scripts de extração e validação:** `scripts/question-bank/extract-visual-assets.py`, `scripts/question-bank/extract-shared-texts.py` e `scripts/question-bank/validate.mjs`.

---

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos e educacionais como parte do **Projeto de Extensão Universitária**.
