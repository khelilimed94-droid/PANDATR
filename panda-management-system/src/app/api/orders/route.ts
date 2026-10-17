import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  customer: z.object({
    name: z.string().trim().min(1).max(150), phone: z.string().trim().min(3).max(30),
    alternatePhone: z.string().trim().max(30).optional().default(""),
    province: z.string().trim().max(100).optional().default(""),
    city: z.string().trim().max(100).optional().default(""),
    address: z.string().trim().max(500).optional().default("")
  }),
  sellerId: z.string().nullable().optional(),
  shippingCost: z.number().finite().nonnegative().default(0),
  discount: z.number().finite().nonnegative().default(0),
  notes: z.string().trim().max(2000).optional().default(""),
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().positive().max(100000), unitPrice: z.number().finite().nonnegative() })).min(1).max(50)
});

export async function GET() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { customer: true, items: true } });
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "بيانات الطلب غير مكتملة أو غير صحيحة", details: parsed.error.issues }, { status: 400 });
  const data = parsed.data;
  try {
    const result = await prisma.$transaction(async tx => {
      const uniqueIds = [...new Set(data.items.map(i => i.productId))];
      const products = await tx.product.findMany({ where: { id: { in: uniqueIds }, active: true }, include: { batches: { orderBy: { purchasedAt: "asc" } } } });
      if (products.length !== uniqueIds.length) throw new Error("يوجد منتج غير موجود أو غير نشط");
      for (const item of data.items) {
        const product = products.find(p => p.id === item.productId)!;
        const available = product.batches.reduce((s,b)=>s+b.quantityLeft,0);
        const quantityForProduct = data.items.filter(i=>i.productId===item.productId).reduce((s,i)=>s+i.quantity,0);
        if (available < quantityForProduct) throw new Error(`المخزون غير كافٍ للمنتج: ${product.name}`);
      }
      if (data.sellerId && !(await tx.user.findFirst({ where: { id: data.sellerId, active: true } }))) throw new Error("البائع المحدد غير موجود");
      const subtotal = data.items.reduce((s,i)=>s+i.quantity*i.unitPrice,0);
      if (data.discount > subtotal) throw new Error("الخصم لا يمكن أن يتجاوز قيمة المنتجات");
      const customer = await tx.customer.create({ data: {
        name: data.customer.name, phone: data.customer.phone,
        alternatePhone: data.customer.alternatePhone || null, province: data.customer.province || null,
        city: data.customer.city || null, address: data.customer.address || null
      }});
      const count = await tx.order.count();
      const orderNumber = `PND-${new Date().getFullYear()}-${String(count+1).padStart(6,"0")}`;
      const order = await tx.order.create({ data: {
        orderNumber, customerId: customer.id, sellerId: data.sellerId || null,
        shippingCost: data.shippingCost, discount: data.discount,
        totalAmount: subtotal-data.discount, notes: data.notes || null,
        items: { create: data.items.map(i=>{const p=products.find(p=>p.id===i.productId)!;return {
          productId:p.id, productNameSnapshot:p.name, skuSnapshot:p.sku,
          quantity:i.quantity, unitPrice:i.unitPrice, unitCostSnapshot:0
        };})},
        statusHistory: { create: { toStatus: "NEW", note: "إنشاء الطلب" } }
      }});
      await tx.auditLog.create({data:{action:"ORDER_CREATED",entityType:"Order",entityId:order.id,afterData:{orderNumber,totalAmount:subtotal-data.discount}}});
      return {id:order.id,orderNumber};
    }, { isolationLevel: "Serializable" });
    return NextResponse.json(result,{status:201});
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر إنشاء الطلب";
    return NextResponse.json({error:message},{status:400});
  }
}
