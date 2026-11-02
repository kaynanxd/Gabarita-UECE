# Auditoria Aprofundada do Banco de Questões (Gabarita-UECE)

> **Data da Auditoria:** 02/11/2026  
> **Total de Questões Analisadas:** 5286  
> **Escopo da Análise:** Textos do enunciado, alternativas vazias, símbolos corrompidos, textos-base ausentes e dependências visuais.  

## 1. Diagnóstico Geral do Banco

| Categoria de Problema | Quantidade | Impacto no Usuário |
|---|---|---|
| **Questões que exigem foto/recurso visual (Total)** | **203** | O usuário não consegue responder sem ver a imagem/recorte da prova. |
| ↳ *Necessitam de imagem nas alternativas* | 157 | Alternativas vazias no banco (`""`) pois continham imagens/fórmulas no PDF. |
| ↳ *Necessitam de imagem no enunciado* | 50 | Questões que dependem de figuras, mapas, tirinhas, gráficos ou tabelas. |
| ↳ *Necessitam de imagem em ambos simultaneamente* | 4 | Possuem tanto elemento visual no enunciado quanto opções puramente visuais. |
| **Itens de alternativas sem descrição (vazias)** | **235 opções** (em 157 questões) | Letras A, B, C ou D aparecem sem nenhum texto na tela. |
| **Enunciados truncados ou corrompidos** | **3 questões** | Enunciado cortado na extração (ex: apenas números ou frases interrompidas). |
| **Questões órfãs de Texto-Base (Línguas / Literatura)** | **824 questões** | O enunciado pergunta sobre *"o texto 1"*, *"o poema"* ou *"na linha 34"*, mas o texto comum não está no banco estruturado. |
| **Questões com caracteres de fonte corrompidos** | **31 questões** | Símbolos matemáticos/químicos como setas ou caixas não convertidas. |

### O Achado Mais Importante da Arquitetura
> ⚠️ **Aviso Crítico:** O frontend atual (`PracticeApp.tsx` e `ArchiveQuestionViewer.tsx`) renderiza **apenas texto puro** (`currentQuestion.statement` e `alternative.text`), **sem qualquer tag `<img>`** para carregar os recortes existentes em `question-bank/data/assets/`.
> Como consequência, **100% das 203 questões visuais e das 824 questões dependentes de textos-base** ficam incompletas ou impossíveis de resolver na interface atual, mesmo com as imagens prontas e perfeitas no disco!

---

## 2. Questões que Exigem Foto no Enunciado (50 Questões)

| # | ID da Questão | Disciplina | Elemento Necessário | Trecho do Enunciado |
|---|---|---|---|---|
| 1 | `uece-2015-1-f1-history-q30` | history | **Figura / Imagem / Ilustração** | Atente para o seguinte excerto: “Contudo, dois fatores ainda mais importantes solapavam agora a... |
| 2 | `uece-2015-1-f2-biology-q18` | biology | **Tabela / Quadro comparativo** | Através da respiração, os seres vivos extraem a energia armazenada nos alimentos para realizar ... |
| 3 | `uece-2015-1-f2-chemistry-q07` | chemistry | **Figura / Imagem / Ilustração** | A primeira bateria a gás do mundo, conhecida hoje como célula a combustível, foi inventada por ... |
| 4 | `uece-2015-1-f2-geography-q09` | geography | **Mapa geográfico / temático** | As escalas representam um elemento fundamental para a cartografia. Sua utilização baseia-se nas... |
| 5 | `uece-2015-2-f2-chemistry-q09` | chemistry | **Figura / Imagem / Ilustração** | Há cerca de dois mil e quinhentos anos, o filósofo grego Demócrito disse que se dividirmos a ma... |
| 6 | `uece-2016-1-f2-physics-q07` | physics | **Figura / Imagem / Ilustração** | O periscópio é um instrumento ótico de uso bastante difundido em submarinos. O instrumento é ut... |
| 7 | `uece-2016-2-f1-geography-q31` | geography | **Figura / Imagem / Ilustração** | Analise o seguinte trecho da música “Fotografia 3x4” do cantor cearense Belchior: Eu me lembro ... |
| 8 | `uece-2016-2-f2-biology-q11` | biology | **Tabela / Quadro comparativo** | O quadro abaixo foi construído por um professor de biologia, cujo objetivo era expor uma compar... |
| 9 | `uece-2016-2-f2-biology-q12` | biology | **Figura / Imagem / Ilustração** | Atente à seguinte representação química- estrutural de um aminoácido. Considerando a figura aci... |
| 10 | `uece-2016-2-f2-chemistry-q02` | chemistry | **Esquema / Diagrama** | Obtido pelo petróleo, o eteno é o alceno mais simples, porém muito importante por ser um dos pr... |
| 11 | `uece-2016-2-f2-chemistry-q04` | chemistry | **Esquema / Diagrama** | Um sistema heterogêneo G é constituído por uma solução verde claro e um sólido marrom. Esse sis... |
| 12 | `uece-2016-2-f2-physics-q02` | physics | **Figura / Imagem / Ilustração** | Os aparelhos de televisão que antecederam a tecnologia atual, de LED e LCD, utilizavam um tubo ... |
| 13 | `uece-2017-1-f2-chemistry-q09` | chemistry | **Tabela / Quadro comparativo** | O quadro a seguir contém as cores das soluções aquosas de alguns sais. NOME FÓRMULA COR Sulfato... |
| 14 | `uece-2017-1-f2-chemistry-q18` | chemistry | **Figura / Imagem / Ilustração** | Um estudante de química introduziu um chumaço de palha de aço no fundo de uma proveta e inverte... |
| 15 | `uece-2017-1-f2-geography-q09` | geography | **Mapa geográfico / temático** | Suponha que, devido a uma condição técnica, um mapa de geodiversidade do semiárido cearense, el... |
| 16 | `uece-2017-1-f2-mathematics-q08` | mathematics | **Tabela / Quadro comparativo** | O quadro numérico apresentado a seguir é construído segundo uma lógica estrutural. 1 3 5 7 9 ..... |
| 17 | `uece-2017-2-f2-chemistry-q13` | chemistry | **Tabela / Quadro comparativo** | Ao nosso redor, encontra-se uma grande diversidade de substâncias. Elas se diferenciam por aspe... |
| 18 | `uece-2017-2-f2-mathematics-q10` | mathematics | **Gráfico cartesiano / estatístico** | No plano, com o sistema de coordenadas cartesiano usual, a medida da área da região limitada pe... |
| 19 | `uece-2017-2-f2-portuguese-q20` | portuguese | **Figura / Imagem / Ilustração** | Atente às seguintes afirmações sobre as características do discurso da enunciadora, ou da figur... |
| 20 | `uece-2018-2-f1-history-q26` | history | **Figura / Imagem / Ilustração** | Há vários líderes cujos nomes estão associados à emancipação de diferentes países da América La... |
| 21 | `uece-2019-1-f2-geography-q12` | geography | **Figura / Imagem / Ilustração** | Relacione, corretamente, os principais conceitos da Geografia com suas interpretações mais reco... |
| 22 | `uece-2019-2-f1-geography-q38` | geography | **Mapa geográfico / temático** | Leia atentamente o seguinte excerto: “O mapa sempre foi um instrumento usado pelos homens para ... |
| 23 | `uece-2019-2-f1-physics-q40` | physics | **Figura / Imagem / Ilustração** | Um dispositivo eletrônico muito comum nos celulares tipo smart phones é o acelerômetro. Dentre ... |
| 24 | `uece-2019-2-f2-geography-q02` | geography | **Mapa geográfico / temático** | “Os cartógrafos trabalham com uma visão reduzida do território, sendo necessário indicar a prop... |
| 25 | `uece-2019-2-f2-mathematics-q03` | mathematics | **Tabela / Quadro comparativo** | No quadro abaixo, a cada linha L i está associado um número inteiro positivo, determinado segun... |
| 26 | `uece-2019-2-f2-philosophy-q08` | philosophy | **Figura / Imagem / Ilustração** | A filósofa brasileira Rosa Dias diz o seguinte sobre a filosofia da arte de Nietzsche: “[O] pon... |
| 27 | `uece-2019-2-f2-sociology-q14` | sociology | **Tirinha / Charge / Quadrinho** | Atente para a imagem a seguir. Disponível em: http://tv-video-edc.blogspot.com. Acesso em: 30 m... |
| 28 | `uece-2020-1-f1-mathematics-q14` | mathematics | **Tabela / Quadro comparativo** | Para cada número inteiro positivo n, as linhas do quadro abaixo são definidas segundo a estrutu... |
| 29 | `uece-2020-1-f1-mathematics-q18` | mathematics | **Gráfico cartesiano / estatístico** | No plano, com o sistema de coordenadas cartesianas usual, seja X a região limitada pelo gráfico... |
| 30 | `uece-2020-1-f2-mathematics-q09` | mathematics | **Tabela / Quadro comparativo** | Para cada número inteiro positivo n, as linhas do quadro abaixo são definidas segundo a estrutu... |
| 31 | `uece-2020-1-f2-sociology-q09` | sociology | **Tirinha / Charge / Quadrinho** | Considerando o tema burocracia, atente para a tirinha abaixo e para o texto apresentado em segu... |
| 32 | `uece-2020-1-f2-sociology-q18` | sociology | **Tirinha / Charge / Quadrinho** | No calendário oficial do Brasil, o dia 20 de novembro é o dia da Consciência Negra. A data faz ... |
| 33 | `uece-2020-2-f1-physical-education-q66` | physical-education | **Figura / Imagem / Ilustração** | A imagem corporal é o modo como o corpo se apresenta para a própria pessoa incluindo sensações ... |
| 34 | `uece-2020-2-f1-portuguese-q06` | portuguese | **Figura / Imagem / Ilustração** | Quanto aos trechos destacados nos versos: “carregar bandeira” (linha 03)/ “sua raiz vai ao meu ... |
| 35 | `uece-2020-2-f2-geography-q12` | geography | **Figura / Imagem / Ilustração** | Leia atentamente os seguintes excertos: “[...] as dinâmicas da natureza tornaram-se de tal modo... |
| 36 | `uece-2021-1-f1-philosophy-q71` | philosophy | **Figura / Imagem / Ilustração** | Referindo-se a Walter Benjamin, a filósofa Jeanne Marie Gagnebin afirma que “seu primeiro texto... |
| 37 | `uece-2021-1-f2-physics-q03` | physics | **Tabela / Quadro comparativo** | No dia 11 de maio de 2021, foi realizado o último teste do Telescópio Espacial Webb, cujo lança... |
| 38 | `uece-2021-1-f2-physics-q14` | physics | **Figura / Imagem / Ilustração** | Ao montar um aparato ótico, um estudante fez uso de uma lente delgada convergente de distância ... |
| 39 | `uece-2021-1-f2-sociology-q01` | sociology | **Figura / Imagem / Ilustração** | Partido Comunista, 1848, elaborado por Karl Marx e Friedrich Engels: “[...] A necessidade de me... |
| 40 | `uece-2022-1-f1-chemistry-q47` | chemistry | **Tabela / Quadro comparativo** | Observe o quadro abaixo, que mostra estudos realizados com a composição do ar que respiramos (i... |
| 41 | `uece-2022-1-f1-physics-q42` | physics | **Figura / Imagem / Ilustração** | Ao montar um experimento óptico em sala de aula, um professor de Física faz uso de um espelho c... |
| 42 | `uece-2022-1-f2-chemistry-q14` | chemistry | **Tabela / Quadro comparativo** | Um estudante de química promoveu algumas reações obtendo os resultados de acordo com a tabela a... |
| 43 | `uece-2022-1-f2-philosophy-q08` | philosophy | **Figura / Imagem / Ilustração** | “Começando por Homero, todos os poetas são imitadores da imagem da virtude e dos restantes assu... |
| 44 | `uece-2022-1-f2-physics-q07` | physics | **Gráfico cartesiano / estatístico** | Um sensor detecta oscilações na superfície da Terra e as transmite a um sismógrafo. Ao registra... |
| 45 | `uece-2022-2-f2-geography-q06` | geography | **Mapa geográfico / temático** | Durante a execução de projeto de pesquisa, foram elaborados dois mapas. O mapa 01, cuja escala ... |
| 46 | `uece-2022-2-f2-physics-q05` | physics | **Figura / Imagem / Ilustração** | Um estudante de Física da Universidade Estadual do Ceará, durante um experimento realizado com ... |
| 47 | `uece-2023-1-f2-chemistry-q10` | chemistry | **Tabela / Quadro comparativo** | Como o monóxido de carbono (CO) causa vários danos à saúde, sua presença no ar atmosférico deve... |
| 48 | `uece-2023-1-f2-philosophy-q03` | philosophy | **Figura / Imagem / Ilustração** | O filósofo, teólogo e padre cearense Manfredo Ramos, um grande estudioso do pensamento de Agost... |
| 49 | `uece-2023-1-f2-sociology-q12` | sociology | **Figura / Imagem / Ilustração** | Na história recente do Brasil, quando a juventude é tida como problema social, ela apareceu na ... |
| 50 | `uece-2023-2-f2-physics-q05` | physics | **Figura / Imagem / Ilustração** | A origem do uso dos espelhos pela raça humana data de 5 mil anos atrás na Suméria onde os espel... |

---

## 3. Questões com Alternativas Faltando Descrição (157 Questões / 235 Itens)

| # | ID da Questão | Disciplina | Opções Vazias | Trecho do Enunciado |
|---|---|---|---|---|
| 1 | `uece-2015-1-f1-mathematics-q17` | mathematics | **A, B, C, D** | Em um empreendimento imobiliário, o centro comercial e o parque de estacionamento ocu... |
| 2 | `uece-2015-1-f2-mathematics-q18` | mathematics | **D** | Um cone circular reto, cuja medida do raio da base é R, é cortado por um plano parale... |
| 3 | `uece-2015-1-f2-portuguese-q13` | portuguese | **D** | O dicionário Houaiss Eletrônico apresenta várias acepções para o vocábulo “coincidênc... |
| 4 | `uece-2015-2-f1-chemistry-q43` | chemistry | **A, B, C, D** | Manchete do jornal o Estado de São Paulo em... |
| 5 | `uece-2015-2-f1-chemistry-q46` | chemistry | **D** | Em 2015, a dengue tem aumentado muito no Brasil. De acordo com o Ministério da Saúde,... |
| 6 | `uece-2015-2-f2-biology-q12` | biology | **D** | Todas as células do sangue são originadas na medula óssea vermelha a partir das célul... |
| 7 | `uece-2015-2-f2-biology-q13` | biology | **D** | No que diz respeito à temperatura corpórea dos animais, assinale a opção que preenche... |
| 8 | `uece-2015-2-f2-chemistry-q01` | chemistry | **D** | A geometria molecular é o arranjo tridimensional dos átomos, que afeta muitas de suas... |
| 9 | `uece-2015-2-f2-chemistry-q13` | chemistry | **D** | A regra de Hund, como o próprio nome indica, foi formulada pela primeira vez, em 1927... |
| 10 | `uece-2015-2-f2-mathematics-q07` | mathematics | **D** | Em um sistema de coordenadas cartesiano usual as retas representadas pelas equações 3... |
| 11 | `uece-2015-2-f2-mathematics-q19` | mathematics | **D** | Um triângulo equilátero está inscrito em uma circunferência cuja medida do raio é igu... |
| 12 | `uece-2015-2-f2-physics-q10` | physics | **A, C** | Para efeitos de conta de luz, a bandeira tarifária para o mês de julho de 2015 é verm... |
| 13 | `uece-2015-2-f2-physics-q15` | physics | **C** | A energia elétrica sai das hidrelétricas por linhas de transmissão, que são basicamen... |
| 14 | `uece-2015-2-f2-portuguese-q10` | portuguese | **A, B, C, D** | Ela só matava a fome (  ) Causar lá em casa. sofrimento a; mortificar, afligir, ferir... |
| 15 | `uece-2015-2-f2-portuguese-q11` | portuguese | **A, B, C, D** | Os tios se mataram (  ) No futebol, para ver o rapaz amortecer o formado. impacto da ... |
| 16 | `uece-2016-1-f1-chemistry-q43` | chemistry | **D** | O verbete “laboratório” deriva da expressão latina labora et ora (trabalha e reza), i... |
| 17 | `uece-2016-1-f2-mathematics-q17` | mathematics | **D** | As diagonais de um retângulo dividem cada um de seus ângulos internos em dois ângulos... |
| 18 | `uece-2016-1-f2-physics-q17` | physics | **A, D** | Um ventilador de teto gira a uma velocidade angular de 420 rpm, tem 130 W de potência... |
| 19 | `uece-2016-1-f2-physics-q19` | physics | **D** | Considere um sistema em que as unidades fundamentais sejam força, cujo símbolo para s... |
| 20 | `uece-2016-2-f1-chemistry-q48` | chemistry | **D** | O sulfeto de cádmio é um sólido amarelo e semicondutor, cuja condutividade aumenta qu... |
| 21 | `uece-2016-2-f1-mathematics-q15` | mathematics | **A, B, C, D** | 680.000.... |
| 22 | `uece-2016-2-f1-mathematics-q17` | mathematics | **A, B, C, D** | Deseja-se construir um reservatório para armazenar água, que tenha capacidade suficie... |
| 23 | `uece-2016-2-f1-physics-q40` | physics | **D** | A força da gravidade sobre uma massa m acima da superfície e a uma distância d do cen... |
| 24 | `uece-2016-2-f1-portuguese-q14` | portuguese | **D** | Leia com atenção o trecho transcrito a seguir: “No caminho a menina pegou uma pedra e... |
| 25 | `uece-2016-2-f2-biology-q14` | biology | **D** | Assinale a opção que completa corretamente as lacunas do seguinte enunciado: “A fonte... |
| 26 | `uece-2016-2-f2-chemistry-q19` | chemistry | **A, C** | Uma pilha é formada com eletrodos de alumínio e ouro que apresentam os potenciais de ... |
| 27 | `uece-2016-2-f2-mathematics-q08` | mathematics | **C** | Se f : R R é a função definida por f(x) = 101-Lx, então, o valor de log(f(e)) é igua... |
| 28 | `uece-2016-2-f2-physics-q01` | physics | **D** | Considere uma massa puntiforme se deslocando em linha reta ao longo do eixo  de um s... |
| 29 | `uece-2016-2-f2-physics-q02` | physics | **C, D** | Os aparelhos de televisão que antecederam a tecnologia atual, de LED e LCD, utilizava... |
| 30 | `uece-2016-2-f2-physics-q09` | physics | **A, B, C, D** | Considere que a cabine de um elevador despenque sem atrito em queda livre de uma altu... |
| 31 | `uece-2016-2-f2-physics-q14` | physics | **C** | Um varal de roupas é construído com uma corda flexível muito leve e inextensível, de ... |
| 32 | `uece-2016-2-f2-physics-q16` | physics | **D** | Considerando a unidade de medida de temperatura o grau Celsius, a unidade de medida d... |
| 33 | `uece-2017-1-f1-mathematics-q17` | mathematics | **D** | Considere a circunferência com centro no ponto O e cuja medida do raio é 2m. Se AB é ... |
| 34 | `uece-2017-1-f1-physics-q42` | physics | **A, C** | A unidade de medida de energia utilizada usualmente pelas distribuidoras de energia e... |
| 35 | `uece-2017-1-f2-biology-q15` | biology | **A** | As células procariontes são reconhecidas como aquelas que não possuem material genéti... |
| 36 | `uece-2017-1-f2-biology-q17` | biology | **B** | Analise as afirmações abaixo e assinale com V as verdadeiras e com F as falsas. (    ... |
| 37 | `uece-2017-1-f2-chemistry-q09` | chemistry | **D** | O quadro a seguir contém as cores das soluções aquosas de alguns sais. NOME FÓRMULA C... |
| 38 | `uece-2017-1-f2-chemistry-q19` | chemistry | **A, B, C, D** | A substância responsável pelo sabor amargo da cerveja é o mirceno, C10H16. Assinale a... |
| 39 | `uece-2017-1-f2-chemistry-q20` | chemistry | **D** | Atente à seguinte reação química: OH →            + H2O Considerando a reação química... |
| 40 | `uece-2017-1-f2-geography-q01` | geography | **A, B, C, D** | Atente à seguinte notícia: A média de chuvas no Estado para esse quadrimestre, medida... |
| 41 | `uece-2017-1-f2-history-q16` | history | **A, B, C, D** | Em 9 de Julho de 1917, a Força Pública de São Paulo, reprimiu uma greve de trabalhado... |
| 42 | `uece-2017-1-f2-mathematics-q02` | mathematics | **D** | Se u, v u . v w . u v w   = 17, = 135 e u v u w v w .  .  . = 87, então, o valor ... |
| 43 | `uece-2017-1-f2-mathematics-q06` | mathematics | **A** | Se f é a função real de variável real definida por f(x) = log(4 – 	) + √4	 −	, entã... |
| 44 | `uece-2017-1-f2-mathematics-q09` | mathematics | **D** | Em um plano, munido do sistema de coordenadas cartesianas usual, as equações x2 + y2 ... |
| 45 | `uece-2017-1-f2-mathematics-q10` | mathematics | **D** | Se x e y são números reais tais que 5y + 2x = 10, então, o menor valor que x2 + y2 po... |
| 46 | `uece-2017-1-f2-physics-q02` | physics | **D** | Se fossem desprezados todos os atritos e retirados os amortecedores, um automóvel par... |
| 47 | `uece-2017-1-f2-physics-q11` | physics | **C** | Uma criança deixa sua sandália sobre o disco girante que serve de piso em um carrosse... |
| 48 | `uece-2017-1-f2-physics-q14` | physics | **C** | Duas bicicletas são equipadas com freios de diferentes tecnologias. Uma delas tem a r... |
| 49 | `uece-2017-1-f2-physics-q15` | physics | **C** | Considere duas associações de dois pares de molas, todas iguais, um par em série e ou... |
| 50 | `uece-2017-1-f2-physics-q19` | physics | **A, D** | Em um sistema massa mola, a energia potencial é função do coeficiente elástico  e da... |
| 51 | `uece-2017-1-f2-spanish-q03` | spanish | **D** | El texto nos dice que los bonobos estudiados vivían en... |
| 52 | `uece-2017-2-f1-chemistry-q47` | chemistry | **B** | As cetonas são encontradas na natureza, em flores e frutos. Em geral, são líquidos de... |
| 53 | `uece-2017-2-f1-mathematics-q15` | mathematics | **D** | A soma dos elementos do conjunto formado por todas as soluções, no intervalo [0,2π], ... |
| 54 | `uece-2017-2-f2-chemistry-q16` | chemistry | **D** | As reações de oxirredução aparecem praticamente em todas as funções orgânicas e repre... |
| 55 | `uece-2017-2-f2-chemistry-q18` | chemistry | **B, D** | O bronzeador injetável, ao ser aplicado no corpo humano, estimula a melanina, substân... |
| 56 | `uece-2017-2-f2-mathematics-q06` | mathematics | **C** | Se o produto das matrizes M = ൤1 𝑝 1൨ e 𝑞 K = ൤𝑥 1 𝑦൨ satisfaz a condição M.K = K... |
| 57 | `uece-2017-2-f2-mathematics-q11` | mathematics | **D** | Para 𝑥≠0, −𝜋 4 < x < ସ , a soma infinita 1 + tgx + tg2x + tg3x + .... + .... é igua... |
| 58 | `uece-2017-2-f2-physics-q04` | physics | **D** | Considere um resistor ligado a uma bateria e dissipando calor por efeito Joule. Pelo ... |
| 59 | `uece-2017-2-f2-physics-q10` | physics | **D** | Considere a dilatação térmica de duas barras longas e finas, feitas de mesmo material... |
| 60 | `uece-2017-2-f2-physics-q11` | physics | **C** | Um dado material com calor específico  recebe certa quantidade de calor  e tem sua ... |
| 61 | `uece-2017-2-f2-physics-q14` | physics | **C** | Dois corpos, inicialmente com temperaturas diferentes, são isolados termicamente do a... |
| 62 | `uece-2018-1-f1-chemistry-q47` | chemistry | **D** | A entropia é uma função de estado que indica o grau de desordem de um sistema. Consid... |
| 63 | `uece-2018-1-f1-chemistry-q52` | chemistry | **D** | Na fabricação de hambúrgueres, utiliza-se hidróxido de amônio como agente antimicrobi... |
| 64 | `uece-2018-1-f1-geography-q35` | geography | **A, B, C, D** | Atente ao seguinte excerto: “Os solos são corpos naturais da superfície terrestre que... |
| 65 | `uece-2018-1-f1-physics-q40` | physics | **D** | Luz infravermelha com comprimentos de onda entre 780 e 1.400 nm tem maior penetração ... |
| 66 | `uece-2018-1-f1-physics-q44` | physics | **C** | Considere um tanque cilíndrico contendo água até uma altura ℎ, em metros. No fundo do... |
| 67 | `uece-2018-1-f1-physics-q45` | physics | **B, D** | A física ambiental aborda, dentre outros assuntos, a poluição atmosférica. Na atmosfe... |
| 68 | `uece-2018-1-f2-chemistry-q08` | chemistry | **B** | Considere a reação seguinte no equilíbrio: HCO-3(aq) + H+(aq)  ⇄  CO2(g) + H2O(l). Pa... |
| 69 | `uece-2018-1-f2-chemistry-q14` | chemistry | **D** | Bebidas alcóolicas, como licores artesanais, podem, algumas vezes, apresentar metanol... |
| 70 | `uece-2018-1-f2-chemistry-q16` | chemistry | **D** | Atente aos seguintes compostos orgânicos: I. 2-metil-propan-1-ol; II. metóxi-etano; I... |
| 71 | `uece-2018-1-f2-mathematics-q09` | mathematics | **B** | Seja f : RR a função definida por f(x) = 2x e x1, x2, x3, ..., uma sequência de núme... |
| 72 | `uece-2018-1-f2-physics-q08` | physics | **D** | Seja o sistema composto por duas cargas elétricas mantidas fixas a uma distância  e ... |
| 73 | `uece-2018-1-f2-physics-q09` | physics | **D** | Considerando-se o módulo do momento linear, , de um carro de massa , a energia ciné... |
| 74 | `uece-2018-1-f2-physics-q10` | physics | **C** | Considere um sistema massa-mola que oscila verticalmente sob a ação da gravidade, , ... |
| 75 | `uece-2018-1-f2-physics-q11` | physics | **D** | Em um gás ideal, o produto da pressão pelo volume dividido pela temperatura tem, no S... |
| 76 | `uece-2018-1-f2-physics-q12` | physics | **D** | Considere um dado movimento oscilatório em que uma partícula seja sujeita a uma força... |
| 77 | `uece-2018-1-f2-physics-q16` | physics | **C** | Considere um tanque cilíndrico de altura ℎ e completamente cheio com um líquido incom... |
| 78 | `uece-2018-1-f2-physics-q18` | physics | **C** | Em um sistema massa-mola, um objeto oscila de modo que sua posição seja dada por  = ... |
| 79 | `uece-2018-1-f2-physics-q20` | physics | **C** | Seja um anel metálico construído com um fio muito fino. O material tem coeficiente de... |
| 80 | `uece-2018-2-f1-mathematics-q15` | mathematics | **B, D** | Se (a1, a2, a3, a4, . . .) é uma progressão aritmética cuja razão é igual a r e se pa... |
| 81 | `uece-2018-2-f1-physics-q39` | physics | **B** | Recentemente o tema combustível e caminhões ganhou destaque nos noticiários com a gre... |
| 82 | `uece-2018-2-f1-physics-q41` | physics | **D** | Considere um mês em que o total de chuva registrada em Fortaleza seja de 300 mm. Supo... |
| 83 | `uece-2018-2-f2-mathematics-q05` | mathematics | **D** | Se o número complexo 1 + i é uma das raízes da equação P(x) = 0, onde P(x) = x4 – 2x3... |
| 84 | `uece-2018-2-f2-mathematics-q08` | mathematics | **D** | Usando fórmulas trigonométricas, pode-se expressar sen(3t) em função de sen(t). A par... |
| 85 | `uece-2018-2-f2-mathematics-q10` | mathematics | **D** | Em um plano, com o sistema de coordenadas cartesianas usual, o ponto S(3, 4) pertence... |
| 86 | `uece-2018-2-f2-mathematics-q11` | mathematics | **D** | Se p1, p2, p3,  , p18 são números inteiros positivos primos e distintos e se p = ... |
| 87 | `uece-2018-2-f2-mathematics-q12` | mathematics | **B** | Seja M o conjunto dos números complexos da forma z = a + bi, com a e b números inteir... |
| 88 | `uece-2018-2-f2-mathematics-q13` | mathematics | **A, D** | Se o sistema de equações , +  +  = 2 − = 3 Onde a = sen α e b = cos α, admite uma... |
| 89 | `uece-2018-2-f2-mathematics-q15` | mathematics | **D** | No plano, com o sistema de coordenadas cartesianas usual, a medida da área da região ... |
| 90 | `uece-2018-2-f2-mathematics-q17` | mathematics | **D** | Em astronomia, meridianos e paralelos são linhas circulares localizadas na superfície... |
| 91 | `uece-2018-2-f2-physics-q06` | physics | **D** | Considere a energia potencial gravitacional de uma massa puntiforme próxima à superfí... |
| 92 | `uece-2018-2-f2-physics-q15` | physics | **A, C** | Um oscilador harmônico simples, do tipo massa-mola, tem a posição de sua massa descri... |
| 93 | `uece-2019-1-f1-chemistry-q49` | chemistry | **D** | Assinale a opção que completa correta e respectivamente o seguinte enunciado: “Muitas... |
| 94 | `uece-2019-1-f1-chemistry-q50` | chemistry | **D** | Uma pilha de alumínio e prata foi montada e, após algum tempo, constatou-se que o ele... |
| 95 | `uece-2019-1-f1-mathematics-q18` | mathematics | **B** | Em um plano, considere um círculo cuja medida do raio é igual a 0,5 m, um quadrado Q ... |
| 96 | `uece-2019-1-f1-physics-q40` | physics | **C** | Em antigos relógios de parede era comum o uso de um pêndulo realizando um movimento h... |
| 97 | `uece-2019-1-f1-physics-q43` | physics | **D** | Um disco, do tipo DVD, gira com movimento circular uniforme, realizando 30 rpm. A vel... |
| 98 | `uece-2019-1-f1-physics-q45` | physics | **A** | Assinale a opção que apresenta a mesma unidade de medida de energia cinética. (moment... |
| 99 | `uece-2019-1-f2-chemistry-q11` | chemistry | **D** | A corrosão do ferro é um fenômeno eletroquímico no qual as reações que ocorrem são as... |
| 100 | `uece-2019-1-f2-mathematics-q12` | mathematics | **D** | Se os três números primos distintos p1, p2 e p3 são as raízes do polinômio p(x) = x3 ... |
| 101 | `uece-2019-1-f2-physics-q09` | physics | **D** | Pela lei da gravitação universal, a Terra e a Lua são atraídas por uma força dada por... |
| 102 | `uece-2019-1-f2-sociology-q20` | sociology | **A, B, C, D** | Leia o seguinte excerto: “A globalização econômica e o advento da chamada 3ª Revoluçã... |
| 103 | `uece-2019-2-f1-chemistry-q54` | chemistry | **D** | O nitrato de amônio se decompõe, sob certas condições, produzindo água e monóxido de ... |
| 104 | `uece-2019-2-f1-geography-q37` | geography | **A, B, C, D** | “O Cerrado é o segundo maior bioma da América do Sul, ocupando uma área de 2.036.448 ... |
| 105 | `uece-2019-2-f1-mathematics-q16` | mathematics | **D** | No plano cartesiano, a reta t, paralela x =√3 y tangencia a circunferência x2 + y2 – ... |
| 106 | `uece-2019-2-f1-physics-q40` | physics | **B** | Um dispositivo eletrônico muito comum nos celulares tipo smart phones é o acelerômetr... |
| 107 | `uece-2019-2-f1-physics-q42` | physics | **D** | O município de Fortaleza experimentou, nos primeiros meses de 2019, uma intensa quadr... |
| 108 | `uece-2019-2-f2-biology-q20` | biology | **D** | A hemofilia é uma enfermidade recessiva ligada ao cromossomo X e a calvície é uma car... |
| 109 | `uece-2019-2-f2-chemistry-q02` | chemistry | **C** | Um estudante dissolveu 162 g de glicose (C6H12O6) em água suficiente para produzir um... |
| 110 | `uece-2019-2-f2-chemistry-q04` | chemistry | **D** | A uma determinada temperatura, encontram- se, em equilíbrio, X mols de pentacloreto d... |
| 111 | `uece-2019-2-f2-chemistry-q08` | chemistry | **D** | Considerando a reação na pilha de Daniel, Zn + CuSO4 → ZnSO4 + Cu, pode-se afirmar co... |
| 112 | `uece-2019-2-f2-chemistry-q14` | chemistry | **D** | No Brasil, há três tipos de água regulamentados para consumo, segundo a Agência Nacio... |
| 113 | `uece-2019-2-f2-mathematics-q05` | mathematics | **C** | Na matriz  M=  , os números reais  , ,   e    formam, nessa ordem, uma progressã... |
| 114 | `uece-2019-2-f2-mathematics-q08` | mathematics | **D** | Considerando a progressão aritmética (xn), cujo  primeiro termo x1  é igual a e a ra... |
| 115 | `uece-2019-2-f2-mathematics-q12` | mathematics | **D** | Se o número natural  possui exatamente três divisores positivos e satisfaz a desigua... |
| 116 | `uece-2019-2-f2-mathematics-q13` | mathematics | **D** | Considere o quadrado MNPQ, cuja medida do lado é igual a 5 cm. No interior desse quad... |
| 117 | `uece-2019-2-f2-mathematics-q19` | mathematics | **D** | Considere um cubo Q inscrito na esfera S, isto é, os vértices de Q pertencem à superf... |
| 118 | `uece-2019-2-f2-physics-q02` | physics | **C** | Considere um carrossel que gira com velocidade angular tal que cada cavalo percorre d... |
| 119 | `uece-2019-2-f2-physics-q04` | physics | **B, D** | Projetos de edifícios esbeltos e com alturas que podem chegar até 150 metros têm gera... |
| 120 | `uece-2019-2-f2-physics-q05` | physics | **D** | A UECE realiza sistematicamente monitoramento da qualidade do ar na entrada de um de ... |
| 121 | `uece-2019-2-f2-physics-q09` | physics | **C** | Em função da diferença de massa entre a Terra e a Lua, a gravidade aqui é cerca de se... |
| 122 | `uece-2019-2-f2-physics-q14` | physics | **D** | Considere um gás confinado em um recipiente cilíndrico, de paredes fixas, exceto pela... |
| 123 | `uece-2020-1-f2-mathematics-q13` | mathematics | **D** | Um hexágono regular está inscrito em uma circunferência cuja medida do raio é igual a... |
| 124 | `uece-2020-1-f2-mathematics-q19` | mathematics | **D** | Se o volume de um paralelepípedo retângulo, cuja medida das arestas distintas são res... |
| 125 | `uece-2020-1-f2-mathematics-q20` | mathematics | **D** | O volume, em m3, de um poliedro convexo, cujos vértices são os centros das faces de u... |
| 126 | `uece-2020-1-f2-philosophy-q08` | philosophy | **A, B, C, D** | As seguintes máximas exemplificam a solução apresentada por Immanuel Kant na formulaç... |
| 127 | `uece-2020-1-f2-physics-q19` | physics | **D** | Uma pessoa observa a linha do horizonte no mar a partir de um edifício alto. O olho d... |
| 128 | `uece-2020-2-f1-physics-q45` | physics | **C** | Durante as semanas de isolamento social mais intenso, verificou-se uma redução sensív... |
| 129 | `uece-2020-2-f2-mathematics-q13` | mathematics | **D** | O volume de um cone circular reto, cuja medida do raio da base é 3 m e a medida da su... |
| 130 | `uece-2020-2-f2-physics-q19` | physics | **D** | Em um experimento em sala de aula, no estudo da mecânica, um objeto repousa suspenso ... |
| 131 | `uece-2020-2-f2-sociology-q14` | sociology | **A, B, C, D** | A Lei de Diretrizes e Bases da Educação Brasileira (LDB/96) sofreu alterações com as ... |
| 132 | `uece-2021-1-f1-chemistry-q50` | chemistry | **A** | A nomenclatura IUPAC (União Internacional da Química Pura e Aplicada) dos compostos o... |
| 133 | `uece-2021-1-f1-chemistry-q54` | chemistry | **A, B, C, D** | Atente para as informações contidas na seguinte tabela: Substância Calor de combustão... |
| 134 | `uece-2021-1-f1-mathematics-q18` | mathematics | **B** | Seja XYZ um triângulo retângulo em Y cuja medida do cateto XY é igual a 6 cm. Se a pe... |
| 135 | `uece-2021-1-f1-physics-q43` | physics | **A** | Em uma aula experimental sobre capacitância, desenvolvida em um laboratório didático ... |
| 136 | `uece-2021-1-f2-mathematics-q16` | mathematics | **A, D** | Se M é a matriz M = cos (x) sen(x) 0 1 0 1 e det(M) é o determinante de M, então, par... |
| 137 | `uece-2021-1-f2-mathematics-q17` | mathematics | **C** | Se a razão entre as medidas de dois dos ângulos formados pelas diagonais de um retâng... |
| 138 | `uece-2021-1-f2-physics-q08` | physics | **D** | O sangue movendo-se através dos vasos pode ser considerado um fluido real. Dependendo... |
| 139 | `uece-2021-1-f2-physics-q14` | physics | **D** | Ao montar um aparato ótico, um estudante fez uso de uma lente delgada convergente de ... |
| 140 | `uece-2022-1-f2-mathematics-q10` | mathematics | **A, C** | A base de uma pirâmide é uma das faces de um cubo cuja soma das medidas das áreas das... |
| 141 | `uece-2022-1-f2-mathematics-q13` | mathematics | **A, B, C, D** | No Brasil, os veículos automotores mais antigos, com quatro rodas ou mais, são identi... |
| 142 | `uece-2022-1-f2-physics-q08` | physics | **C** | Na construção de grandes estruturas, como por exemplo, torres de transmissão de energ... |
| 143 | `uece-2022-2-f2-chemistry-q03` | chemistry | **D** | Em relação ao átomo em seu estado fundamental, algumas regras são estabelecidas quant... |
| 144 | `uece-2022-2-f2-philosophy-q14` | philosophy | **A, B, C, D** | Apresentando sua concepção de contrato ou pacto, pelo qual os homens ingressam em soc... |
| 145 | `uece-2023-1-f1-biology-q57` | biology | **D** | Em relação aos artrópodes, é correto afirmar que apresentam... |
| 146 | `uece-2023-1-f1-mathematics-q18` | mathematics | **D** | Em um plano, considere duas circunferências concêntricas C1 e C2 cujas medidas dos ra... |
| 147 | `uece-2023-1-f1-mathematics-q19` | mathematics | **A, B, C, D** | Uma piscina localizada na cobertura de um edifício residencial possui, internamente, ... |
| 148 | `uece-2023-1-f1-mathematics-q20` | mathematics | **D** | Quantos são os números inteiros positivos com três dígitos nos quais aparecem apenas ... |
| 149 | `uece-2023-1-f2-biology-q08` | biology | **A, B, C, D** | Relacione corretamente os conceitos ecológicos, apresentados na coluna I, às suas def... |
| 150 | `uece-2023-1-f2-english-q12` | english | **D** | Dr. Restak calls attention to the fact that not all memory lapses are really worrying... |
| 151 | `uece-2023-1-f2-english-q18` | english | **C, D** | In terms of voice of the verb, the clauses in the sentence “Throughout his career, Dr... |
| 152 | `uece-2023-1-f2-french-q09` | french | **D** | Selon Stendhal l’essentiel dans l’art est le/l’... |
| 153 | `uece-2023-1-f2-mathematics-q01` | mathematics | **D** | Uma cultura de bactérias cresce obedecendo à função f(t) = c32t , onde c é uma consta... |
| 154 | `uece-2023-1-f2-philosophy-q10` | philosophy | **D** | Da mesma forma que a Filosofia, a História surgiu na época clássica da Grécia. Seu ma... |
| 155 | `uece-2023-1-f2-physics-q19` | physics | **D** | Uma fonte sonora está presa a um carrinho montado sobre trilhos. A trajetória do carr... |
| 156 | `uece-2023-1-f2-spanish-q20` | spanish | **D** | Apunta la palabra que cambia el significado según el género.... |
| 157 | `uece-2023-2-f2-portuguese-q06` | portuguese | **A, B, C, D** | No trecho “Em 2022, o número de garimpeiros no território, que exploram ouro de forma... |

---

## 4. Enunciados Cortados ou Truncados na Extração

| ID da Questão | Disciplina | Prova | Texto Extraído | Diagnóstico |
|---|---|---|---|---|
| `uece-2015-2-f1-chemistry-q43` | chemistry | `uece-2015-2-f1-chemistry` | "Manchete do jornal o Estado de São Paulo em" | Texto cortado na extração OCR |
| `uece-2016-2-f1-mathematics-q15` | mathematics | `uece-2016-2-f1-mathematics` | "680.000." | Texto cortado na extração OCR |
| `uece-2022-1-f2-biology-q19` | biology | `uece-2022-1-f2-biology` | "Fermentação é" | Texto cortado na extração OCR |

---

## 5. Questões com Caracteres / Fontes Corrompidas (31 Questões)

Questões de Matemática, Física e Química onde a seta de reação química ou de função matemática foi extraída como caractere não mapeado (``):

| # | ID da Questão | Disciplina | Trecho Afetado |
|---|---|---|---|
| 1 | `uece-2015-1-f1-mathematics-q19` | mathematics | Se os conjuntos X e Y possuem, respectivamente, cinco e oito elementos, quantas funções, f... |
| 2 | `uece-2015-1-f2-mathematics-q19` | mathematics | A função f : R R satisfaz as condições: f(1) = 2 e  f(x + 1) = f(x) - 1 para todo número ... |
| 3 | `uece-2015-2-f2-mathematics-q05` | mathematics | Se g : R R é a função definida por  g( x ) =  3 x + sen então o valor da soma x 2  ... |
| 4 | `uece-2015-2-f2-mathematics-q10` | mathematics | Sejam f, g : R R  funções definidas por f(x) = 3sen(x) e g(x) = sen(3x). Se m e n são os ... |
| 5 | `uece-2016-1-f1-mathematics-q19` | mathematics | Seja R+ o conjunto dos números reais positivos e f : R  R+ a função definida por f(x) = 2... |
| 6 | `uece-2016-1-f1-mathematics-q20` | mathematics | No sistema de coordenadas cartesianas usual, o gráfico da função f : R  R, f(x) = 2x2 - 8... |
| 7 | `uece-2016-1-f2-mathematics-q07` | mathematics | No plano, com o sistema de coordenadas cartesianas usual, o gráfico da função f : R  R de... |
| 8 | `uece-2016-2-f1-mathematics-q22` | mathematics | Sejam E e I os pontos onde o gráfico da função f : RR, definida por f(x) = -x2 + 9x – 18 ... |
| 9 | `uece-2016-2-f2-mathematics-q05` | mathematics | Sejam f, g: R  R funções quadráticas dadas por f(x) = -x2 + 8x – 12 e g(x) = x2 + 8x + 17... |
| 10 | `uece-2016-2-f2-mathematics-q08` | mathematics | Se f : R R é a função definida por f(x) = 101-Lx, então, o valor de log(f(e)) é igual a ... |
| 11 | `uece-2017-1-f2-mathematics-q14` | mathematics | Seja f:RR uma função tal que f(nx) = [f(x)]n para todo número inteiro n e todo número rea... |
| 12 | `uece-2017-2-f2-mathematics-q02` | mathematics | Se N* = {1,2,3,.....} e  f : N*R é uma função tal que f(1) = 1,  f(2n) = 3f(n)  e f(2n+1)... |
| 13 | `uece-2018-1-f1-mathematics-q15` | mathematics | Seja f : R R definida por  f(x) =  . Se M e m são respectivamente os valores máximo... |
| 14 | `uece-2018-1-f2-mathematics-q08` | mathematics | No plano, com o sistema de coordenadas cartesianas usual, o gráfico da função f : R R, f(... |
| 15 | `uece-2018-1-f2-mathematics-q09` | mathematics | Seja f : RR a função definida por f(x) = 2x e x1, x2, x3, ..., uma sequência de números r... |
| ... | *(mais 16 questões)* | ... | ... |

---

## 6. O Problema dos Textos-Base (Português, Espanhol, Francês)

Foram detectadas **824 questões** que fazem referência a textos de apoio compartilhados (ex: *"no texto 2"*, *"na linha 15"*, *"o autor da crônica"*). Como o banco não possui entidade estruturada de texto comum (`SHARED_CONTEXT`), os candidatos só conseguem ler o texto caso tenham acesso à imagem da página/recorte ou se o texto compartilhado for injetado no banco.

---

## 7. Solução Recomendada de Alta Prioridade

### A. Adicionar Suporte a Imagens nos Componentes React (`PracticeApp` e `ArchiveQuestionViewer`)
1. Adicionar o mapeamento do asset (`QUESTION_CROP`) no tipo `PracticeQuestion` em `src/lib/question-bank.ts`.
2. Quando a questão pertencer à lista de itens visuais ou tiver alternativas vazias (`""`), exibir um botão **"Ver recorte oficial da questão"** ou exibir diretamente a imagem do recorte (`part-01.png`, etc.) na tela.

### B. Correção dos Enunciados e Símbolos
1. Substituir o caractere `` por `\rightarrow` ou `->` nas 31 questões de matemática/física.
2. Restaurar os enunciados cortados das questões identificadas na Seção 4.
