export const FORMS = {

  /* =========================
     INVENTÁRIO DE EVITAÇÃO
  ========================= */
  YRAI: {
    key: "YRAI",
    title: "Inventário de Evitação (YRAI)",
    instructions:
      "Leia cada afirmação e marque o quanto ela descreve você usando a escala de 1 a 6.",

    scaleLabels: [
      "Completamente falso",
      "Falso na maioria das vezes",
      "Mais verdadeiro do que falso",
      "Moderadamente verdadeiro",
      "Verdadeiro na maioria das vezes",
      "Me descreve perfeitamente"
    ],

    groupSize: 20,

    items: [
      [1,"Eu tento não pensar em coisas que me chateiam."],
      [2,"Eu tomo bebida alcoólica para me acalmar."],
      [3,"Eu me sinto feliz na maior parte do tempo."],
      [4,"Eu raramente me sinto triste ou para baixo."],
      [5,"Eu dou mais valor à razão do que à emoção."],
      [6,"Eu acredito que não deveria ficar bravo."],
      [7,"Eu uso drogas para me sentir melhor."],
      [8,"Eu não sinto nada demais quando me lembro da minha infância."],
      [9,"Eu fumo quando estou chateado."],
      [10,"Eu sofro de problemas gastrointestinais."],
      [11,"Eu me sinto dormente."],
      [12,"Eu frequentemente tenho dores de cabeça."],
      [13,"Eu me retraio quando fico bravo."],
      [14,"Eu não tenho tanta energia quanto outras pessoas."],
      [15,"Eu sofro de dores musculares."],
      [16,"Eu assisto muita TV quando estou sozinho."],
      [17,"Eu uso a razão para controlar emoções."],
      [18,"Eu não consigo antipatizar com alguém intensamente."],
      [19,"Quando algo dá errado, sigo em frente rápido."],
      [20,"Eu me afasto quando fico triste."]
    ]
  },

  /* =========================
     INVENTÁRIO DE COMPENSAÇÃO
  ========================= */
  YCI: {
    key: "YCI",
    title: "Inventário de Compensação (YCI)",
    instructions:
      "Leia cada afirmação e marque o quanto ela descreve você usando a escala de 1 a 6.",

    scaleLabels: [
      "Completamente falso",
      "Em grande parte falso",
      "Mais verdadeiro do que falso",
      "Moderadamente verdadeiro",
      "Em grande parte verdadeiro",
      "Me descreve perfeitamente"
    ],

    groupSize: 20,

    items: [
      [1,"Eu desconto minhas frustrações nos outros."],
      [2,"Culpo os outros quando as coisas dão errado."],
      [3,"Demonstro muita raiva quando sou traído."],
      [4,"Não paro de sentir raiva até me vingar."],
      [5,"Fico na defensiva quando criticado."],
      [6,"É importante que admirem minhas conquistas."],
      [7,"Gosto de demonstrar meu sucesso."],
      [8,"Esforço-me para ser o melhor."],
      [9,"É importante ser popular."],
      [10,"Tenho fantasias de sucesso."],
      [11,"Gosto de ser o centro das atenções."],
      [12,"Sou mais sedutor que a média."],
      [13,"Dou muita importância à ordem."],
      [14,"Evito que as coisas deem errado."],
      [15,"Penso muito antes de decidir."],
      [16,"Sou controlador com pessoas."],
      [17,"Gosto de ter autoridade."],
      [18,"Não gosto que opinem na minha vida."],
      [19,"É difícil ceder."],
      [20,"Não gosto de depender de ninguém."]
    ]
  },

  /* =========================
     QUESTIONÁRIO DE MODOS
     (resumido exemplo — pode expandir)
  ========================= */
  PM2: {
    key: "PM2",
    title: "Questionário de Modos (PM2)",
    instructions:
      "Com que frequência você sentiu isso no último mês? Use a escala de 1 a 6.",

    scaleLabels: [
      "Nunca ou quase nunca",
      "Raramente",
      "Às vezes",
      "Muitas vezes",
      "Grande parte do tempo",
      "Quase o tempo todo"
    ],

    groupSize: 25,

    items: [
      [1,"Eu me sinto entediado."],
      [2,"Eu me sinto vazio."],
      [3,"Eu me sinto triste."],
      [4,"Eu me sinto ansioso."],
      [5,"Eu me sinto irritado."],
      [6,"Eu me sinto com raiva."],
      [7,"Eu me sinto sozinho."],
      [8,"Eu me sinto culpado."],
      [9,"Eu me sinto inadequado."],
      [10,"Eu me sinto com medo."]
    ]
  }

};
