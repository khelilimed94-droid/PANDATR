import { describe, expect, it } from "vitest";
import { assertBalanced, fifoCost, isAllowedTransition } from "../lib/business";

describe("منطق الأعمال الأساسي", () => {
  it("يحسب تكلفة FIFO ويرفض الكمية غير المتاحة", () => {
    const result = fifoCost([
      { id: "a", quantityLeft: 3, unitCost: 10 },
      { id: "b", quantityLeft: 5, unitCost: 20 }
    ], 4);
    expect(result.totalCost).toBe(50);
    expect(result.deductions).toEqual([
      { batchId: "a", quantity: 3, unitCost: 10 },
      { batchId: "b", quantity: 1, unitCost: 20 }
    ]);
    expect(() => fifoCost([{ id: "a", quantityLeft: 1, unitCost: 2 }], 2)).toThrow();
  });
  it("يمنع انتقالات الطلب غير المنطقية", () => {
    expect(isAllowedTransition("SHIPPED", "DELIVERED")).toBe(true);
    expect(isAllowedTransition("NEW", "DELIVERED")).toBe(false);
  });
  it("يتحقق من توازن القيد المحاسبي", () => {
    expect(assertBalanced([{ debit: 100, credit: 0 }, { debit: 0, credit: 100 }])).toBe(true);
    expect(() => assertBalanced([{ debit: 100, credit: 0 }])).toThrow();
  });
});
