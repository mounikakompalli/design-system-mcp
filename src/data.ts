import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');

export interface ComponentDoc {
  name: string;
  description: string;
  markdown: string;
}

export interface DesignToken {
  value: string;
  type: string;
  description?: string;
}

function firstParagraph(markdown: string): string {
  const lines = markdown.split('\n').map((l) => l.trim());
  const start = lines.findIndex((l) => l.startsWith('#'));
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (l && !l.startsWith('#') && !l.startsWith('|') && !l.startsWith('-') && !l.startsWith('```')) {
      return l;
    }
  }
  return '';
}

export function loadComponents(): ComponentDoc[] {
  const dir = join(root, 'components');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => {
      const markdown = readFileSync(join(dir, f), 'utf8');
      const name = basename(f, '.md');
      return { name, description: firstParagraph(markdown), markdown };
    });
}

export function loadTokens(): Record<string, DesignToken> {
  const file = join(root, 'tokens.json');
  if (!existsSync(file)) return {};
  return JSON.parse(readFileSync(file, 'utf8')) as Record<string, DesignToken>;
}
