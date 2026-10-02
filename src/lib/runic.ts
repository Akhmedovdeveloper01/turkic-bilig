/**
 * O'zbek lotin yozuvidagi matnni O'rxun (qadimgi turk) runik yozuviga
 * SODDALASHTIRILGAN tarzda o'giradi. Bu o'yin/ta'lim vositasi — ilmiy
 * transliteratsiya emas (sahifada aniq ogohlantirish bilan ko'rsatiladi).
 *
 * Qo'llanadigan qoidalar:
 *  1. Har bir so'z unlilariga qarab "orqa qator" (a, o, u bor) yoki "old qator"
 *     (faqat e, i, o') deb belgilanadi va juft undoshlarning tegishli varianti
 *     tanlanadi (b¹/b², d¹/d², ...).
 *  2. q/k: o/u yonida — OQ, o' yonida — OEK, aks holda qatorga qarab AQ yoki AEK.
 *  3. a/e (a/ä) so'z boshi va oxiridan boshqa joyda yozilmaydi (O'rxun imlosiga
 *     yaqinlashtirilgan, lekin to'liq emas).
 *  4. nt/nd, lt/ld, nch, ny — qo'shma belgilar.
 *  5. O'rxun alifbosida yo'q tovushlar: f→p, v→b, x→q/k, j→č; h tushirib qoldiriladi.
 * So'zlar orasiga ikki nuqta (⁚) qo'yiladi — yodgorliklardagi so'z ajratgich kabi.
 */
const C = {
  A: '\u{10C00}', I: '\u{10C03}', O: '\u{10C06}', OE: '\u{10C07}',
  AB: '\u{10C09}', AEB: '\u{10C0B}', AG: '\u{10C0D}', AEG: '\u{10C0F}',
  AD: '\u{10C11}', AED: '\u{10C13}', EZ: '\u{10C14}', AY: '\u{10C16}', AEY: '\u{10C18}',
  AEK: '\u{10C1A}', OEK: '\u{10C1C}', AL: '\u{10C1E}', AEL: '\u{10C20}', ELT: '\u{10C21}',
  EM: '\u{10C22}', AN: '\u{10C23}', AEN: '\u{10C24}', ENT: '\u{10C26}', ENC: '\u{10C28}',
  ENY: '\u{10C2A}', ENG: '\u{10C2D}', EP: '\u{10C2F}', EC: '\u{10C32}',
  AQ: '\u{10C34}', OQ: '\u{10C38}', AR: '\u{10C3A}', AER: '\u{10C3C}',
  AS: '\u{10C3D}', AES: '\u{10C3E}', ASH: '\u{10C3F}', ESH: '\u{10C41}',
  AT: '\u{10C43}', AET: '\u{10C45}',
} as const;
type Key = keyof typeof C;

/** Juft undoshlar: [orqa, old, transliteratsiya asosi]. */
const PAIRED: Record<string, [Key, Key, string]> = {
  b: ['AB', 'AEB', 'b'], v: ['AB', 'AEB', 'b'], d: ['AD', 'AED', 'd'], y: ['AY', 'AEY', 'y'],
  l: ['AL', 'AEL', 'l'], n: ['AN', 'AEN', 'n'], r: ['AR', 'AER', 'r'], s: ['AS', 'AES', 's'],
  t: ['AT', 'AET', 't'], š: ['ASH', 'ESH', 'š'], g: ['AG', 'AEG', 'g'],
};
const NEUTRAL: Record<string, [Key, string]> = {
  z: ['EZ', 'z'], m: ['EM', 'm'], ŋ: ['ENG', 'ŋ'], p: ['EP', 'p'], f: ['EP', 'p'], č: ['EC', 'č'], j: ['EC', 'č'],
};
const VOWELS: Record<string, [Key, string, string]> = {
  // [belgi, orqa qatorda o'qilishi, old qatorda o'qilishi]
  a: ['A', 'a', 'ä'], e: ['A', 'ä', 'ä'], i: ['I', 'ı', 'i'], o: ['O', 'o', 'o'], u: ['O', 'u', 'u'], ö: ['OE', 'ö', 'ö'],
};

export interface RunicResult {
  runic: string;
  /** Har bir so'z uchun harfma-harf transliteratsiya, masalan "t² ü r² k". */
  breakdown: string[];
}

function tokenize(word: string): string[] {
  const w = word
    .toLowerCase()
    .replace(/[‘’ʻʼ`´]/g, "'")
    .replace(/o'/g, 'ö')
    .replace(/g'/g, 'ɣ')
    .replace(/sh/g, 'š')
    .replace(/ch/g, 'č')
    .replace(/ng/g, 'ŋ')
    .replace(/[^a-zöɣšč ŋ']/g, '')
    .replace(/'/g, '');
  return [...w];
}

function convertWord(word: string): { runic: string; parts: string[] } {
  const tokens = tokenize(word);
  if (tokens.length === 0) return { runic: '', parts: [] };
  const back = tokens.some((t) => t === 'a' || t === 'o' || t === 'u');
  const runic: string[] = [];
  const parts: string[] = [];
  const isVowel = (t?: string) => t !== undefined && t in VOWELS;
  const near = (i: number, set: string[]) => set.includes(tokens[i - 1]) || set.includes(tokens[i + 1]);
  const push = (k: Key, label: string) => {
    runic.push(C[k]);
    parts.push(label);
  };

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const next = tokens[i + 1];
    // Qo'shma belgilar
    if (t === 'n' && (next === 't' || next === 'd')) { push('ENT', `n${next}`); i++; continue; }
    if (t === 'l' && (next === 't' || next === 'd')) { push('ELT', `l${next}`); i++; continue; }
    if (t === 'n' && next === 'č') { push('ENC', 'nč'); i++; continue; }
    if (t === 'n' && next === 'y') { push('ENY', 'ñ'); i++; continue; }

    if (isVowel(t)) {
      const [k, rb, rf] = VOWELS[t];
      const reading = back ? rb : rf;
      const edge = i === 0 || i === tokens.length - 1;
      if ((t === 'a' || t === 'e') && !edge) continue; // 3-qoida
      push(k, reading);
      continue;
    }
    if (t === 'ɣ') { push('AG', 'ɣ'); continue; }
    if (t === 'h') continue;
    if (t === 'q' || t === 'k' || t === 'x') {
      if (near(i, ['o', 'u'])) push('OQ', 'q');
      else if (near(i, ['ö'])) push('OEK', 'k');
      else if (back) push('AQ', 'q');
      else push('AEK', 'k');
      continue;
    }
    if (t in PAIRED) {
      const [kb, kf, base] = PAIRED[t];
      push(back ? kb : kf, `${base}${back ? '¹' : '²'}`);
      continue;
    }
    if (t in NEUTRAL) {
      const [k, label] = NEUTRAL[t];
      push(k, label);
    }
  }
  return { runic: runic.join(''), parts };
}

export function toRunic(text: string): RunicResult {
  const words = text.split(/\s+/).filter(Boolean).map(convertWord).filter((w) => w.runic);
  return {
    runic: words.map((w) => w.runic).join('⁚'),
    breakdown: words.map((w) => w.parts.join(' ')),
  };
}
