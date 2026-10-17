import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@panda.local";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await prisma.user.create({
      data: {
        name: "مدير النظام",
        email,
        passwordHash: await bcrypt.hash("ChangeMe123!", 12),
        role: Role.ADMIN
      }
    });
  }

  const products = [
    { sku: "PANDA-001", name: "ساعة تجريبية", defaultPrice: 950, minimumStock: 5, category: "إكسسوارات" },
    { sku: "PANDA-002", name: "قلادة تجريبية", defaultPrice: 650, minimumStock: 5, category: "إكسسوارات" }
  ];
  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: { ...p, defaultPrice: p.defaultPrice }
    });
    const batchCount = await prisma.stockBatch.count({ where: { productId: product.id } });
    if (batchCount === 0) {
      const batch = await prisma.stockBatch.create({
        data: { productId: product.id, quantityIn: 20, quantityLeft: 20, unitCost: 180, invoiceNumber: "SEED-001" }
      });
      await prisma.stockMovement.create({
        data: { productId: product.id, batchId: batch.id, type: "RECEIPT", quantity: 20, reference: "SEED-001", note: "بيانات تجريبية" }
      });
    }
  }

  const accounts = [
    ["1000", "الصندوق", "ASSET"], ["1100", "مستحقات شركات الشحن", "ASSET"],
    ["1200", "المخزون", "ASSET"], ["2000", "ديون الموردين", "LIABILITY"],
    ["4000", "إيرادات المبيعات", "REVENUE"], ["5000", "تكلفة البضاعة المباعة", "EXPENSE"],
    ["5100", "مصاريف الشحن", "EXPENSE"], ["5200", "عمولات البائعين", "EXPENSE"]
  ] as const;
  for (const [code, name, type] of accounts) {
    await prisma.account.upsert({ where: { code }, update: {}, create: { code, name, type } });
  }
}
main().finally(() => prisma.$disconnect());
