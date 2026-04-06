import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'content.json');

export function getContent() {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

export function saveContent(data: unknown) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
}
