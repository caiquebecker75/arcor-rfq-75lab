"""Monta o deck: fonte/telas.html + ícones + moldura -> index.html; base.css + arcor.css -> assets/deck.css.

Rodar: python3 -I fonte/build.py
"""
import pathlib
import re
import time

RAIZ = pathlib.Path(__file__).resolve().parent.parent
F = RAIZ / 'fonte'
V = time.strftime('%Y%m%d%H%M%S')

(RAIZ / 'assets' / 'deck.css').write_text((F / 'base.css').read_text() + (F / 'arcor.css').read_text())
(RAIZ / 'assets' / 'deck.js').write_text((F / 'deck.js').read_text())

telas = (F / 'telas.html').read_text()
total = len(re.findall(r'class="tela ', telas))
icones = (F / 'icones.svg').read_text()

html = f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Arcor × 75 LAB · Proposta técnica de Criação e Ajuste de Artes</title>
<meta name="description" content="Proposta técnica da 75 LAB para o RFQ de Serviços de Criação e Ajuste de Artes da Arcor: embalagem, trade marketing e material de PDV.">
<meta name="robots" content="noindex">
<link rel="icon" href="assets/75lab-lime.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/deck.css?v={V}">
</head>
<body>

{icones}
<div id="wrap"><div id="stage" class="t-foto capa">

{telas}
  <header id="topo">
    <div class="marcas">
      <img class="arc" src="assets/logos/arcor.svg" alt="Arcor">
      <span class="x">×</span>
      <img class="lab m-escuro" src="assets/75lab-lime.png" alt="75 LAB"><img class="lab m-claro" src="assets/75lab-black.png" alt="75 LAB">
    </div>
    <div class="dir"><span class="cap" id="capTxt"></span><a id="btnPdf" href="arcor-75lab.pdf" download="Arcor x 75 LAB - Proposta tecnica Criacao e Artes.pdf" data-cursor="Baixar" aria-label="Baixar a apresentação em PDF"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M6 10l6 6 6-6M4 20h16"/></svg>PDF</a><button id="btnSumario" data-sumario data-cursor="Abrir"><span><i></i><i></i><i></i></span>Sumário</button></div>
  </header>
  <footer id="rodape">
    <span class="assin">75 LAB · Arcor · Criação e Ajuste de Artes</span>
    <div class="nav"><button id="ant" aria-label="Tela anterior" data-cursor="Voltar">←</button><span id="cont">01 / {total:02d}</span><button id="prox" aria-label="Próxima tela" data-cursor="Seguir">→</button></div>
  </footer>
  <div id="prog"><i></i></div>
  <div id="wipe"><img src="assets/75lab-black.png" alt=""></div>
  <nav id="sumario" aria-label="Sumário"><button class="botao mini fechar" data-cursor="Fechar">Fechar ✕</button><h2>Sumário · <span>Arcor × 75 LAB</span></h2><ol id="sumLista"></ol></nav>
  <div class="grao"></div>
</div></div>

<div id="caixa" role="dialog" aria-label="Imagem ampliada"><button class="fechar" data-cursor="Fechar">Fechar ✕</button><img id="cxImg" alt=""><p id="cxTxt"></p></div>
<div id="cursor"></div><div id="anel"><span id="anelTxt"></span></div>
<div id="gire"><img src="assets/75lab-lime.png" alt="75 LAB"><div class="tel"></div><h3>Gire o celular</h3><p>A apresentação foi desenhada na horizontal. Deitado, o celular mostra a tela inteira.</p><button class="botao mini" id="verAssim">Ver assim mesmo</button></div>

<script src="assets/deck.js?v={V}"></script>
</body>
</html>
'''
(RAIZ / 'index.html').write_text(html)
print('ok', total, 'telas, versão', V)
