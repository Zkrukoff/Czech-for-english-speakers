/**
 * Simple line pictograms for the exam's picture tasks, in the app's own
 * style: 48 × 48, drawn with the current text colour. Static markup written
 * here, never from content, so it is safe to inline.
 */
export const PICTOGRAMS: Record<string, { en: string; svg: string }> = {
  bread: { en: 'a loaf of bread', svg: '<path d="M8 22c0-7 7-11 16-11s16 4 16 11v15H8z"/><path d="M17 17l3 5M24 15l3 5M31 17l3 5"/>' },
  eggs: { en: 'eggs', svg: '<ellipse cx="18" cy="27" rx="8" ry="11"/><ellipse cx="31" cy="29" rx="7" ry="9.5"/>' },
  apple: { en: 'an apple', svg: '<path d="M24 15c-4-3-14-3-14 9 0 9 6 16 10 16 2 0 3-1 4-1s2 1 4 1c4 0 10-7 10-16 0-12-10-12-14-9z"/><path d="M24 15c0-4 2-7 5-8"/>' },
  cake: { en: 'a cake', svg: '<rect x="9" y="24" width="30" height="14" rx="2"/><path d="M9 30c5 3 10-3 15 0s10 3 15 0"/><path d="M24 24v-7"/><path d="M24 11c-2 2.5-2 4 0 6 2-2 2-3.5 0-6z"/>' },
  chicken: { en: 'a chicken leg', svg: '<path d="M26 28c-5 0-9-4-8-9 1-6 6-9 12-9 6 0 9 5 8 10-1 6-7 9-12 8z"/><path d="M22 27l-6 6"/><circle cx="14" cy="35" r="3"/><circle cx="18" cy="38" r="2.5"/>' },
  sweets: { en: 'sweets', svg: '<circle cx="24" cy="24" r="7"/><path d="M17 24l-8-6v12zM31 24l8-6v12z"/>' },
  coffee: { en: 'a cup of coffee', svg: '<path d="M11 18h22v10a9 9 0 0 1-9 9h-4a9 9 0 0 1-9-9z"/><path d="M33 21h3a4 4 0 0 1 0 8h-3"/><path d="M18 7c-2 3 2 4 0 7M25 7c-2 3 2 4 0 7"/>' },
  fish: { en: 'a fish', svg: '<path d="M8 24c6-8 18-10 26 0-8 10-20 8-26 0z"/><path d="M34 24l7-6v12z"/><circle cx="16" cy="22" r="1.5"/>' },
  cheese: { en: 'cheese', svg: '<path d="M8 34V22l28-10 4 10v12z"/><path d="M8 22h32"/><circle cx="18" cy="28" r="2"/><circle cx="30" cy="29" r="2.5"/>' },
  milk: { en: 'a carton of milk', svg: '<path d="M17 6h14v6l4 6v24H13V18l4-6z"/><path d="M13 24h22"/>' },
  carrot: { en: 'a carrot', svg: '<path d="M31 17c-4-4-9-1-11 3L9 39l19-11c4-2 7-7 3-11z"/><path d="M31 17l4-8M31 17l8-2M31 17l6-6"/>' },
  pizza: { en: 'a slice of pizza', svg: '<path d="M24 41L8 12c10-5 22-5 32 0z"/><path d="M10 16c9-4 19-4 28 0"/><circle cx="22" cy="22" r="2"/><circle cx="28" cy="29" r="2"/>' },
  key: { en: 'a key', svg: '<circle cx="15" cy="24" r="7"/><path d="M22 24h18M34 24v6M39 24v5"/>' },
  wallet: { en: 'a wallet', svg: '<rect x="7" y="14" width="34" height="24" rx="3"/><path d="M7 20h30"/><rect x="30" y="25" width="11" height="7" rx="2"/>' },
  phone: { en: 'a mobile phone', svg: '<rect x="15" y="6" width="18" height="36" rx="3"/><path d="M21 36h6"/>' },
  glasses: { en: 'glasses', svg: '<circle cx="14" cy="27" r="6"/><circle cx="34" cy="27" r="6"/><path d="M20 26c2-2 6-2 8 0M8 27l-2-8M40 27l2-8"/>' },
  umbrella: { en: 'an umbrella', svg: '<path d="M6 24a18 18 0 0 1 36 0z"/><path d="M24 24v13a4 4 0 0 1-8 0M24 6v2"/>' },
  bag: { en: 'a shopping bag', svg: '<path d="M10 16h28l-2 25H12z"/><path d="M18 20v-6a6 6 0 0 1 12 0v6"/>' },
  ticket: { en: 'a ticket', svg: '<path d="M7 15h34v6a3 3 0 0 0 0 6v6H7v-6a3 3 0 0 0 0-6z"/><path d="M28 16v3M28 22v4M28 29v3"/>' },
  book: { en: 'a book', svg: '<path d="M24 12c-5-3-12-3-16-1v27c4-2 11-2 16 1 5-3 12-3 16-1V11c-4-2-11-2-16 1z"/><path d="M24 12v27"/>' },
  clock: { en: 'a clock', svg: '<circle cx="24" cy="24" r="16"/><path d="M24 14v10l7 4"/>' },
  shoe: { en: 'a shoe', svg: '<path d="M6 32V20h10l4 5 14 3c4 1 8 3 8 7v1H6z"/><path d="M6 36h36"/>' },
  jacket: { en: 'a jacket', svg: '<path d="M18 8l6 6 6-6 9 5-3 10-4-2v19H16V21l-4 2-3-10z"/><path d="M24 14v26"/>' },
  bike: { en: 'a bicycle', svg: '<circle cx="13" cy="31" r="7"/><circle cx="35" cy="31" r="7"/><path d="M13 31l7-12h11l4 12M20 19l5 12h-12M29 14h4M17 16h6"/>' },
  car: { en: 'a car', svg: '<path d="M8 32v-6l4-9h24l4 9v6z"/><path d="M8 26h32"/><circle cx="15" cy="33" r="3.5"/><circle cx="33" cy="33" r="3.5"/>' },
  bus: { en: 'a bus', svg: '<rect x="10" y="7" width="28" height="30" rx="4"/><path d="M10 22h28M10 14h28"/><circle cx="16" cy="30" r="2"/><circle cx="32" cy="30" r="2"/><path d="M14 37v4M34 37v4"/>' },
  tram: { en: 'a tram', svg: '<rect x="11" y="12" width="26" height="25" rx="3"/><path d="M18 12l6-6 6 6M11 24h26"/><circle cx="17" cy="31" r="2"/><circle cx="31" cy="31" r="2"/><path d="M15 37l-3 5M33 37l3 5"/>' },
  train: { en: 'a train', svg: '<path d="M12 8h24l2 26H10z"/><path d="M11 22h26"/><circle cx="17" cy="29" r="2"/><circle cx="31" cy="29" r="2"/><path d="M14 34l-4 7M34 34l4 7M8 41h32"/>' },
  plane: { en: 'a plane', svg: '<path d="M22 6c1-2 3-2 4 0v13l15 9v4l-15-4v8l5 4v3l-7-2-7 2v-3l5-4v-8L7 32v-4l15-9z"/>' },
  suitcase: { en: 'a suitcase', svg: '<rect x="8" y="15" width="32" height="24" rx="3"/><path d="M18 15V10h12v5M8 25h32"/>' },
  wrench: { en: 'a spanner (repairs)', svg: '<path d="M32 8a8 8 0 0 0-8 11L9 34a3 3 0 0 0 5 5l15-15a8 8 0 0 0 11-8l-5 4-5-1-1-5z"/>' },
  warning: { en: 'a warning sign (something is wrong)', svg: '<path d="M24 7L4 41h40z"/><path d="M24 19v11"/><circle cx="24" cy="35" r="1.5"/>' },
  house: { en: 'a house', svg: '<path d="M8 22L24 9l16 13"/><path d="M12 19v20h24V19"/><path d="M21 39V29h6v10"/>' },
  doctor: { en: "a doctor's surgery (a medical cross)", svg: '<rect x="8" y="8" width="32" height="32" rx="4"/><path d="M24 15v18M15 24h18"/>' },
  pill: { en: 'a pill (medicine)', svg: '<path d="M14 34a7 7 0 0 1 0-10l10-10a7 7 0 0 1 10 10L24 34a7 7 0 0 1-10 0z"/><path d="M19 19l10 10"/>' },
  thermometer: { en: 'a thermometer (a fever)', svg: '<path d="M20 30V10a4 4 0 0 1 8 0v20a8 8 0 1 1-8 0z"/><path d="M24 16v17"/>' },
  tooth: { en: 'a tooth (the dentist)', svg: '<path d="M14 8c-5 0-7 5-6 10 1 4 3 6 3 11 0 6 2 11 5 11s3-9 8-9 5 9 8 9 5-5 5-11c0-5 2-7 3-11 1-5-1-10-6-10-4 0-6 2-10 2s-6-2-10-2z"/>' },
  bed: { en: 'a bed', svg: '<path d="M6 36V12M6 28h36v8M42 28v-4a6 6 0 0 0-6-6H20v10"/><circle cx="13" cy="22" r="4"/>' },
  rain: { en: 'rain', svg: '<path d="M14 26a8 8 0 0 1 1-16 10 10 0 0 1 19 3 6.5 6.5 0 0 1 0 13z"/><path d="M16 32l-2 6M24 32l-2 6M32 32l-2 6"/>' },
  sun: { en: 'sun', svg: '<circle cx="24" cy="24" r="7"/><path d="M24 6v5M24 37v5M6 24h5M37 24h5M11 11l4 4M33 33l4 4M37 11l-4 4M11 37l4-4"/>' },
  snow: { en: 'snow', svg: '<path d="M24 6v36M8 15l32 18M40 15L8 33"/><path d="M20 9l4 4 4-4M20 39l4-4 4 4"/>' },
  money: { en: 'money', svg: '<rect x="6" y="14" width="36" height="20" rx="2"/><circle cx="24" cy="24" r="5"/><path d="M11 19v10M37 19v10"/>' },
  shop: { en: 'a shop', svg: '<path d="M8 18l3-9h26l3 9"/><path d="M8 18c0 3 3 5 5.5 5s5.5-2 5.5-5c0 3 2.5 5 5 5s5-2 5-5c0 3 2.5 5 5.5 5S40 21 40 18"/><path d="M11 23v17h26V23M20 40V30h8v10"/>' },
  people: { en: 'people (a group)', svg: '<circle cx="17" cy="16" r="5"/><circle cx="32" cy="16" r="5"/><path d="M8 38c0-7 4-12 9-12s9 5 9 12M23 38c0-7 4-12 9-12s9 5 9 12"/>' },
  person: { en: 'a person', svg: '<circle cx="24" cy="14" r="6"/><path d="M12 40c0-9 5-15 12-15s12 6 12 15"/>' },
  film: { en: 'a film (the cinema)', svg: '<rect x="7" y="12" width="34" height="24" rx="2"/><path d="M7 18h34M7 30h34M13 12v6M21 12v6M29 12v6M37 12v6M13 30v6M21 30v6M29 30v6M37 30v6"/>' },
  swimming: { en: 'swimming', svg: '<path d="M6 32c3 0 3 2 6 2s3-2 6-2 3 2 6 2 3-2 6-2 3 2 6 2 3-2 6-2M6 40c3 0 3 2 6 2s3-2 6-2 3 2 6 2 3-2 6-2 3 2 6 2 3-2 6-2"/><circle cx="31" cy="15" r="4"/><path d="M12 26l9-9 6 6 6-2"/>' },
  ball: { en: 'a football', svg: '<circle cx="24" cy="24" r="16"/><path d="M24 16l7 5-3 8h-8l-3-8z"/><path d="M24 16V8M31 21l8-3M28 29l5 7M20 29l-5 7M17 21l-8-3"/>' },
  museum: { en: 'a museum', svg: '<path d="M6 18L24 8l18 10zM8 40h32M10 36h28"/><path d="M12 20v14M20 20v14M28 20v14M36 20v14"/>' },
  tree: { en: 'a tree (a park)', svg: '<path d="M24 42V28"/><path d="M24 6c-8 0-13 7-11 13-4 2-4 10 3 11h16c7-1 7-9 3-11 2-6-3-13-11-13z"/>' },
  restaurant: { en: 'a fork and knife (a restaurant)', svg: '<path d="M15 6v12a4 4 0 0 0 8 0V6M19 6v36"/><path d="M33 42V6c-4 3-6 9-6 16h6"/>' },
  gift: { en: 'a present', svg: '<rect x="8" y="18" width="32" height="8"/><path d="M11 26v14h26V26M24 18v22"/><path d="M24 18c-3-6-11-7-11-2 0 2 4 2 11 2zM24 18c3-6 11-7 11-2 0 2-4 2-11 2z"/>' },
  flowers: { en: 'a flower', svg: '<circle cx="24" cy="14" r="5"/><path d="M24 19v23M24 30c-4-6-10-5-12-2 4 3 8 3 12 2zM24 34c4-6 10-5 12-2-4 3-8 3-12 2z"/>' },
  wine: { en: 'a glass of wine', svg: '<path d="M16 6h16v8c0 6-4 10-8 10s-8-4-8-10z"/><path d="M24 24v14M16 42h16M16 12h16"/>' },
  beer: { en: 'a glass of beer', svg: '<path d="M12 14h20v26H12z"/><path d="M32 19h4a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-4"/><path d="M12 14c0-4 4-6 7-4 2-3 8-3 10 0 3-1 5 1 3 4"/><path d="M18 20v14M25 20v14"/>' },
  glass: { en: 'a glass (a drink)', svg: '<path d="M14 8h20l-3 32H17z"/><path d="M15 18h18"/>' },
  mountains: { en: 'mountains', svg: '<path d="M4 40L18 16l8 12 5-7 13 19z"/><path d="M14 23l4 3 3-3"/>' },
  calendar: { en: 'a calendar (when?)', svg: '<rect x="8" y="10" width="32" height="30" rx="3"/><path d="M8 18h32M16 6v8M32 6v8"/><path d="M15 25h4M22 25h4M29 25h4M15 32h4M22 32h4"/>' },
  question: { en: 'a question mark (why?)', svg: '<circle cx="24" cy="24" r="17"/><path d="M18 19a6 6 0 1 1 8 5c-2 1-2 2-2 5"/><circle cx="24" cy="34" r="1.5"/>' },
  plate: { en: 'a plate (food)', svg: '<circle cx="24" cy="25" r="13"/><circle cx="24" cy="25" r="7"/><path d="M5 10v8a3 3 0 0 0 3 3v19M43 10v30"/>' },
  pin: { en: 'a map pin (where?)', svg: '<path d="M24 42s-13-13-13-22a13 13 0 0 1 26 0c0 9-13 22-13 22z"/><circle cx="24" cy="20" r="5"/>' },
  laptop: { en: 'a laptop', svg: '<rect x="10" y="10" width="28" height="20" rx="2"/><path d="M5 36h38l-3-6H8z"/>' },
  letter: { en: 'a letter (an e-mail)', svg: '<rect x="6" y="12" width="36" height="24" rx="2"/><path d="M6 14l18 13 18-13"/>' },
  smile: { en: 'a happy face', svg: '<circle cx="24" cy="24" r="17"/><circle cx="18" cy="20" r="1.5"/><circle cx="30" cy="20" r="1.5"/><path d="M16 28c4 6 12 6 16 0"/>' },
  sad: { en: 'a sad face', svg: '<circle cx="24" cy="24" r="17"/><circle cx="18" cy="20" r="1.5"/><circle cx="30" cy="20" r="1.5"/><path d="M16 33c4-6 12-6 16 0"/>' },
  dog: { en: 'a dog', svg: '<path d="M12 22l-4-10 8 4h14l8-4-4 10v8c0 6-5 10-10 10h-2c-5 0-10-4-10-10z"/><circle cx="19" cy="24" r="1.5"/><circle cx="29" cy="24" r="1.5"/><path d="M22 31h4"/>' },
  cart: { en: 'a shopping trolley', svg: '<path d="M5 8h6l5 22h22l4-15H13"/><circle cx="19" cy="37" r="3"/><circle cx="35" cy="37" r="3"/>' },
  bathroom: { en: 'soap and a towel (the bathroom)', svg: '<rect x="8" y="22" width="16" height="12" rx="5"/><path d="M30 8h10v32H30z"/><path d="M30 16h10"/>' },
};

export const PICTURE_IDS = new Set(Object.keys(PICTOGRAMS));

/**
 * One pictogram. Give `label` when the picture is the question (it becomes
 * the accessible name); without it the picture is decorative.
 */
export function Pictogram({ id, size = 64, label, className = '' }: { id: string; size?: number; label?: string; className?: string }) {
  const p = PICTOGRAMS[id];
  if (!p) return null;
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      dangerouslySetInnerHTML={{ __html: p.svg }}
    />
  );
}
