// Gera o PDF do deck: cada página é a tela exata (1600x900, em 2x), no estado final (?pdf=1).
//   node fonte/gerar-pdf.mjs [endereço do deck] [saída.pdf]
// O endereço padrão é a prévia local (python3 -m http.server 4731 na cópia do deck).
import { chromium } from '/Volumes/hd caique becker/Mac Caique/Projetos/ariuno-videos/node_modules/playwright/index.mjs';
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BASE = process.argv[2] || 'http://localhost:4731/';
const SAIDA = process.argv[3] || fileURLToPath(new URL('../arcor-75lab.pdf', import.meta.url));
const PASTA = process.env.PASTA_PAGINAS || '';   // se definida, guarda os JPG de cada página para revisar
const QUALIDADE = 86;

const paginas = [];
if (process.env.SO_MONTAR) {
  for (const f of readdirSync(PASTA).filter((f) => f.endsWith('.jpg')).sort()) paginas.push(readFileSync(`${PASTA}/${f}`));
} else {
const navegador = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await navegador.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });
pg.on('pageerror', (e) => console.log('erro na página:', e.message));
// espera as imagens visíveis da tela e, quando houver, os modelos 3D
const esperaTela = () => pg.evaluate(async () => {
  const t = document.querySelector('.tela.ativa');
  // imagem escondida com loading=lazy nunca carrega: só espera as visíveis, e no máximo 15 s
  const vis = [...t.querySelectorAll('img')].filter((i) => i.offsetParent !== null);
  vis.forEach((i) => { i.loading = 'eager'; });
  await Promise.race([Promise.all(vis.map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))), new Promise((r) => setTimeout(r, 15000))]);
  const mvs = [...t.querySelectorAll('model-viewer')];
  if (mvs.length) {
    await new Promise((r) => setTimeout(r, 800));
    const ate = Date.now() + 60000;
    while (Date.now() < ate && !mvs.every((m) => m.loaded)) await new Promise((r) => setTimeout(r, 300));
    await new Promise((r) => setTimeout(r, 1500));
  }
});
const fotografa = async (nome) => {
  await pg.waitForTimeout(700);
  const jpg = await pg.screenshot({ type: 'jpeg', quality: QUALIDADE, timeout: 180000 });
  if (PASTA) writeFileSync(`${PASTA}/${nome}.jpg`, jpg);
  paginas.push(jpg);
  console.log('página', paginas.length, nome, Math.round(jpg.length / 1024) + ' KB');
};

// página de abertura: só existe no PDF e leva para a apresentação em HTML (link clicável na página inteira)
await pg.goto(BASE.replace(/[#?].*$/, '').replace(/\/?$/, '/') + 'pdf-capa.html', { waitUntil: 'load', timeout: 120000 });
await pg.evaluate(() => document.fonts.ready);
if (PASTA) mkdirSync(PASTA, { recursive: true });
await fotografa('00-capa');
await pg.goto(BASE.replace(/#.*$/, '') + (BASE.includes('?') ? '&' : '?') + 'pdf=1#1', { waitUntil: 'load', timeout: 120000 });
await pg.evaluate(() => document.fonts.ready);
const total = await pg.evaluate(() => document.querySelectorAll('.tela').length);
if (PASTA) mkdirSync(PASTA, { recursive: true });

for (let n = 1; n <= total; n++) {
  await pg.evaluate((n) => { location.hash = '#' + n; }, n);
  await pg.waitForFunction((n) => document.querySelector('#cont').textContent.startsWith(String(n).padStart(2, '0')), n, { timeout: 120000 });
  // tela com botões (data-estados): uma página para cada botão aberto
  const estados = await pg.evaluate(() => { const t = document.querySelector('.tela.ativa'); return t.dataset.estados ? t.querySelectorAll(t.dataset.estados).length : 0; });
  for (let k = 0; k < Math.max(1, estados); k++) {
    if (estados) {
      await pg.evaluate((k) => { const t = document.querySelector('.tela.ativa'); t.querySelectorAll(t.dataset.estados)[k].click(); }, k);
      await pg.waitForTimeout(600);
    }
    await esperaTela();
    await fotografa(String(n).padStart(2, '0') + '-' + (k + 1));
  }
}

await navegador.close();
}

// PDF mínimo: uma imagem JPEG (DCTDecode, sem recompressão) por página de 960 x 540 pt (16:9, tamanho de slide)
const W = 960, H = 540, PX = 3200, PY = 1800;
const LINK = BASE.replace(/[#?].*$/, '').replace('localhost:4731', 'projetos.75lab.com.br/arcor-rfq-75lab').replace('localhost:4732', 'projetos.75lab.com.br/arcor-kv-pdv').replace(/^http:\/\/projetos/, 'https://projetos');
const partes = [], offs = [];
let tam = 0;
const poe = (b) => { const buf = Buffer.isBuffer(b) ? b : Buffer.from(b, 'binary'); partes.push(buf); tam += buf.length; };
const obj = (id, corpo) => { offs[id] = tam; poe(`${id} 0 obj\n`); corpo(); poe('\nendobj\n'); };
poe('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
const n = paginas.length, idPag = (i) => 3 + i * 3;
obj(1, () => poe('<< /Type /Catalog /Pages 2 0 R >>'));
obj(2, () => poe(`<< /Type /Pages /Count ${n} /Kids [${paginas.map((_, i) => `${idPag(i)} 0 R`).join(' ')}] >>`));
paginas.forEach((jpg, i) => {
  const p = idPag(i);
  const conteudo = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
  obj(p, () => poe(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 ${p + 2} 0 R >> >> /Contents ${p + 1} 0 R${i === 0 ? ` /Annots [<< /Type /Annot /Subtype /Link /Rect [0 0 ${W} ${H}] /Border [0 0 0] /A << /S /URI /URI (${LINK}) >> >>]` : ''} >>`));
  obj(p + 1, () => poe(`<< /Length ${conteudo.length} >>\nstream\n${conteudo}\nendstream`));
  obj(p + 2, () => { poe(`<< /Type /XObject /Subtype /Image /Width ${PX} /Height ${PY} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`); poe(jpg); poe('\nendstream'); });
});
const xref = tam, ult = 2 + n * 3;
poe(`xref\n0 ${ult + 1}\n0000000000 65535 f \n`);
for (let i = 1; i <= ult; i++) poe(`${String(offs[i]).padStart(10, '0')} 00000 n \n`);
poe(`trailer\n<< /Size ${ult + 1} /Root 1 0 R /Info << /Title (Arcor x 75 LAB - Proposta tecnica Criacao e Ajuste de Artes) /Author (75 LAB) >> >>\nstartxref\n${xref}\n%%EOF\n`);
writeFileSync(SAIDA, Buffer.concat(partes));
console.log('PDF', SAIDA, Math.round(tam / 1024 / 1024 * 10) / 10 + ' MB,', n, 'páginas');
