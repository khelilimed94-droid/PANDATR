export const money = (value: number | string) =>
  new Intl.NumberFormat("ar-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 }).format(Number(value));
export const dateTime = (value: Date | string) =>
  new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(new Date(value));
export const statusLabels: Record<string, string> = {
  NEW: "جديد", CONFIRMING: "قيد التأكيد", CONFIRMED: "مؤكد", PREPARING: "قيد التجهيز",
  SHIPPED: "تم الشحن", OUT_FOR_DELIVERY: "قيد التوصيل", DELIVERED: "تم التسليم",
  REFUSED: "رفض الاستلام", DELIVERY_FAILED: "فشل التسليم", RETURNED: "مرتجع", CANCELLED: "ملغى"
};
