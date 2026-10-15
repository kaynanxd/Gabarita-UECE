# Passagem de contexto — conclusão do banco de questões UECE

Este arquivo orienta a próxima LLM a continuar o trabalho sem reconstruir nem
corromper o acervo já produzido. Leia primeiro o [README.md](README.md), este
arquivo e os scripts em `scripts/question-bank/`.

## Objetivo e escopo

Concluir o banco local de questões dos vestibulares UECE de **2015.1 a 2023.2**,
nas duas fases, com enunciados, alternativas, resposta documentada e imagens de
auditoria. O recorte está em `scope.json`.

Não implemente backend, Prisma, interface, resoluções pedagógicas ou geração de
questões nesta etapa. O resultado canônico é o conjunto JSONL em `data/`.

## Estado confirmado

Em 14 de outubro de 2026, a validação registrou:

```text
212 documentos de origem preservados
17 edições
382 provas
5286 questões canônicas
5286 ocorrências
```

As edições concluídas são exclusivamente de primeira fase:

| Edição | Questões canônicas | Gabarito | Observação |
| --- | ---: | --- | --- |
| 2015.1 | 72 | `PRELIMINARY` | formato histórico de 60 questões; não foi localizado definitivo |
| 2015.2 | 72 | `OFFICIAL` | formato histórico de 60 questões |
| 2016.1 | 72 | `PRELIMINARY` | formato histórico de 60 questões; não foi localizado definitivo |
| 2016.2 | 72 | `PRELIMINARY` | formato histórico de 60 questões; não foi localizado definitivo |
| 2017.1 | 86 | `OFFICIAL` | formato histórico de 70 questões; questão 61 alterada no gabarito definitivo |
| 2017.2 | 86 | `PRELIMINARY` | formato histórico de 70 questões; não foi localizado definitivo |
| 2018.1 | 86 | `PRELIMINARY` | formato histórico de 70 questões; não foi localizado definitivo |
| 2018.2 | 86 | `PRELIMINARY` | formato histórico de 70 questões; não foi localizado definitivo |
| 2019.1 | 96 | `PRELIMINARY` | formato histórico de 80 questões; não foi localizado definitivo |
| 2019.2 | 96 | `PRELIMINARY` | formato histórico de 80 questões; não foi localizado definitivo |
| 2020.1 | 96 | `OFFICIAL` | formato histórico de 80 questões; anuladas 40, 62 e 72 |
| 2021.1 | 101 | `PRELIMINARY` | anulada 47; não foi localizado definitivo |
| 2022.2 | 101 | `OFFICIAL` | formato de 85 questões |
| 2023.1 | 101 | `PRELIMINARY` | não foi localizado definitivo |
| 2023.2 | 101 | `OFFICIAL` | formato de 85 questões |

Todas as edições de 2015.1 a 2023.2 estão completas nas duas fases. A primeira
fase registra os formatos históricos de 60, 70, 80 e 85 itens; a segunda fase
registra todas as disciplinas, inclusive pares combinados. Os lotes mantêm
`PRELIMINARY` ou `OFFICIAL` conforme o documento de origem.

O extrator trata cadernos combinados de 40 itens sem misturar disciplinas:
os itens impressos 01--20 e 21--40 se tornam duas provas de 20 itens, cada uma
com IDs normalizados (`q01`--`q20`) e a fonte PDF rastreável. O parser reconhece
`NULA` como anulação documentada.

O total pode parecer maior que a prova individual porque as questões 78--85
(ou 73--80 em 2020.1) existem separadamente para Espanhol, Francês e Inglês.
Cada candidato responde somente a uma língua.

## Arquivos e papéis

```text
question-bank/
├── README.md                 # modelo e decisões gerais
├── HANDOFF.md                # este guia
├── scope.json                # recorte ativo
├── schemas/                  # contratos JSON Schema
├── formats/                  # formatos conhecidos
└── data/                     # JSONL e PNGs gerados; ignorados pelo Git

scripts/question-bank/
├── inventory.mjs             # inventário e hashes dos PDFs
├── profile-pdfs.py           # classifica texto nativo/OCR
├── extract-paper.py          # unidade de extração por disciplina
├── extract-general-phase.py  # orquestra a primeira fase
├── extract-2023-2.py         # lote legado específico de 2023.2
├── validate.mjs              # valida referências e regras do dataset
└── run-python.mjs            # usa .venv-question-bank de forma reprodutível
```

Os arquivos gerados relevantes são `exams.jsonl`, `papers.jsonl`,
`questions.jsonl`, `occurrences.jsonl`, `answer-keys.jsonl` e `assets.jsonl`.
Os PNGs ficam em `data/assets/`.

## Regras que não devem ser quebradas

1. Não apague, sobrescreva manualmente ou recrie todo o `data/` para tratar uma
   edição. Os extratores fazem *upsert* por prefixo da prova; reexecutar o lote
   da mesma edição é seguro.
2. Não invente gabaritos. Sem fonte que contenha a tabela completa, a edição
   deve permanecer pendente. Comunicados de recursos só podem complementar
   anulações/alterações depois que existe um gabarito-base rastreável.
3. Preserve `question` separado de `occurrence`: a questão é canônica e a
   ocorrência guarda número, ordem das alternativas e caderno G1--G4.
4. Não converta a resposta para uma letra fixa. A resposta canônica usa o ID da
   alternativa; a letra é própria da ocorrência/caderno.
5. Não exclua PDFs do acervo `UECE/`, inclusive duplicados. O manifesto guarda
   hashes e duplicidades justamente para rastreabilidade.
6. Todo texto, resposta e imagem precisa apontar para a origem PDF. Extrações
   incertas mantêm avisos e `PENDING_REVIEW`, nunca são "corrigidas" por IA.
7. Não trate todo ano como formato de 85 questões. A primeira fase 2020.1 tem
   80 questões e não possui Educação Física.

## Como executar e validar

No PowerShell, use `npm.cmd` (o `npm.ps1` pode ser bloqueado pela política de
execução):

```powershell
npm.cmd run questions:validate
npm.cmd run questions:profile
```

O ambiente Python esperado é `.venv-question-bank`. Caso ele não exista, leia
`scripts/question-bank/run-python.mjs` antes de alterar dependências; PyMuPDF é
o componente usado para texto e renderização. Não use OCR enquanto o perfil
indicar `NATIVE_TEXT` utilizável.

Após cada mudança ou lote, execute:

```powershell
npm.cmd run questions:validate
npm.cmd run lint
git diff --check
```

O lint já possui avisos preexistentes de imports não usados em `src/app/page.tsx`
e `src/components/ValidationForm.tsx`; não são falhas do banco.

## Lotes já reexecutáveis

```powershell
npm.cmd run questions:extract:2020.1
npm.cmd run questions:extract:2019.1
npm.cmd run questions:extract:2019.2
npm.cmd run questions:extract:2018.1
npm.cmd run questions:extract:2018.2
npm.cmd run questions:extract:2017.2
npm.cmd run questions:extract:2017.1
npm.cmd run questions:extract:2016.1
npm.cmd run questions:extract:2016.2
npm.cmd run questions:extract:2015.1
npm.cmd run questions:extract:2015.2
npm.cmd run questions:extract:2021.1
npm.cmd run questions:extract:2022.2
npm.cmd run questions:extract:2023.1
npm.cmd run questions:extract:2023.2
```

2020.1 usa `--layout 80`. O seu gabarito está em um comunicado de 657 páginas;
o extrator foi otimizado para ler somente as primeiras dez páginas, onde está o
Anexo I com os gabaritos. Não reverta essa otimização.

O leitor de gabaritos já cobre dois layouts:

- páginas por idioma com blocos sequenciais 30/30/25, comuns nas provas de 85;
- blocos de vinte respostas, presentes em 2020.1.

## Próximo trabalho recomendado

1. Faça revisão humana amostral das questões `PENDING_REVIEW`, priorizando
   avisos de extração e questões com múltiplas regiões ou imagens.
2. Para ampliar o recorte, restaure ou obtenha os PDFs de origem antes de novos
   lotes: o Git não guarda os 212 documentos locais.
3. Consulte `data/manifests/documents.jsonl` e confirme o conteúdo interno do
   PDF antes de criar formatos. Nunca associe respostas só pelo nome do arquivo.

## Lacunas conhecidas e evidência disponível

Não há lacunas de cobertura na V1. Os 212 documentos locais são todos
referenciados por questões, ocorrências, eventos de resposta ou imagens. A
pendência é qualitativa: revisão humana dos registros `PENDING_REVIEW`.

## Inspeção rápida de PDF

Exemplo seguro no PowerShell (ajuste somente o caminho):

```powershell
$env:PYTHONIOENCODING = 'utf-8'
.\.venv-question-bank\Scripts\python.exe -c "import pymupdf; p=pymupdf.open(r'CAMINHO.pdf'); print(len(p)); print(p[0].get_text('text', sort=True))"
```

Para o comunicado de 2021.1, comece procurando expressões como `Gabarito
Oficial Definitivo`, `Gabarito 1` e `Anexo`; só promova as respostas se a tabela
completa estiver efetivamente no documento.

## Definição de pronto

O banco V1 está pronto: cada edição no recorte possui provas/fases extraídas,
cada ocorrência possui origem e `QUESTION_CROP`, todo gabarito vem de documento
identificado e `questions:validate` termina sem erros. A revisão humana dos
registros `PENDING_REVIEW` é a próxima etapa e deve ser registrada.
