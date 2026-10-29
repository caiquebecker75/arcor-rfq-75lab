"""Gera pdf-capa.html: a página que abre o PDF e leva para a apresentação em HTML.

Rodar: python3 -I fonte/pdf-capa.py "<título>" "<link>" "<arquivo do QR>" ["<o que o link tem a mais>"]
Só o gerador de PDF usa esta página (ela não entra na apresentação).
"""
import pathlib
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
titulo, link, qr = sys.argv[1], sys.argv[2], sys.argv[3]
extra = sys.argv[4] if len(sys.argv) > 4 else 'animação, botões, vídeos e realidade aumentada'
curto = link.replace('https://', '').rstrip('/')
html = f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex">
<title>{titulo} · abrir em HTML</title>
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;900&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/deck.css">
<style>
html,body{{width:1600px;height:900px;overflow:hidden;background:var(--ink-2)}}
.abre{{position:absolute;inset:0;padding:96px 120px;color:var(--paper);background:radial-gradient(700px circle at 78% 42%,rgba(192,238,78,.12),transparent 70%),var(--ink-2)}}
.abre .marcas{{display:flex;align-items:center;gap:20px}}
.abre .marcas .arcor{{height:78px}}.abre .marcas .lab{{height:34px}}.abre .marcas span{{font-family:var(--mono);opacity:.6}}
.abre .eyebrow{{display:block;margin:64px 0 18px;color:var(--lime)}}
.abre h1{{font-size:104px;line-height:.98;width:900px}}
.abre h1 em{{font-style:normal;color:var(--lime)}}
.abre p{{font-size:21px;line-height:1.45;width:780px;margin:26px 0 38px;opacity:.88}}
.abre .botao{{font-size:17px;padding:24px 30px;gap:16px}}
.abre .botao b{{font-size:24px}}
.abre .url{{display:block;font-family:var(--mono);font-size:14px;letter-spacing:.06em;margin-top:22px;color:var(--lime)}}
.abre .qr{{position:absolute;right:120px;top:210px;width:340px;background:var(--paper);color:var(--ink);padding:22px;text-align:center;box-shadow:14px 14px 0 var(--lime)}}
.abre .qr img{{width:100%;display:block;margin-bottom:14px}}
.abre .qr b{{display:block;font-family:var(--titulo);font-weight:900;font-size:28px;text-transform:uppercase;line-height:1}}
.abre .qr small{{display:block;font-family:var(--mono);font-size:11px;margin-top:8px;opacity:.7}}
.abre .pe{{position:absolute;left:120px;right:120px;bottom:56px;font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;opacity:.55;display:flex;justify-content:space-between}}
</style>
</head>
<body>
<div class="abre">
  <div class="marcas"><img class="arcor" src="assets/logos/arcor.svg" alt="Arcor"><span>×</span><img class="lab" src="assets/logos/75lab-logo-lime.svg" alt="75 LAB"></div>
  <span class="eyebrow">Antes de começar · {titulo}</span>
  <h1>Esta apresentação foi feita <em>em HTML.</em></h1>
  <p>Este PDF mostra cada tela parada. No link, a apresentação tem {extra}, e é assim que ela deve ser vista.</p>
  <a class="botao cheio" href="{link}">Clique aqui para acessar a apresentação completa <b>↗</b></a>
  <span class="url">{curto}</span>
  <div class="qr"><img src="{qr}" alt="QR da apresentação"><b>No celular, aponte a câmera</b><small>{curto}</small></div>
  <div class="pe"><span>75 LAB · Estratégia, Design e Produção</span><span>As páginas a seguir são a versão em PDF</span></div>
</div>
</body>
</html>
'''
(RAIZ / 'pdf-capa.html').write_text(html)
print('ok', link)
