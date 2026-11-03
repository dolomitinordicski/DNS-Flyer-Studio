import { FLYER_TEMPLATES } from '../../src/data/templates';
export { loadCurrentFlyerAccess } from '../../src/data/currentFlyerAccess';
export { saveFlyerDocument, loadOwnedFlyerDocuments, deleteFlyerDocument, publishFlyerDocument, loadOwnedPublications } from '../../src/data/flyerRepository';
export { dnsCoreDb } from '../../src/lib/dnsCore';
export { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
export const content=(area:string,title:string)=>({...FLYER_TEMPLATES.find(t=>t.id==='hotel_skipass_package')!.defaultContent,
  layoutTemplateId:'hotel_skipass_package' as const,regionId:area,title,validityPeriod:'2026-27',heroImageUrl:''});
