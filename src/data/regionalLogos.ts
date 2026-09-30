import { RegionalLogo } from '../types';
import { OFFICIAL_ASSET_PATHS } from '../components/CorporateVectors';
import logo3ZinnenSvg from '../assets/logo_regions/3-Zinnen_RGB.svg';
import logo3ZinnenBadgeWhiteSvg from '../assets/logo_regions/3-Zinnen_Badge-White_RGB.svg';
import logoAntholzertalSvg from '../assets/logo_regions/15_053_Logos_horizontal_4C_Antholzertal_2015 9-01.svg';
import logoBiathlonSvg from '../assets/logo_regions/Biathlon-01.svg';
import logoGsiesertalSvg from '../assets/logo_regions/Gsiesertal-Welsberg-Taisten-01.svg';

export const REGIONAL_LOGOS: RegionalLogo[] = [
  {
    id: 'dns_central',
    name: '01 Dolomiti NordicSki Central',
    regionName: 'Carosello Dolomiti NordicSki',
    subTitle: '900+ km di Piste Uniche nelle Dolomiti',
    primaryColor: '#0D4D5E',
    logoSrc: OFFICIAL_ASSET_PATHS.logoFarbe
  },
  {
    id: 'anterselva',
    name: '02 Antholzertal / Valle Anterselva',
    regionName: 'Antholzertal / Valle Anterselva',
    subTitle: 'Südtirol Arena Biathlon & Centro Fondo',
    primaryColor: '#0D4D5E',
    logoSrc: logoAntholzertalSvg,
    logos: [
      {
        id: 'primary',
        name: 'Logo Standard Antholzertal',
        logoSrc: logoAntholzertalSvg,
      },
      {
        id: 'biathlon',
        name: 'Logo Biathlon Anterselva',
        logoSrc: logoBiathlonSvg,
      },
      {
        id: 'both',
        name: 'Entrambi i Loghi (Standard + Biathlon)',
        logoSrc: logoAntholzertalSvg,
        secondaryLogoSrc: logoBiathlonSvg,
      }
    ]
  },
  {
    id: 'gsiesertal',
    name: '03 Gsiesertal-Welsberg-Taisten / Val Casies-Monguelfo-Tesido',
    regionName: 'Gsiesertal / Val Casies',
    subTitle: 'Welsberg-Taisten / Monguelfo-Tesido',
    primaryColor: '#0D4D5E',
    logoSrc: logoGsiesertalSvg,
    logos: [
      {
        id: 'primary',
        name: 'Logo Gsiesertal - Welsberg - Taisten',
        logoSrc: logoGsiesertalSvg,
      }
    ]
  },
  {
    id: '3_zinnen',
    name: '04 3 Zinnen Dolomites / 3 Cime Dolomiti',
    regionName: '3 Zinnen Dolomites / 3 Cime Dolomiti',
    subTitle: 'Hochpustertal / Alta Pusteria',
    primaryColor: '#0D4D5E',
    logoSrc: logo3ZinnenSvg,
    logoWhiteSrc: logo3ZinnenBadgeWhiteSvg
  },
  {
    id: 'osttirol',
    name: '05 Osttirol / Tirolo Orientale',
    regionName: 'Osttirol / Tirolo Orientale',
    subTitle: '400 km Transkranz Piste / Piste Transfrontaliere',
    primaryColor: '#0D4D5E',
    logoSrc: OFFICIAL_ASSET_PATHS.logoFarbe
  },
  {
    id: 'comelico',
    name: '06 Comelico',
    regionName: 'Comelico / Val Comelico',
    subTitle: 'Piste di Fondo tra Cime Spettacolari',
    primaryColor: '#0D4D5E',
    logoSrc: OFFICIAL_ASSET_PATHS.logoFarbe
  },
  {
    id: 'cortina',
    name: '07 Cortina d\'Ampezzo',
    regionName: 'Cortina d\'Ampezzo',
    subTitle: 'Pista Ferrovia & Fiames',
    primaryColor: '#0D4D5E',
    logoSrc: OFFICIAL_ASSET_PATHS.logoFarbe
  },
  {
    id: 'ahrntal',
    name: '08 Ahrntal / Valle Aurina',
    regionName: 'Ahrntal / Valle Aurina',
    subTitle: 'Sand in Taufers & Campo Tures',
    primaryColor: '#0D4D5E',
    logoSrc: OFFICIAL_ASSET_PATHS.logoFarbe
  },
  {
    id: 'seiser_alm_val_gardena',
    name: '09 Seiser Alm / Val Gardena',
    regionName: 'Seiser Alm / Val Gardena (Alpe di Siusi)',
    subTitle: 'Dolomites Val Gardena & Seiser Alm / Alpe di Siusi',
    primaryColor: '#0D4D5E',
    logoSrc: OFFICIAL_ASSET_PATHS.logoFarbe
  }
];
