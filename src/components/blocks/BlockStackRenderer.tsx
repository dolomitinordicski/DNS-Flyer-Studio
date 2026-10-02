import React from 'react';
import type { FlyerSectionId } from '../../types';
import type { BlockProps } from './BlockTypes';
import { getRuntimeBlock, isBlockVisible } from './BlockEngine';

interface BlockStackRendererProps extends BlockProps {
  order: FlyerSectionId[];
  beforeBlock?: (sectionId: FlyerSectionId) => React.ReactNode;
  afterBlock?: (sectionId: FlyerSectionId) => React.ReactNode;
}

export function BlockStackRenderer({
  order,
  beforeBlock,
  afterBlock,
  ...blockProps
}: BlockStackRendererProps) {
  return (
    <>
      {order.map((sectionId) => {
        if (!isBlockVisible(sectionId, blockProps.visibility)) return null;
        const definition = getRuntimeBlock(sectionId);
        const Block = definition?.renderer;
        if (!Block) return null;

        return (
          <React.Fragment key={sectionId}>
            {beforeBlock?.(sectionId)}
            <Block {...blockProps} />
            {afterBlock?.(sectionId)}
          </React.Fragment>
        );
      })}
    </>
  );
}
