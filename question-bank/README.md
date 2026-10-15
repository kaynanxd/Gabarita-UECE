# Banco de questoes da UECE

Este diretorio contem a especificacao e as ferramentas do acervo estruturado de
questoes do vestibular da UECE. O banco e independente do backend: os arquivos
JSONL sao a fonte canonica e poderao ser importados para PostgreSQL/Prisma em uma
etapa posterior.

## Recorte ativo

O banco ativo abrange o vestibular da UECE de **2015.1 a 2023.2**, nas duas
fases. O recorte esta documentado em `scope.json` e inclui somente provas,
gabaritos e comunicados necessarios para estruturar essas edicoes.

Documentos anteriores a 2015 continuam intactos em `UECE/` como acervo bruto,
mas nao sao perfilados ou extraidos pelo pipeline atual. Essa escolha evita que
provas muito antigas, com programa e formato potencialmente defasados, afetem o
banco destinado ao estudo contemporaneo.

## Objetivo

Para cada questao, o acervo deve preservar:

- enunciado e alternativas;
- resposta oficial e historico do gabarito;
- disciplina, area, ano, semestre e fase;
- ocorrencia em cada versao do caderno (`G1` a `G4`);
- PDF, pagina e coordenadas de origem;
- recorte integral da questao e figuras associadas;
- metodo, confianca e estado de revisao da extracao.

Nao fazem parte desta etapa explicacoes, dificuldade pedagogica, resolucoes por
IA ou integracao com a interface da aplicacao.

## Estado da V1

O acervo estruturado esta completo no recorte de **2015.1 a 2023.2**: 17
edicoes, primeira e segunda fases, **382 provas**, **5.286 questoes** e 5.286
ocorrencias. Cada questao possui PDF de origem, pagina/regiao rastreavel e ao
menos um recorte PNG. A validacao estrutural termina sem erros ou avisos.

Os PDFs brutos e os JSONL/PNGs gerados ficam locais e sao ignorados pelo Git.
O repositorio versiona scripts, formatos, schemas e documentacao; para
reconstruir o acervo e necessario disponibilizar os PDFs de origem em
`UECE/VESTIBULAR UECE_/1 PROVAS E GABARITOS/`.

## Organizacao oficial da prova

O Edital No 05/2026-CEV/UECE, que regulamenta o Vestibular 2027.1,
estabelece o formato usado como referencia atual.

### Primeira fase

A Prova de Conhecimentos Gerais tem 85 questoes, quatro alternativas (A-D),
uma unica resposta correta e valor de 2 pontos por questao, totalizando 170
pontos.

| Area | Disciplina | Questoes |
| --- | --- | ---: |
| Ciencias Humanas | Filosofia | 5 |
| Ciencias Humanas | Geografia | 8 |
| Ciencias Humanas | Historia | 8 |
| Ciencias Humanas | Sociologia | 5 |
| Ciencias da Natureza e Matematica | Biologia | 8 |
| Ciencias da Natureza e Matematica | Fisica | 8 |
| Ciencias da Natureza e Matematica | Matematica | 10 |
| Ciencias da Natureza e Matematica | Quimica | 8 |
| Linguagens e Codigos | Educacao Fisica | 5 |
| Linguagens e Codigos | Lingua estrangeira escolhida | 8 |
| Linguagens e Codigos | Lingua Portuguesa | 12 |

As linguas Espanhola, Francesa e Inglesa sao disciplinas distintas no banco.
A soma de 85 considera somente uma delas por candidato.

### Segunda fase

A segunda fase possui uma Redacao, com valor de 60 pontos, e tres provas
especificas. Cada prova especifica tem 20 questoes, vale 60 pontos e atribui 3
pontos a cada questao.

| Grupo de cursos | Provas especificas |
| ---: | --- |
| 1 | Biologia, Fisica e Quimica |
| 2 | Matematica, Fisica e Quimica |
| 3 | Matematica, Geografia e Historia |
| 4 | Lingua Portuguesa, Geografia e Historia |
| 5 | Lingua Inglesa, Geografia e Historia |
| 6 | Lingua Francesa, Geografia e Historia |
| 7 | Lingua Espanhola, Geografia e Historia |
| 8 | Lingua Portuguesa, Filosofia e Sociologia |

As regras variam ao longo dos anos. Por isso, quantidades e pontuacoes pertencem
ao registro da edicao/prova, e nao sao constantes globais do sistema.

## Decisoes de modelagem

### Questao canonica e ocorrencia

A UECE pode produzir ate quatro gabaritos com as mesmas questoes e alternativas
em posicoes diferentes. Assim:

- `question` guarda o conteudo intelectual da questao;
- `occurrence` guarda numero, letras e posicao em um caderno especifico;
- a resposta canonica aponta para o ID da alternativa, nunca somente para uma
  letra;
- `correctLabel` e derivado da ordem das alternativas naquela ocorrencia.

Essa separacao evita quatro copias da mesma questao e permite conferir os
gabaritos G1-G4.

### Gabaritos

O historico nao e sobrescrito. Cada publicacao gera um evento em `answerKeys`,
com os estados:

- `PRELIMINARY`: gabarito preliminar;
- `OFFICIAL`: gabarito oficial definitivo;
- `CHANGED`: resposta alterada apos recurso;
- `ANNULLED`: questao anulada;
- `UNAVAILABLE`: resposta ainda nao localizada.

Quando uma questao e anulada, a anulacao e associada a questao canonica e vale
para suas ocorrencias correspondentes nos demais cadernos.

### Imagens

Cada ocorrencia deve ter um `QUESTION_CROP`, isto e, o recorte integral da
questao renderizado a partir do PDF. Figuras isoladas sao armazenadas como
`FIGURE` quando a separacao e confiavel. Textos, tabelas ou imagens usados por
mais de uma questao sao `SHARED_CONTEXT`.

Os binarios ficam fora dos JSONL. Os registros guardam caminho relativo, hash,
dimensoes, pagina e coordenadas no PDF. Uma questao pode ter varias regioes e
varios recortes quando atravessa colunas ou paginas.

### Rastreabilidade e revisao

Nenhum texto sem origem entra no conjunto final. Cada ocorrencia aponta para o
documento, pagina e caixa delimitadora que a originou. Extracoes duvidosas ficam
em `PENDING_REVIEW` ou `REJECTED`, sem completar o conteudo por adivinhacao.

## Estrutura

```text
question-bank/
|-- README.md
|-- formats/                  # regras conhecidas por edicao
|-- schemas/                  # JSON Schemas dos registros
`-- data/                     # saida gerada, ignorada pelo Git
    |-- manifests/
    |   |-- documents.jsonl
    |   `-- duplicates.json
    |-- exams.jsonl
    |-- papers.jsonl
    |-- questions.jsonl
    |-- occurrences.jsonl
    |-- answer-keys.jsonl
    `-- assets/
```

## Fluxo de processamento

1. Inventariar PDFs e calcular SHA-256; marcar o que pertence ao recorte ativo.
2. Separar prova, gabarito preliminar, gabarito definitivo e outros documentos.
3. Agrupar duplicados sem apagar os arquivos originais.
4. Extrair texto nativo; usar OCR apenas nas paginas sem texto utilizavel.
5. Segmentar questoes e alternativas conservando coordenadas.
6. Renderizar o recorte integral e extrair figuras quando possivel.
7. Identificar questoes equivalentes entre G1-G4.
8. Associar o gabarito e seu historico.
9. Validar estrutura, referencias e contagens esperadas.
10. Encaminhar inconsistencias para revisao humana.

## Comandos

Gerar o inventario dos PDFs:

```bash
npm run questions:inventory
```

Validar os JSONL existentes:

```bash
npm run questions:validate
```

Executar o lote piloto (Biologia, primeira fase de 2023.2):

```bash
npm run questions:extract:pilot
```

Extrair todas as disciplinas da primeira fase de 2023.2:

```bash
npm run questions:extract:2023.2
```

O piloto da segunda fase, com Biologia de 2015.2 (20 questoes, 3 pontos por
questao e gabarito definitivo), e executado com:

```bash
npm run questions:extract:2015.2:f2:biology
```

O mesmo piloto no ano seguinte, ainda com gabarito preliminar, pode ser
reproduzido com `npm run questions:extract:2016.1:f2:biology`.

O piloto de 2017.1 usa gabarito definitivo e pode ser executado com
`npm run questions:extract:2017.1:f2:biology`; a questao 20 de Biologia esta
anulada na fonte e e registrada como `ANNULLED`.

As disciplinas individuais da segunda fase podem ser agrupadas em um arquivo de
configuracao. Por exemplo, o primeiro dia completo de 2018.2 e executado com:

```bash
npm run questions:extract:2018.2:f2
```

Os cadernos combinados tambem sao suportados. O adaptador preserva a origem
unica de 40 itens, associando 01--20 a primeira disciplina e 21--40 a segunda,
mas normaliza cada prova no banco para 20 questoes. Os lotes ja configurados:

```bash
npm run questions:extract:2015.2:f2:day2
npm run questions:extract:2017.2:f2:day2
npm run questions:extract:2018.2:f2:day2
npm run questions:extract:2020.1:f2:day2
```

O ultimo inclui tambem Filosofia/Sociologia. A resposta e sempre lida do
gabarito correspondente ao segundo dia; nenhuma metade e inferida.

Os gabaritos tabulares usados a partir de 2023 tambem sao reconhecidos. O
leitor associa explicitamente a disciplina, o numero da questao e a coluna do
gabarito antes de gravar a resposta.

Na segunda fase, cada caderno combina Redacao e uma disciplina especifica. A
Redacao nao entra no banco objetivo; somente as 20 questoes de multipla escolha
sao extraidas. O leitor de gabarito seleciona o bloco da disciplina e o numero
do caderno, inclusive quando o documento reune varias disciplinas.

As primeiras fases atualmente automatizadas podem ser reprocessadas com:

```bash
npm run questions:extract:2022.2
npm run questions:extract:2020.1
npm run questions:extract:2019.1
npm run questions:extract:2019.2
npm run questions:extract:2018.1
npm run questions:extract:2018.2
npm run questions:extract:2017.2
npm run questions:extract:2017.1
npm run questions:extract:2016.1
npm run questions:extract:2016.2
npm run questions:extract:2015.1
npm run questions:extract:2015.2
npm run questions:extract:2021.1
npm run questions:extract:2023.1
npm run questions:extract:2023.2
```

Os lotes 2015.1, 2016.1, 2016.2, 2017.2, 2018.1, 2018.2, 2019.1, 2019.2, 2021.1 e 2023.1 possuem apenas gabarito preliminar no diretorio
analisado. Suas respostas sao gravadas como `PRELIMINARY` e nao sao promovidas
para `OFFICIAL` sem um documento definitivo de origem.

O lote 2020.1 usa o formato historico de 80 questoes: Filosofia ocupa as
questoes 63--67, Sociologia 68--72 e a lingua estrangeira 73--80. O comando
dedicado registra esse layout; portanto, ele nao cria artificialmente as cinco
questoes de Educacao Fisica presentes no formato posterior de 85 questoes.

O lote 2018.1 usa o formato historico de 70 questoes: nao possui Filosofia nem
Sociologia, e a lingua estrangeira ocupa as questoes 63--70.

Os lotes 2016.1 e 2016.2 usam o formato historico de 60 questoes: Lingua
Portuguesa ocupa 01--14, Matematica 15--24, cada ciencia 25--54 e a lingua
estrangeira 55--60.

Classificar tecnicamente todos os PDFs entre extracao nativa, OCR e revisao:

```bash
npm run questions:profile
```

O piloto usa PyMuPDF por meio do `uv`, em ambiente isolado no projeto. Na
primeira execucao a dependencia e baixada automaticamente.

Os comandos aceitam caminhos opcionais:

```bash
node scripts/question-bank/inventory.mjs "UECE/VESTIBULAR UECE_/1 PROVAS E GABARITOS" "question-bank/data"
node scripts/question-bank/validate.mjs "question-bank/data"
```

O inventario e idempotente: executa-lo novamente substitui apenas seus arquivos
gerados. Nenhum PDF de origem e modificado ou removido.

## Referencia normativa

- Edital No 05/2026-CEV/UECE, de 19 de agosto de 2026, itens 64, 74, 76 e
  105, e Anexos II e III.
- Arquivo local: `UECE/edital052026cev.pdf`.
- Publicacao oficial: <https://www.cev.uece.br/wp-content/uploads/2026/08/edital052026cev.pdf>.

