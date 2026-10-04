/**
 * Silsila (shajara) joylashuvi — build vaqtida hisoblanadi, sahifada JavaScript kerak emas.
 * Oddiy tartibli daraxt: barglar ketma-ket joylashadi, ota esa birinchi va oxirgi
 * farzandining o'rtasida turadi. Koordinatalar mantiqiy (inline-start dan) — RTL'da
 * tugunlar `inset-inline-start` bilan, chiziqlar esa SVG ni ko'zguda aks ettirish bilan
 * to'g'ri chiqadi.
 */
export interface TreeInput {
  id: string;
  parent?: string;
}

export interface TreeNode {
  id: string;
  x: number;
  y: number;
  depth: number;
  children: string[];
}

export interface TreeLayout {
  nodes: Map<string, TreeNode>;
  order: string[];
  /** Ota → farzand bog'lanishlari uchun SVG yo'llari (strelka farzand tomonda). */
  paths: string[];
  width: number;
  height: number;
  rootId: string;
}

export const NODE_W = 204;
export const NODE_H = 92;
const GAP_X = 20;
const GAP_Y = 64;

export function layoutTree(members: TreeInput[]): TreeLayout {
  const children = new Map<string, string[]>(members.map((m) => [m.id, []]));
  for (const m of members) if (m.parent) children.get(m.parent)!.push(m.id);
  const rootId = members.find((m) => !m.parent)!.id;

  const nodes = new Map<string, TreeNode>();
  const order: string[] = [];
  let nextLeaf = 0;
  let maxDepth = 0;

  // Barglarga ketma-ket o'rin, otaga farzandlarining o'rtasi (o'rinlar NODE_W + GAP_X birligida).
  const place = (id: string, depth: number): number => {
    order.push(id);
    maxDepth = Math.max(maxDepth, depth);
    const kids = children.get(id)!;
    const slot = kids.length === 0 ? nextLeaf++ : (() => {
      const xs = kids.map((k) => place(k, depth + 1));
      return (xs[0] + xs[xs.length - 1]) / 2;
    })();
    nodes.set(id, { id, x: slot * (NODE_W + GAP_X), y: depth * (NODE_H + GAP_Y), depth, children: kids });
    return slot;
  };
  place(rootId, 0);

  const paths: string[] = [];
  for (const n of nodes.values()) {
    if (n.children.length === 0) continue;
    const px = n.x + NODE_W / 2;
    const py = n.y + NODE_H;
    const midY = py + GAP_Y / 2;
    for (const k of n.children) {
      const c = nodes.get(k)!;
      const cx = c.x + NODE_W / 2;
      // Otadan pastga, gorizontal, so'ng farzandga (strelka uchun 6px qoldiriladi).
      paths.push(`M${px} ${py} V${midY} H${cx} V${c.y - 6}`);
    }
  }

  return {
    nodes,
    order,
    paths,
    width: nextLeaf * (NODE_W + GAP_X) - GAP_X,
    height: (maxDepth + 1) * (NODE_H + GAP_Y) - GAP_Y,
    rootId,
  };
}
