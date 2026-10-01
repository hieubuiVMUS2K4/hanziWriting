const toneVowels: Record<string, string> = {
  a: 'āáǎàa', e: 'ēéěèe', i: 'īíǐìi', o: 'ōóǒòo', u: 'ūúǔùu', ü: 'ǖǘǚǜü',
};

function markSyllable(raw: string, tone: number): string {
  const syllable = raw.replace(/u:/gi, 'ü').replace(/v/gi, 'ü');
  const lower = syllable.toLowerCase();
  const index = lower.includes('a') ? lower.indexOf('a')
    : lower.includes('e') ? lower.indexOf('e')
      : lower.includes('ou') ? lower.indexOf('o')
        : Math.max(...Array.from(lower).map((character, position) => toneVowels[character] ? position : -1));
  if (index < 0 || tone === 0 || tone === 5) return syllable;
  const vowel = toneVowels[lower[index]][tone - 1];
  const marked = syllable[index] === syllable[index].toUpperCase() ? vowel.toUpperCase() : vowel;
  return syllable.slice(0, index) + marked + syllable.slice(index + 1);
}

/** Display numbered syllables as tone marks; an erhua suffix is not a separate syllable. */
export function formatPinyin(pinyin: string): string {
  if (!/[0-5]/.test(pinyin)) return pinyin;
  return pinyin.replace(/([a-züv:]+)([0-5])(r(?=$|[^a-züv:]))?/gi,
    (_, syllable: string, tone: string, suffix: string = '') => ` ${markSyllable(syllable, Number(tone))}${suffix} `)
    .replace(/\s+/g, ' ').replace(/\s*([…]+)\s*/g, '$1').trim();
}
