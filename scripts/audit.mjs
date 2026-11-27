import { readFile, readdir, lstat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await readFile(path.join(root, 'publication-files.json'), 'utf8'));
const allowed = new Set(manifest);
const ignoredDirectories = new Set(['node_modules', 'dist', '.git', 'coverage']);
const problems = [];
async function walk(relative = '') {
  for (const name of await readdir(path.join(root, relative))) {
    const file = relative ? `${relative}/${name}` : name;
    const stat = await lstat(path.join(root, file));
    if (stat.isDirectory() && ignoredDirectories.has(name) && relative === '') continue;
    if (stat.isSymbolicLink()) { problems.push(`${file}: unexpected symbolic link`); continue; }
    if (stat.isDirectory()) { await walk(file); continue; }
    if (!allowed.has(file)) problems.push(`${file}: absent from publication allowlist`);
  }
}
await walk();
const patterns = [
  new RegExp('gh' + '[pousr]_[A-Za-z0-9]{20,}'),
  new RegExp('github' + '_pat_[A-Za-z0-9_]{20,}'),
  new RegExp('sk' + '-(?:ant-|live_)[A-Za-z0-9_-]{12,}'),
  new RegExp('AK' + 'IA[0-9A-Z]{16}'),
  new RegExp('-----BEGIN ' + '(?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
  new RegExp('eyJ[A-Za-z0-9_-]{8,}' + '\\.[A-Za-z0-9_-]{8,}\\.[A-Za-z0-9_-]{8,}'),
  new RegExp('(?:password|api_key|access_token|secret_key)' + '\\s*[:=]\\s*["\'][^"\'\\s]{12,}["\']', 'i'),
];
for (const file of manifest) {
  if (typeof file !== 'string' || file.includes('..') || path.isAbsolute(file)) throw new Error('unsafe manifest path');
  const stat = await lstat(path.join(root, file));
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`not a regular file: ${file}`);
  if (/(^|\/)\.env|\.(?:pem|key|sql|sqlite|db)$/.test(file)) problems.push(`${file}: forbidden private-file convention`);
  const text = await readFile(path.join(root, file), 'utf8');
  if (text.includes('\0')) problems.push(`${file}: binary content`);
  for (const pattern of patterns) if (pattern.test(text)) problems.push(`${file}: potential credential pattern`);
}
if (problems.length) { console.error(problems.join('\n')); process.exitCode = 1; }
else console.log(`Checked ${allowed.size} publication files: no allowlist violations or common credential patterns. Heuristic scan only.`);
