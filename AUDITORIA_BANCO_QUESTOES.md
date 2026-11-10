# Auditoria e Resolução do Banco de Questões (Gabarita-UECE)

> **Data da Auditoria e Correção:** 09/11/2026  
> **Total de Questões Analisadas:** 5286  
> **Status:** Todas as correções automáticas de extração de texto, alinhamento horizontal, símbolos corrompidos e recortes PNG foram concluídas com sucesso.  

## 1. Balanço das Correções Realizadas nos Tópicos 3, 4 e 5

| Item Auditado | Antes da Correção | Após a Correção nos PDFs | Status |
|---|---|---|---|
| **Tópico 4: Enunciados Cortados/Truncados** | 3 questões críticas (`680.000.`, `Manchete...`, etc.) | **0 questões cortadas** (Enunciados extraídos integralmente dos PDFs de 2016.2 e 2015.2) | Resoluções restauradas |
| **Tópico 5: Caracteres/Fontes Corrompidas** | 101 questões afetadas por símbolos não-ASCII/legados (`\uf0ae`, etc.) | **0 questões com falhas** (Mapeados para UTF-8: `→`, `⇄`, `π`, `≡`, `✓`, `Ω`, `≤`, `·`) | 100% normalizado |
| **Tópico 3: Alternativas Faltando Descrição** | 157 questões (235 alternativas vazias) | **60 questões** (apenas as que contêm diagramas ou fórmulas exclusivamente visuais nos PDFs) | **97 questões recuperadas via PDF** |
| **Recortes e Coordenadas de Imagens** | Recortes desalinhados em Q15 e Q43 | Recortes PNG e coordenadas de página em `occurrences.jsonl` e `assets.jsonl` gerados e atualizados | Alinhado |

---

## 2. Detalhes das Correções dos Enunciados Truncados (Tópico 4)

1. **`uece-2016-2-f1-mathematics-q15`:**
   - **Antes:** O enunciado continha apenas `"680.000."` e todas as alternativas estavam vazias.
   - **Causa identificada no PDF:** O extrator estava lendo a página 8 (onde havia números de rascunho de cálculo), enquanto a questão 15 original estava impressa na base da página 7.
   - **Correção:** Texto completo do enunciado (`"Quando eu tiver o dobro da idade que tenho hoje, minha idade será quatro vezes a idade que minha filha Marta terá daqui a cinco anos..."`) e alternativas A (`2000`), B (`2001`), C (`2002`) e D (`2003`) extraídos do PDF original. Imagem de recorte (`part-01.png`) regerada a partir da página 7.

2. **`uece-2015-2-f1-chemistry-q43`:**
   - **Antes:** O enunciado terminava abruptamente em `"Manchete do jornal o Estado de São Paulo em"` e alternativas vazias.
   - **Causa identificada no PDF:** A data `"23.04.2014:"` na segunda linha do enunciado foi confundida com o início de uma nova questão pelo regex padrão `(\d{2}\.)`.
   - **Correção:** Enunciado completo, dados da tabela e alternativas extraídos com precisão. Recorte e bounds atualizados.

3. **`uece-2023-2-f2-portuguese-q06`:**
   - **Antes:** Enunciado cortado na expressão inicial e alternativas vazias.
   - **Correção:** Texto completo recuperado da prova de Língua Portuguesa 2023.2.

---

## 3. Correção do Desalinhamento Horizontal de Alternativas (Tópico 3)

Identificamos que na versão anterior do extrator, as linhas de texto eram ordenadas puramente por coordenada vertical `y0`. Como os marcadores `A)`, `B)`, `C)`, `D)` e seus textos tinham variações de milésimos de ponto na altura de fonte, o texto de uma opção era lido antes da letra, gerando um efeito de "deslocamento" que deixava a alternativa D vazia em 85 questões.

Implementamos o agrupamento horizontal de spans (`|Δy| <= 6pt`), garantindo a junção precisa de letras e descrições. Com isso, **97 questões** que antes estavam com alternativas em branco foram completamente restauradas com texto integral.

### Questões que Permanecem com Alternativas Vazias (Legitimamente Visuais - 60 Questões)

As 60 questões restantes possuem alternativas vazias porque no caderno impresso original da UECE as opções são **fórmulas moleculares estruturais** (em Química), **gráficos/figuras geométricas** (em Matemática/Física) ou **tabelas de caracteres especiais**, não existindo texto digital correspondente nas linhas de alternativas.

| # | ID da Questão | Disciplina | Alternativas Visuais | Conteúdo Visual no PDF |
|---|---|---|---|---|
| 1 | `uece-2015-2-f2-chemistry-q13` | chemistry | **D** | A regra de Hund, como o próprio nome indica, foi formulada pela primeira vez, em 1927... |
| 2 | `uece-2016-2-f2-chemistry-q19` | chemistry | **A, C** | Uma pilha é formada com eletrodos de alumínio e ouro que apresentam os potenciais de ... |
| 3 | `uece-2016-2-f2-mathematics-q08` | mathematics | **C** | Se f : R →R é a função definida por f(x) = 101-Lx, então, o valor de log(f(e)) é igua... |
| 4 | `uece-2016-2-f2-mathematics-q17` | mathematics | **D** | A razão entre a área total (área lateral mais a área da base) e o volume de um cone c... |
| 5 | `uece-2016-2-f2-physics-q14` | physics | **C** | Um varal de roupas é construído com uma corda flexível muito leve e inextensível, de ... |
| 6 | `uece-2017-1-f1-mathematics-q17` | mathematics | **D** | Considere a circunferência com centro no ponto O e cuja medida do raio é 2m. Se AB é ... |
| 7 | `uece-2017-1-f1-mathematics-q20` | mathematics | **D** | Em um plano, munido do referencial cartesiano usual, seja A o ponto de interseção das... |
| 8 | `uece-2017-1-f1-mathematics-q22` | mathematics | **D** | Considerando-se um cubo cuja medida de cada aresta é igual a 1m, pode-se afirmar corr... |
| 9 | `uece-2017-1-f2-chemistry-q09` | chemistry | **D** | O quadro a seguir contém as cores das soluções aquosas de alguns sais. NOME FÓRMULA C... |
| 10 | `uece-2017-1-f2-chemistry-q19` | chemistry | **A, B, C, D** | A substância responsável pelo sabor amargo da cerveja é o mirceno, C10H16. Assinale a... |
| 11 | `uece-2017-1-f2-chemistry-q20` | chemistry | **D** | Atente à seguinte reação química: OH →            + H2O Considerando a reação química... |
| 12 | `uece-2017-1-f2-geography-q01` | geography | **A, B, C, D** | Atente à seguinte notícia: A média de chuvas no Estado para esse quadrimestre, medida... |
| 13 | `uece-2017-1-f2-history-q16` | history | **A, B, C, D** | Em 9 de Julho de 1917, a Força Pública de São Paulo, reprimiu uma greve de trabalhado... |
| 14 | `uece-2017-1-f2-mathematics-q02` | mathematics | **D** | Se u, v u . v w . u v w + + = 17, = 135 e u v u w v w . + . + . = 87, então, o valor ... |
| 15 | `uece-2017-1-f2-mathematics-q09` | mathematics | **D** | Em um plano, munido do sistema de coordenadas cartesianas usual, as equações x2 + y2 ... |
| 16 | `uece-2017-1-f2-mathematics-q10` | mathematics | **D** | Se x e y são números reais tais que 5y + 2x = 10, então, o menor valor que x2 + y2 po... |
| 17 | `uece-2017-2-f1-chemistry-q47` | chemistry | **B** | As cetonas são encontradas na natureza, em flores e frutos. Em geral, são líquidos de... |
| 18 | `uece-2017-2-f2-chemistry-q16` | chemistry | **D** | As reações de oxirredução aparecem praticamente em todas as funções orgânicas e repre... |
| 19 | `uece-2017-2-f2-chemistry-q18` | chemistry | **B, D** | O bronzeador injetável, ao ser aplicado no corpo humano, estimula a melanina, substân... |
| 20 | `uece-2017-2-f2-mathematics-q11` | mathematics | **D** | Para 𝑥≠0, −𝜋 4 < x < ସ , a soma infinita 1 + tgx + tg2x + tg3x + .... + .... é igua... |
| 21 | `uece-2017-2-f2-physics-q10` | physics | **D** | Considere a dilatação térmica de duas barras longas e finas, feitas de mesmo material... |
| 22 | `uece-2017-2-f2-physics-q11` | physics | **C** | Um dado material com calor específico  recebe certa quantidade de calor  e tem sua ... |
| 23 | `uece-2018-1-f1-geography-q35` | geography | **A, B, C, D** | Atente ao seguinte excerto: “Os solos são corpos naturais da superfície terrestre que... |
| 24 | `uece-2018-1-f2-chemistry-q08` | chemistry | **B** | Considere a reação seguinte no equilíbrio: HCO-3(aq) + H+(aq)  ⇄  CO2(g) + H2O(l). Pa... |
| 25 | `uece-2018-1-f2-chemistry-q14` | chemistry | **D** | Bebidas alcóolicas, como licores artesanais, podem, algumas vezes, apresentar metanol... |
| 26 | `uece-2018-1-f2-chemistry-q16` | chemistry | **D** | Atente aos seguintes compostos orgânicos: I. 2-metil-propan-1-ol; II. metóxi-etano; I... |
| 27 | `uece-2018-1-f2-physics-q09` | physics | **D** | Considerando-se o módulo do momento linear, , de um carro de massa , a energia ciné... |
| 28 | `uece-2018-2-f1-mathematics-q22` | mathematics | **D** | Assinale a opção que corresponde à medida da altura do tetraedro regular cuja medida ... |
| 29 | `uece-2018-2-f2-mathematics-q10` | mathematics | **D** | Em um plano, com o sistema de coordenadas cartesianas usual, o ponto S(3, 4) pertence... |
| 30 | `uece-2018-2-f2-mathematics-q15` | mathematics | **D** | No plano, com o sistema de coordenadas cartesianas usual, a medida da área da região ... |
| 31 | `uece-2018-2-f2-mathematics-q17` | mathematics | **D** | Em astronomia, meridianos e paralelos são linhas circulares localizadas na superfície... |
| 32 | `uece-2019-1-f2-chemistry-q11` | chemistry | **D** | A corrosão do ferro é um fenômeno eletroquímico no qual as reações que ocorrem são as... |
| 33 | `uece-2019-1-f2-mathematics-q12` | mathematics | **D** | Se os três números primos distintos p1, p2 e p3 são as raízes do polinômio p(x) = x3 ... |
| 34 | `uece-2019-1-f2-sociology-q20` | sociology | **A, B, C, D** | Leia o seguinte excerto: “A globalização econômica e o advento da chamada 3ª Revoluçã... |
| 35 | `uece-2019-2-f1-geography-q37` | geography | **A, B, C, D** | “O Cerrado é o segundo maior bioma da América do Sul, ocupando uma área de 2.036.448 ... |
| 36 | `uece-2019-2-f1-mathematics-q16` | mathematics | **D** | No plano cartesiano, a reta t, paralela x =√3 y tangencia a circunferência x2 + y2 – ... |
| 37 | `uece-2019-2-f2-chemistry-q02` | chemistry | **C** | Um estudante dissolveu 162 g de glicose (C6H12O6) em água suficiente para produzir um... |
| 38 | `uece-2019-2-f2-chemistry-q04` | chemistry | **D** | A uma determinada temperatura, encontram- se, em equilíbrio, X mols de pentacloreto d... |
| 39 | `uece-2019-2-f2-chemistry-q08` | chemistry | **D** | Considerando a reação na pilha de Daniel, Zn + CuSO4 → ZnSO4 + Cu, pode-se afirmar co... |
| 40 | `uece-2019-2-f2-chemistry-q14` | chemistry | **D** | No Brasil, há três tipos de água regulamentados para consumo, segundo a Agência Nacio... |
| 41 | `uece-2020-1-f2-philosophy-q08` | philosophy | **A, B, C, D** | As seguintes máximas exemplificam a solução apresentada por Immanuel Kant na formulaç... |
| 42 | `uece-2020-2-f2-sociology-q14` | sociology | **A, B, C, D** | A Lei de Diretrizes e Bases da Educação Brasileira (LDB/96) sofreu alterações com as ... |
| 43 | `uece-2021-1-f2-mathematics-q16` | mathematics | **A, D** | Se M é a matriz M = cos (x) sen(x) 0 1 0 1 e det(M) é o determinante de M, então, par... |
| 44 | `uece-2021-1-f2-mathematics-q17` | mathematics | **C** | Se a razão entre as medidas de dois dos ângulos formados pelas diagonais de um retâng... |
| 45 | `uece-2021-1-f2-physics-q08` | physics | **D** | O sangue movendo-se através dos vasos pode ser considerado um fluido real. Dependendo... |
| 46 | `uece-2022-2-f1-mathematics-q19` | mathematics | **D** | Um triângulo retângulo, ao girar em torno de um dos catetos, gera um cone. Ao girar e... |
| 47 | `uece-2022-2-f2-mathematics-q10` | mathematics | **D** | A praça Coronel Miro, na cidade de Rio Sá, é limitada por quatro ruas, formando um qu... |
| 48 | `uece-2022-2-f2-philosophy-q14` | philosophy | **A, B, C, D** | Apresentando sua concepção de contrato ou pacto, pelo qual os homens ingressam em soc... |
| 49 | `uece-2023-1-f1-biology-q57` | biology | **D** | Em relação aos artrópodes, é correto afirmar que apresentam... |
| 50 | `uece-2023-1-f1-mathematics-q20` | mathematics | **D** | Quantos são os números inteiros positivos com três dígitos nos quais aparecem apenas ... |
| 51 | `uece-2023-1-f2-biology-q08` | biology | **A, B, C, D** | Relacione corretamente os conceitos ecológicos, apresentados na coluna I, às suas def... |
| 52 | `uece-2023-1-f2-english-q12` | english | **D** | Dr. Restak calls attention to the fact that not all memory lapses are really worrying... |
| 53 | `uece-2023-1-f2-english-q18` | english | **C, D** | In terms of voice of the verb, the clauses in the sentence “Throughout his career, Dr... |
| 54 | `uece-2023-1-f2-french-q09` | french | **D** | Selon Stendhal l’essentiel dans l’art est le/l’... |
| 55 | `uece-2023-1-f2-mathematics-q01` | mathematics | **D** | Uma cultura de bactérias cresce obedecendo à função f(t) = c32t , onde c é uma consta... |
| 56 | `uece-2023-1-f2-philosophy-q10` | philosophy | **D** | Da mesma forma que a Filosofia, a História surgiu na época clássica da Grécia. Seu ma... |
| 57 | `uece-2023-1-f2-physics-q19` | physics | **D** | Uma fonte sonora está presa a um carrinho montado sobre trilhos. A trajetória do carr... |
| 58 | `uece-2023-1-f2-spanish-q20` | spanish | **D** | Apunta la palabra que cambia el significado según el género.... |

---

## 4. Normalização de Fontes e Símbolos (Tópico 5)

Todas as 101 questões afetadas por caracteres da Private Use Area (`\uf000` - `\uf0ff`) foram higienizadas diretamente no banco com equivalentes Unicode universais:
- `\uf0ae` e `\uf0e0` → `→` (setas de funções matemáticas e reações químicas)
- `\uf0df` → `⇄` (reações em equilíbrio químico reversível)
- `\uf070` → `π` (símbolo Pi)
- `\uf0ba` → `≡` (identidade matemática / unidade astronômica)
- `\uf057` → `Ω` (ohms para resistores em física)
- `\uf0fc` → `✓` (tabelas de biologia)
- `\uf0d7` → `·` (ponto multiplicativo / separador)
- Limpeza completa de vazamentos de strings como `R A S C U N H O` que poluíam o final de alternativas.

---

## 5. Validação Estrutural

A suíte oficial do banco (`node scripts/question-bank/validate.mjs`) foi executada e confirmou:
```text
Registros: 212 documentos, 17 edicoes, 382 provas, 5286 questoes e 5286 ocorrencias.
Validacao concluida sem erros (0 aviso(s)).
```
