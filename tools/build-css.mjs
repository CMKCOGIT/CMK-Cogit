// Empacota o CSS do site em UM arquivo (css/site.min.css), na mesma ordem de
// css/style.css. Antes eram 14 arquivos em cascata de @import, cada um só
// descoberto depois do anterior baixar (bloqueava a primeira pintura).
// Uso: node tools/build-css.mjs          -> grava css/site.min.css
//      node tools/build-css.mjs --check  -> falha se o pacote estiver desatualizado
// Edite sempre os arquivos de origem em css/ e rode de novo; não edite o .min.
import fs from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dirCss = path.join(raiz, 'css');
const ENTRADA = path.join(dirCss, 'style.css');
const SAIDA = path.join(dirCss, 'site.min.css');

function expandir(arquivo, vistos = new Set()) {
  if (vistos.has(arquivo)) return '';
  vistos.add(arquivo);
  const texto = fs.readFileSync(arquivo, 'utf8');
  return texto.replace(/@import\s+['"]([^'"]+)['"]\s*;/g, (_, ref) => {
    const alvo = path.resolve(path.dirname(arquivo), ref);
    if (path.dirname(alvo) !== dirCss) throw new Error('import fora de css/: ' + ref); // urls relativas continuam válidas
    return '\n/* --- ' + ref + ' --- */\n' + expandir(alvo, vistos);
  });
}

// Minificação conservadora: só comentários e espaços (preserva /*! licenças */)
function minificar(css) {
  return css
    .replace(/\/\*(?!!)[\s\S]*?\*\//g, '')
    .replace(/[ \t]*\n[ \t\n]*/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim() + '\n';
}

export function gerar() {
  return '/*! CMKCOGIT site — gerado por tools/build-css.mjs a partir de css/style.css. Não edite. */\n' + minificar(expandir(ENTRADA));
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const css = gerar();
  if (process.argv.includes('--check')) {
    const atual = fs.existsSync(SAIDA) ? fs.readFileSync(SAIDA, 'utf8') : '';
    if (atual !== css) { console.error('css/site.min.css desatualizado: rode node tools/build-css.mjs'); process.exit(1); }
    console.log('css/site.min.css em dia');
  } else {
    fs.writeFileSync(SAIDA, css);
    console.log('css/site.min.css', (css.length / 1024).toFixed(1) + ' KB');
  }
}
