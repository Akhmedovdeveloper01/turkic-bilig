/**
 * Statik xaritalardagi (StateMap, OriginMap) nuqta yorliqlarini joylashtirish.
 *
 * Yorliq joyini tanlash mobil kenglik (~360px, shrift ~10px) bo'yicha
 * hisoblanadi — kengroq ekranda joy faqat ko'payadi. Nomlar bir-birining
 * ustiga tushmasligi uchun sharq → g'arb → shimol → janub tartibida
 * birinchi bo'sh joy tanlanadi. Nuqtalar muhimlik tartibida berilishi kerak
 * (birinchisi joyni birinchi egallaydi).
 */
export type LabelPlace = 'e' | 'w' | 'n' | 's';

type Box = [number, number, number, number];
const overlaps = (a: Box, b: Box) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];

export interface LabelPoint {
  x: number;
  y: number;
  /** null — nuqta yorliqsiz (faqat belgi), lekin joyni band qiladi. */
  label: string | null;
}

export interface PlacedPoint {
  place: LabelPlace | null;
  /** Xarita kengligi/balandligiga nisbatan foiz (HTML qatlam uchun). */
  left: string;
  top: string;
}

export function placeLabels(points: LabelPoint[], width: number, height: number): PlacedPoint[] {
  const scale = 360 / width;
  const maxX = width * scale;
  const maxY = height * scale;

  const occupied: Box[] = points.map((p) => {
    const px = p.x * scale;
    const py = p.y * scale;
    return [px - 5, py - 5, px + 5, py + 5];
  });

  return points.map((p) => {
    let place: LabelPlace | null = null;
    if (p.label) {
      const px = p.x * scale;
      const py = p.y * scale;
      const w = p.label.length * 6 + 8;
      const h = 14;
      const candidates: [LabelPlace, Box][] = [
        ['e', [px + 6, py - h / 2, px + 6 + w, py + h / 2]],
        ['w', [px - 6 - w, py - h / 2, px - 6, py + h / 2]],
        ['n', [px - w / 2, py - 6 - h, px + w / 2, py - 6]],
        ['s', [px - w / 2, py + 6, px + w / 2, py + 6 + h]],
      ];
      const inBounds = (b: Box) => b[0] >= 0 && b[1] >= 0 && b[2] <= maxX && b[3] <= maxY;
      const free = candidates.find(([, b]) => inBounds(b) && !occupied.some((o) => overlaps(o, b)));
      const chosen = free ?? candidates.find(([, b]) => inBounds(b)) ?? candidates[0];
      place = chosen[0];
      occupied.push(chosen[1]);
    }
    return {
      place,
      left: ((p.x / width) * 100).toFixed(2),
      top: ((p.y / height) * 100).toFixed(2),
    };
  });
}
