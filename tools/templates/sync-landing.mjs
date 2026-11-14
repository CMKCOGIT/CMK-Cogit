// Copia o script do site e o painel "Personalizar" (fonte única em tools/templates/base/)
// para cada modelo de landing page com editor. Rode depois de editar landing-site.js ou landing-editor.js.
// Uso: node tools/templates/sync-landing.mjs           -> copia
//      node tools/templates/sync-landing.mjs --check   -> falha se alguma cópia estiver diferente
import fs from 'node:fs';
import path from 'node:path';

const repo = path.resolve(import.meta.dirname, '../..');
export const LANDING_MODELS = ['landing-basica', 'landing-profissional'];
const FILES = [['landing-site.js', 'js/site.js'], ['landing-editor.js', 'js/editor.js']];

let stale = 0;
for (const model of LANDING_MODELS) {
  for (const [src, dest] of FILES) {
    const from = fs.readFileSync(path.join(repo, 'tools/templates/base', src), 'utf8');
    const to = path.join(repo, 'templates', model, dest);
    const current = fs.existsSync(to) ? fs.readFileSync(to, 'utf8') : '';
    if (current === from) continue;
    if (process.argv.includes('--check')) { console.error(`${model}/${dest} desatualizado: rode node tools/templates/sync-landing.mjs`); stale += 1; }
    else { fs.writeFileSync(to, from); console.log(`${model}/${dest} atualizado`); }
  }
}
if (stale) process.exit(1);
