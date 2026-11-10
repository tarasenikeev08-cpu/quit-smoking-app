import {parseInline, parseMarkdown, splitLegalPack} from '../src/legal/markdown';

const PACK = `# Ember Legal Pack

Intro that belongs to no document.

## Privacy Policy

Ember stores your data **only on your device**.

- No analytics
- No ads, see [Apple](https://apple.com)

## Medical Disclaimer

> Ember is not medical advice.

1. Talk to a doctor.
2. Call emergency services.

## Terms of Service

Use it *kindly*.

---

## App Store notes

Not a user-facing document.
`;

test('inline formatting: bold, italic, code, links', () => {
  expect(parseInline('a **b** *c* `d` [e](https://x.y)')).toEqual([
    {kind: 'text', text: 'a '},
    {kind: 'text', text: 'b', bold: true},
    {kind: 'text', text: ' '},
    {kind: 'text', text: 'c', italic: true},
    {kind: 'text', text: ' '},
    {kind: 'text', text: 'd', code: true},
    {kind: 'text', text: ' '},
    {kind: 'link', text: 'e', url: 'https://x.y'},
  ]);
});

test('blocks: headings, lists, quotes, rules, wrapped paragraphs', () => {
  const b = parseMarkdown('# T\n\nline one\nline two\n\n- a\n- b\n\n1. x\n\n> q\n\n---');
  expect(b.map(x => x.kind)).toEqual(['heading', 'paragraph', 'list', 'list', 'quote', 'rule']);
  expect((b[1] as any).inline[0].text).toBe('line one line two');
});

test('splits the pack into exactly the three in-app documents', () => {
  const docs = splitLegalPack(PACK);
  expect(docs.privacy.map(b => b.kind)).toEqual(['paragraph', 'list']);
  expect(docs.medical.map(b => b.kind)).toEqual(['quote', 'list']);
  // terms stops at the next same-level heading; App Store notes are not shown
  expect(docs.terms.map(b => b.kind)).toEqual(['paragraph', 'rule']);
  expect(JSON.stringify(docs)).not.toContain('Not a user-facing document');
});

test('a document missing from the pack comes back empty, not wrong', () => {
  expect(splitLegalPack('# Privacy Policy\n\nOnly this.').terms).toEqual([]);
});
