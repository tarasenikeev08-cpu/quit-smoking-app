import {LEGAL_IS_PLACEHOLDER, LEGAL_MARKDOWN} from './pack.generated';
import {Block, LegalDocId, LEGAL_DOCS, splitLegalPack} from './markdown';

export type {Block, Inline, LegalDocId} from './markdown';
export {LEGAL_DOCS, LEGAL_IS_PLACEHOLDER};

let cache: Record<LegalDocId, Block[]> | null = null;

/** The parsed document, from the bundled Ember_Legal_Pack.md. */
export function legalDoc(id: LegalDocId): {title: string; blocks: Block[]} {
  cache ??= splitLegalPack(LEGAL_MARKDOWN);
  return {title: LEGAL_DOCS.find(d => d.id === id)!.title, blocks: cache[id]};
}
