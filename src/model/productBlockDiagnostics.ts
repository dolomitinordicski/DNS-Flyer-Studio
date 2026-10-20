import type { FlyerContent, FlyerSectionId } from '../types';
import type { BlockValidationIssue } from './blockDataContract';
import type { FlyerProductDefinition } from './flyerProductModel';
import { getRuntimeBlock } from '../components/blocks/BlockEngine';

/**
 * Non-destructive preflight for the canonical product's allowed block stack.
 * Layout order, data sources and inherited visuals are never modified here.
 */
export interface ProductBlockDiagnostic {
  sectionId: FlyerSectionId;
  componentId: string;
  issues: BlockValidationIssue[];
}

export function inspectProductBlocks(content: FlyerContent, product: FlyerProductDefinition): ProductBlockDiagnostic[] {
  return product.blockStack.flatMap(sectionId => {
    const definition = getRuntimeBlock(sectionId);
    if (!definition) {
      return [{
        sectionId,
        componentId: 'UNREGISTERED',
        issues: [{ code: 'missing-runtime-block', level: 'error' as const,
          message: `The ${sectionId} block has no registered renderer.` }],
      }];
    }
    const first = content.sectionVisibility as Record<string, boolean | undefined> | undefined;
    const second = content.visibility as Record<string, boolean | undefined> | undefined;
    const visible = first?.[sectionId] !== false && second?.[sectionId] !== false;
    if (!visible) return [];
    // Prices come from authoritative Data Entry via DNS Core at render time.
    // Inline priceListTexts may hold editorial copy, not official tariff evidence.
    const issues = definition.dataContract?.validate(content) ?? [];
    return issues.length ? [{ sectionId, componentId: definition.componentId, issues }] : [];
  });
}

export function getProductBlockStack(product: FlyerProductDefinition): readonly FlyerSectionId[] {
  return product.blockStack;
}
