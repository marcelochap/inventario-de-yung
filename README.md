# 🧠 Inventários de Young – Mini-Site Offline

Mini-site desenvolvido para **preenchimento digital local/offline** de formulários de avaliação psicológica baseados nos inventários de Jeffrey Young.

O sistema foi projetado para uso simples, sem necessidade de servidor, funcionando diretamente no navegador.

---

## 📋 Formulários incluídos

* Inventário de Evitação (YRAI)
* Inventário de Compensação (YCI)
* Questionário de Modos (PM2)

Todos organizados em uma única interface com abas de navegação.

---

## 🚀 Como usar (offline)

1. Baixe ou clone este repositório
2. Extraia a pasta (se necessário)
3. Abra o arquivo:

```
index.html
```

4. O sistema abrirá no navegador (Chrome/Edge recomendado)

Não é necessário internet nem servidor.

---

## 💾 Funcionalidades

* ✔️ Preenchimento digital dos inventários
* ✔️ Autosave local (LocalStorage do navegador)
* ✔️ Exportação em JSON
* ✔️ Exportação em CSV
* ✔️ Impressão do formulário preenchido
* ✔️ Barra de progresso por formulário
* ✔️ Busca por frase
* ✔️ Navegação por número de questão
* ✔️ Escala visual colorida (1 a 6)

---

## 🗂️ Estrutura do projeto

```
/projeto
│
├── index.html
├── styles.css
├── app.js
│
├── /data
│   ├── forms.js
│   └── utils.js
│
└── /assets
    └── favicon.svg
```

---

## 🔒 Armazenamento de dados

As respostas são armazenadas apenas no navegador do usuário via:

```
LocalStorage
```

Nenhum dado é enviado para internet ou servidor.

Para backup, utilize a função **Exportar JSON**.

---

## ⚠️ Aviso importante

Este sistema:

* Não realiza diagnósticos
* Não substitui avaliação psicológica profissional
* Não interpreta resultados automaticamente

Serve apenas como ferramenta de coleta de respostas.

---

## 👤 Créditos dos formulários

Os formulários apresentados neste projeto são baseados nos inventários desenvolvidos por:

**Dr. Jeffrey E. Young**

Criador da **Terapia do Esquema (Schema Therapy)**.

Todos os direitos conceituais e autorais dos instrumentos pertencem ao autor e às publicações originais.

---

## 🧾 Licença e uso

Este projeto foi criado exclusivamente para:

> **Uso pessoal, educacional ou clínico privado (offline).**

Não é permitido:

* Comercializar o sistema
* Distribuir os instrumentos como produto
* Utilizar para fins lucrativos

Caso deseje uso profissional/comercial, consulte as publicações e direitos do autor.

---

## 🛠️ Personalização

O sistema pode ser adaptado para:

* Novos inventários
* Outras escalas
* Exportação em PDF
* Banco de dados local
* Hospedagem online

---

## 🤝 Contribuições

Como é um projeto de uso pessoal, contribuições não são obrigatórias, mas melhorias são bem-vindas.

---

## 📌 Observação final

Este mini-site foi desenvolvido com foco em:

* Simplicidade
* Uso offline
* Privacidade de dados
* Facilidade de preenchimento clínico

---

**Autor do sistema:** Uso pessoal
**Autor dos inventários:** Jeffrey E. Young

---
