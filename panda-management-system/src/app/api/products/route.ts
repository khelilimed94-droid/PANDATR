import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  sku: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(150),
  category: z.string().trim().max(100).optional().default(""),
  description: z.string().trim().max(2000).optional().default(""),
  defaultPrice: z.number().finite().nonnegative(),
  minimumStock: z.number().int().nonnegative().max(1000000)
});

export async function GET() {
  const products = await prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" }, include: { batches: true } });
  return NextResponse.json(products.map(p => ({...p, defaultPrice: Number(p.defaultPrice), stock: p.batches.reduce((s,b)=>s+b.quantityLeft,0), batches: undefined})));
}

export async function POST(req: Request) {
  try {
    const parsed = productSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "تحقق من الحقول المدخلة", details: parsed.error.issues }, { status: 400 });
    const data = parsed.data;
    const product = await prisma.product.create({ data: { ...data, category: data.category || null, description: data.description || null } });
    await prisma.auditLog.create({ data: { action: "PRODUCT_CREATED", entityType: "Product", entityId: product.id, afterData: { sku: product.sku, name: product.name } } });
    return NextResponse.json({ id: product.id }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ error: "رمز SKU مستخدم مسبقًا" }, { status: 409 });
    return NextResponse.json({ error: "تعذر حفظ المنتج" }, { status: 500 });
  }
}
