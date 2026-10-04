/**
 * Silsila (shajara) joylashuvi — build vaqtida hisoblanadi, sahifada JavaScript kerak emas.
 * Gorizontal tartibli daraxt: avlodlar inline-start dan inline-end tomonga (chapdan o'ngga,
 * RTL'da o'ngdan chapga), aka-ukalar yuqoridan pastga. Barglar ketma-ket qatorga joylashadi,
 * ota esa birinchi va oxirgi farzandining o'rtasida turadi — katta silsilalarda ham kenglik
 * faqat avlodlar soniga bog'liq bo'ladi. Koordinatalar mantiqiy: tugunlar `inset-inline-start`
 * bilan, chiziqlar esa SVG ni ko'zguda aks ettirish bilan RTL'da ham to'g'ri chiqadi.
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
  parent?: string;
  children: string[];
}

export interface TreeEdge {
  from: string;
  to: string;
  d: string;
}

export interface TreeLayout {
  nodes: Map<string, TreeNode>;
  order: string[];
  /** Ota → farzand bog'lanishlari (strelka farzand tomonda). */
  edges: TreeEdge[];
  width: number;
  height: number;
  rootId: string;
}

export const NODE_W = 208;
export const NODE_H = 64;
const GAP_X = 44;
const GAP_Y = 10;

export function layoutTree(members: TreeInput[]): TreeLayout {
  const children = new Map<string, string[]>(members.map((m) => [m.id, []]));
  for (const m of members) if (m.parent) children.get(m.parent)!.push(m.id);
  const parentOf = new Map(members.map((m) => [m.id, m.parent]));
  const rootId = members.find((m) => !m.parent)!.id;

  const nodes = new Map<string, TreeNode>();
  const order: string[] = [];
  let nextLeaf = 0;
  let maxDepth = 0;

  const place = (id: string, depth: number): number => {
    order.push(id);
    maxDepth = Math.max(maxDepth, depth);
    const kids = children.get(id)!;
    let row: number;
    if (kids.length === 0) row = nextLeaf++;
    else {
      const rows = kids.map((k) => place(k, depth + 1));
      row = (rows[0] + rows[rows.length - 1]) / 2;
    }
    nodes.set(id, { id, x: depth * (NODE_W + GAP_X), y: row * (NODE_H + GAP_Y), depth, parent: parentOf.get(id), children: kids });
    return row;
  };
  place(rootId, 0);

  const edges: TreeEdge[] = [];
  for (const n of nodes.values()) {
    if (n.children.length === 0) continue;
    const px = n.x + NODE_W;
    const py = n.y + NODE_H / 2;
    const midX = px + GAP_X / 2;
    for (const k of n.children) {
      const c = nodes.get(k)!;
      // Otadan inline-end tomonga, vertikal, so'ng farzandga (strelka uchun 6px qoldiriladi).
      edges.push({ from: n.id, to: k, d: `M${px} ${py} H${midX} V${c.y + NODE_H / 2} H${c.x - 6}` });
    }
  }

  return {
    nodes,
    order,
    edges,
    width: (maxDepth + 1) * (NODE_W + GAP_X) - GAP_X,
    height: nextLeaf * (NODE_H + GAP_Y) - GAP_Y,
    rootId,
  };
}

/** Shaxs va uning barcha ota-bobolari (ildizgacha). */
export function lineage(layout: TreeLayout, id: string): Set<string> {
  const out = new Set<string>();
  let cur: string | undefined = id;
  while (cur) {
    out.add(cur);
    cur = layout.nodes.get(cur)?.parent;
  }
  return out;
}
