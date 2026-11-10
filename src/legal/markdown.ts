/**
 * A deliberately small Markdown reader for the legal pack: headings,
 * paragraphs, bullet / numbered lists, block quotes, rules, and inline
 * **bold**, *italic*, `code` and [links](url). Pure — no React — so it's
 * unit-tested on its own.
 */

export type Inline =
  | {kind: 'text'; text: string; bold?: boolean; italic?: boolean; code?: boolean}
  | {kind: 'link'; text: string; url: string};

export type Block =
  | {kind: 'heading'; level: number; text: string}
  | {kind: 'paragraph'; inline: Inline[]}
  | {kind: 'list'; ordered: boolean; items: Inline[][]}
  | {kind: 'quote'; inline: Inline[]}
  | {kind: 'rule'};

export type LegalDocId = 'privacy' | 'medical' | 'terms';

export const LEGAL_DOCS: {id: LegalDocId; title: string; match: RegExp}[] = [
  {id: 'privacy', title: 'Privacy Policy', match: /privacy/i},
  {id: 'medical', title: 'Medical Disclaimer', match: /medical|disclaimer|health/i},
  {id: 'terms', title: 'Terms of Service', match: /terms|conditions|eula/i},
];

/** Inline formatting within one line/paragraph. */
export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\*([^*]+)\*|_([^_]+)_/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({kind: 'text', text: src.slice(last, m.index)});
    if (m[1] !== undefined) out.push({kind: 'link', text: m[1], url: m[2]});
    else if (m[3] !== undefined || m[4] !== undefined) out.push({kind: 'text', text: m[3] ?? m[4], bold: true});
    else if (m[5] !== undefined) out.push({kind: 'text', text: m[5], code: true});
    else out.push({kind: 'text', text: m[6] ?? m[7], italic: true});
    last = re.lastIndex;
  }
  if (last < src.length) out.push({kind: 'text', text: src.slice(last)});
  return out;
}

export function parseMarkdown(md: string): Block[] {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: {ordered: boolean; items: string[]} | null = null;

  const flushPara = () => {
    if (para.length) blocks.push({kind: 'paragraph', inline: parseInline(para.join(' '))});
    para = [];
  };
  const flushList = () => {
    if (list) blocks.push({kind: 'list', ordered: list.ordered, items: list.items.map(parseInline)});
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    const h = /^(#{1,6})\s+(.*?)\s*#*$/.exec(line);
    const ul = /^[-*+]\s+(.*)$/.exec(line);
    const ol = /^\d+[.)]\s+(.*)$/.exec(line);
    if (h) {
      flushPara();
      flushList();
      blocks.push({kind: 'heading', level: h[1].length, text: h[2].replace(/\*\*/g, '')});
    } else if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flushPara();
      flushList();
      blocks.push({kind: 'rule'});
    } else if (ul || ol) {
      flushPara();
      const ordered = !!ol;
      if (!list || list.ordered !== ordered) {
        flushList();
        list = {ordered, items: []};
      }
      list.items.push((ul ?? ol)![1]);
    } else if (line.startsWith('>')) {
      flushPara();
      flushList();
      blocks.push({kind: 'quote', inline: parseInline(line.replace(/^>\s?/, ''))});
    } else if (list && /^\s{2,}/.test(raw)) {
      // continuation of the previous list item
      list.items[list.items.length - 1] += ' ' + line;
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks;
}

/**
 * Split the pack into its documents. A document starts at the highest-level
 * heading whose text names it (e.g. "# Privacy Policy") and runs until the
 * next heading of that level or higher. Missing documents come back empty.
 */
export function splitLegalPack(md: string): Record<LegalDocId, Block[]> {
  const blocks = parseMarkdown(md);
  const result: Record<LegalDocId, Block[]> = {privacy: [], medical: [], terms: []};
  for (const doc of LEGAL_DOCS) {
    const start = blocks.findIndex(b => b.kind === 'heading' && doc.match.test(b.text) && b.level <= 2);
    if (start < 0) continue;
    const level = (blocks[start] as {level: number}).level;
    let end = blocks.findIndex(
      (b, i) => i > start && b.kind === 'heading' && b.level <= level,
    );
    if (end < 0) end = blocks.length;
    // the screen shows the title itself, so drop the document's own heading
    result[doc.id] = blocks.slice(start + 1, end);
  }
  return result;
}
