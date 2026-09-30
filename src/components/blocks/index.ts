import React from 'react';
import { FlyerSectionId } from '../../types';
import { BlockProps } from './BlockTypes';
import { BrandHeaderBlock } from './BrandHeaderBlock';
import { BigTitleBlock } from './BigTitleBlock';
import { HeroMediaBlock } from './HeroMediaBlock';
import { PromoHeroBlock } from './PromoHeroBlock';
import { EarlyBirdBlock } from './EarlyBirdBlock';
import { PriceTableBlock } from './PriceTableBlock';
import { ServiceGridBlock } from './ServiceGridBlock';
import { CustomBannerBlock } from './CustomBannerBlock';
import { CallToActionBlock } from './CallToActionBlock';
import { DisclaimerBlock } from './DisclaimerBlock';
import { BrandFooterBlock } from './BrandFooterBlock';

export * from './BlockTypes';
export { BrandHeaderBlock } from './BrandHeaderBlock';
export { BigTitleBlock } from './BigTitleBlock';
export { HeroMediaBlock } from './HeroMediaBlock';
export { PromoHeroBlock } from './PromoHeroBlock';
export { EarlyBirdBlock } from './EarlyBirdBlock';
export { PriceTableBlock } from './PriceTableBlock';
export { ServiceGridBlock } from './ServiceGridBlock';
export { CustomBannerBlock } from './CustomBannerBlock';
export { CallToActionBlock } from './CallToActionBlock';
export { DisclaimerBlock } from './DisclaimerBlock';
export { BrandFooterBlock } from './BrandFooterBlock';

export const BLOCK_REGISTRY: Partial<Record<FlyerSectionId, React.FC<BlockProps>>> = {
  header: BrandHeaderBlock,
  bigTitle: BigTitleBlock,
  heroImage: HeroMediaBlock,
  earlyBird: EarlyBirdBlock,
  promotionBox: PromoHeroBlock,
  priceTables: PriceTableBlock,
  servicesBox: ServiceGridBlock,
  ecoBanner: CustomBannerBlock,
  qrCode: CallToActionBlock,
  disclaimer: DisclaimerBlock,
  footer: BrandFooterBlock,
};

