# Arcor × 75 LAB · Proposta técnica de Criação e Ajuste de Artes

Resposta da 75 LAB ao RFQ de Serviços de Criação e Ajuste de Artes da Arcor (embalagem, trade marketing e material de PDV), em HTML de palco fixo 1600×900: 31 telas em 6 capítulos.

- `fonte/telas.html` · conteúdo das telas; `fonte/arcor.css` · estilo das telas; `fonte/base.css` · identidade do 75lab.com.br; `fonte/deck.js` · navegação, transições, contadores e temporizador.
- `python3 -I fonte/build.py` monta `index.html` e `assets/deck.css|js` (sobe a versão do cache).
- `node fonte/gerar-pdf.mjs http://localhost:4731/` gera `arcor-75lab.pdf` (cada página é a tela exata, no modo `?pdf=1`).

Navegação: setas do teclado, clique nas metades da tela, botões do rodapé ou o Sumário (tecla M).
