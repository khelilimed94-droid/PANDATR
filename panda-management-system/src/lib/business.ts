export type Batch = { id: string; quantityLeft: number; unitCost: number };
export function fifoCost(batches: Batch[], quantity: number) {
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error("الكمية يجب أن تكون عددًا صحيحًا موجبًا");
  const available = batches.reduce((sum, b) => sum + b.quantityLeft, 0);
  if (available < quantity) throw new Error("المخزون المتاح غير كافٍ");
  let remaining = quantity;
  let total = 0;
  const deductions: { batchId: string; quantity: number; unitCost: number }[] = [];
  for (const batch of batches) {
    if (remaining === 0) break;
    const take = Math.min(remaining, batch.quantityLeft);
    if (take > 0) {
      deductions.push({ batchId: batch.id, quantity: take, unitCost: batch.unitCost });
      total += take * batch.unitCost;
      remaining -= take;
    }
  }
  return { totalCost: Number(total.toFixed(2)), deductions };
}

export function isAllowedTransition(from: string, to: string) {
  const transitions: Record<string, string[]> = {
    NEW: ["CONFIRMING", "CONFIRMED", "CANCELLED"],
    CONFIRMING: ["CONFIRMED", "REFUSED", "CANCELLED"],
    CONFIRMED: ["PREPARING", "CANCELLED"],
    PREPARING: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERY_FAILED", "REFUSED", "DELIVERED"],
    OUT_FOR_DELIVERY: ["DELIVERED", "DELIVERY_FAILED", "REFUSED"],
    DELIVERY_FAILED: ["SHIPPED", "RETURNED", "CANCELLED"],
    REFUSED: ["RETURNED"],
    DELIVERED: ["RETURNED"],
    RETURNED: [],
    CANCELLED: []
  };
  return from === to || (transitions[from] ?? []).includes(to);
}

export function assertBalanced(lines: { debit: number; credit: number }[]) {
  const debit = lines.reduce((s, x) => s + x.debit, 0);
  const credit = lines.reduce((s, x) => s + x.credit, 0);
  if (Math.abs(debit - credit) > 0.005) throw new Error("القيد المحاسبي غير متوازن");
  if (lines.some(x => x.debit < 0 || x.credit < 0 || (x.debit > 0 && x.credit > 0))) {
    throw new Error("كل سطر يجب أن يكون مدينًا أو دائنًا فقط وبقيمة غير سالبة");
  }
  return true;
}
