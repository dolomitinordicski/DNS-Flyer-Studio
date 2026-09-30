import { FlyerContent } from '../../types';

export interface BlockProps {
  content: FlyerContent;
  theme: any;            // stesso oggetto theme già passato ai variant (FlyerVariantProps.theme)
  plt: any;              // PriceListTexts risolti
  regionLogo: any;
  activeSportsIcons: any[];
  visibility: Record<string, boolean>;
  format: 'A3' | 'A4' | 'A5';
  orientation: 'portrait' | 'landscape';
}
