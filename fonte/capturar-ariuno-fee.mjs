// Captura as telas da Gestão Cliente Fee na demo pública do Ariuno, em 2x, com uma campanha de exemplo da Arcor.
// A demo vem com outro cliente e sem arte nas peças: o código publicado é trocado só nesta captura
// (cliente, catálogo de peças e campanha) e cada peça aponta para um conceito de PDV Rocklets da 75 LAB.
//   node fonte/capturar-ariuno-fee.mjs <pasta de saída>
import { chromium } from '/Volumes/hd caique becker/Mac Caique/Projetos/ariuno-videos/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';

const OUT = process.argv[2];
const IMG = process.env.HOME + '/arcor-pdv/conceitos/rocklets/';
const arteDe = (nome) => {
  const n = nome.toLowerCase();
  if (n.includes('régua')) return '01-regua.jpg';
  if (n.includes('wobbler')) return '02-wobbler.jpg';
  if (n.includes('stopper')) return '03-stopper.jpg';
  if (n.includes('testeira')) return '04-testeira.jpg';
  if (n.includes('clip')) return '05-clipstrip.jpg';
  if (n.includes('chão')) return '07-display-chao.jpg';
  if (n.includes('balcão')) return '08-display-balcao.jpg';
  if (n.includes('ponta')) return '10-ponta-gondola.jpg';
  if (n.includes('ilha')) return '12-ilha.jpg';
  return '13-store-in-store.jpg';
};
const CAMPANHA = 'Rocklets · ponto extra 2027';
const CATALOGO = [
  '# Canal ; Ponto ; Peça ; Formatos de loja ; Tipos de campanha em que já vem marcada',
  'Trade e PDV ; Gôndola ; Régua de gôndola ; Supermercado, Atacarejo ; Primária',
  'Trade e PDV ; Gôndola ; Wobbler ; Supermercado, Atacarejo, Conveniência ; Primária, Secundária, Tática',
  'Trade e PDV ; Gôndola ; Stopper ; Supermercado, Atacarejo ; Primária',
  'Trade e PDV ; Ponta de gôndola ; Testeira ; Supermercado, Atacarejo ; Primária, Secundária',
  'Trade e PDV ; Ponta de gôndola ; Ponta de gôndola ; Supermercado ; Primária',
  'Trade e PDV ; Ponto extra ; Display de chão ; Supermercado, Atacarejo ; Primária',
  'Trade e PDV ; Ponto extra ; Ilha ; Supermercado ; Primária',
  'Trade e PDV ; Caixa ; Display de balcão ; Conveniência ; Primária, Tática',
  'Trade e PDV ; Caixa ; Clip strip ; Conveniência, Supermercado ; Secundária, Tática',
  'Embalagem ; Arte-final ; Nova arte de embalagem ; Todas ;',
  'Embalagem ; Ajuste ; Ajuste de texto legal ; Todas ;',
  'Embalagem ; Planta técnica ; Ajuste de planta técnica ; Todas ;',
  'Materiais de apoio ; Catálogo ; Ajuste de catálogo, por página ; Todas ;',
  'Materiais de apoio ; Manual ; Ajuste de manual de merchandising ; Todas ;',
];

const navegador = await chromium.launch({ channel: 'chrome' });
const ctx = await navegador.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'pt-BR' });
await ctx.route(/\/assets\/index-[^/]+\.js$/, async (route) => {
  const r = await route.fetch();
  let js = await r.text();
  const troca = (de, para, todas) => { if (!js.includes(de)) console.log('AVISO: não achei', de); js = todas ? js.split(de).join(para) : js.replace(de, para); };
  const i = js.indexOf('const c7=['), j = js.indexOf('].join(', i);
  if (i < 0 || j < 0) console.log('AVISO: catálogo não encontrado'); else js = js.slice(0, i) + 'const c7=' + JSON.stringify(CATALOGO) + js.slice(j + 1);
  troca('url:"",nome:"arte-v1.jpg"', 'url:"/__arte/"+encodeURIComponent(v.nome+"|"+v.formato)+".jpg",nome:"arte-v1.jpg"');
  // a demo vem com outro cliente: troca o nome, a campanha, o objetivo, o apontamento e o exemplo do campo
  const re = (rx, para) => { if (!rx.test(js)) console.log('AVISO: não achei', rx); rx.lastIndex = 0; js = js.replace(rx, para); };
  re(/clienteNome:"[^"]*"/g, 'clienteNome:"Arcor"');
  re(/Usar o modelo d[ao] [^"]*"/, 'Usar o modelo da Arcor"');
  re(/nome:"[^"]*",canal:"DTC",tipo:"Primária",briefing:\{objetivo:"[^"]*"/, 'nome:"' + CAMPANHA + '",canal:"Trade e PDV",tipo:"Primária",briefing:{objetivo:"Rocklets em ponto extra, ponta de gôndola e caixa."');
  re(/pinos:\[\{x:520,y:320,texto:"[^"]*"/, 'pinos:[{x:520,y:320,texto:"Trocar a foto pelo pacote novo"');
  re(/placeholder:"Ex\.: [^"]*"/g, 'placeholder:"Ex.: ' + CAMPANHA + '"');
  await route.fulfill({ response: r, body: js });
});
await ctx.route(/\/__arte\//, (route) => {
  const nome = decodeURIComponent(route.request().url().split('/__arte/')[1]).split('|')[0];
  route.fulfill({ contentType: 'image/jpeg', body: readFileSync(IMG + arteDe(nome)) });
});
const pg = await ctx.newPage();
const espera = (ms) => pg.waitForTimeout(ms);
const tira = async (nome, opts = {}) => { await pg.screenshot({ path: OUT + nome, ...opts }); console.log('ok', nome); };
const esconderDemo = () => pg.evaluate(() => {
  for (const el of document.querySelectorAll('div')) if ((el.textContent || '').trim() === 'Demonstração: nada aqui é gravado.') el.style.display = 'none';
  for (const el of document.querySelectorAll('body *')) {
    if (/^Modo demonstração$/.test(el.textContent?.trim() || '')) {
      let p = el; while (p && getComputedStyle(p).position !== 'fixed') p = p.parentElement;
      if (p) p.style.display = 'none';
    }
  }
});

// ---- 1. aba interna
await pg.goto('https://ariuno.com.br/?demo=1');
await pg.evaluate(() => localStorage.setItem('ariuno_teste_cliente_fee', '1'));
await pg.goto('https://ariuno.com.br/?demo=1');
await espera(5000);
await pg.keyboard.press('Escape');
await espera(800);
await pg.getByText('Gestão Cliente Fee', { exact: true }).first().click();
await espera(2500);
await esconderDemo();
await espera(500);
await tira('fee-aba.png');

// ---- 3. briefing público
await pg.goto('https://ariuno.com.br/?briefingFee=demo');
await espera(3500);
const campos = pg.locator('input:not([type=date]):not([type=file]):not([type=checkbox])');
await campos.nth(0).fill('Juliana (Trade Marketing)');
await campos.nth(1).fill('trade.marketing@arcor.com');
await pg.getByPlaceholder('Ex.: ' + CAMPANHA).fill(CAMPANHA);
await campos.nth(3).fill('1200').catch(() => {});
const datas = pg.locator('input[type=date]');
await datas.nth(0).fill('2026-12-07').catch(() => {});
await datas.nth(1).fill('2027-02-01').catch(() => {});
await pg.locator('textarea').first().fill('Rocklets em ponto extra com display de chão e ilha, ponta de gôndola com testeira e caixa com display de balcão.').catch(() => {});
await espera(500);
await tira('fee-briefing.png');
await pg.mouse.wheel(0, 900);
await espera(800);
await tira('fee-briefing-pecas.png');

// ---- 4. aprovação pública
await pg.goto('https://ariuno.com.br/?aprovacaoFee=demo');
await espera(3500);
await pg.getByPlaceholder('Vai junto com as aprovações').fill('Juliana (Trade Marketing)');
await espera(600);
await tira('fee-aprovacao.png');
await pg.getByRole('button', { name: 'Pedir ajuste' }).first().click();
await espera(1500);
const arte = pg.locator('img[alt]').filter({ hasNot: pg.locator('xx') }).last();
const box = await arte.boundingBox();
const em = (fx, fy) => [box.x + box.width * fx, box.y + box.height * fy];
await pg.mouse.click(...em(0.52, 0.30));
await espera(500);
const notas = pg.locator('textarea, input[type=text]');
const n = await notas.count();
for (let i = 0; i < n; i++) { const v = await notas.nth(i).inputValue().catch(() => 'x'); const ph = await notas.nth(i).getAttribute('placeholder'); if (!v && ph && !/Algo que vale/.test(ph)) { await notas.nth(i).fill('Aumentar o logo da Arcor'); break; } }
await pg.getByRole('button', { name: 'Destacar área' }).click();
await pg.mouse.move(...em(0.08, 0.62)); await pg.mouse.down(); await pg.mouse.move(...em(0.50, 0.95), { steps: 8 }); await pg.mouse.up();
await pg.getByRole('button', { name: 'Seta' }).click();
await pg.mouse.move(...em(0.88, 0.12)); await pg.mouse.down(); await pg.mouse.move(...em(0.66, 0.36), { steps: 8 }); await pg.mouse.up();
await espera(600);
await tira('fee-ajuste-aberto.png');
console.log('fim');
await navegador.close();
