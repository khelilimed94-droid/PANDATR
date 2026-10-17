import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/format";
import Shell from "@/components/Shell";
export const dynamic = "force-dynamic";
export default async function ProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" }, include: { batches: true } });
  return <Shell active="/products"><div className="page-heading"><div><h1>المنتجات</h1><div className="subtitle">كتالوج المنتجات وأسعار البيع ومستويات المخزون</div></div><Link className="btn" href="/products/new">＋ إضافة منتج</Link></div>
    <div className="card"><div className="table-wrap"><table><thead><tr><th>SKU</th><th>المنتج</th><th>التصنيف</th><th>سعر البيع</th><th>المخزون الفعلي</th><th>حد التنبيه</th><th>الحالة</th></tr></thead><tbody>
    {products.map(p=>{const stock=p.batches.reduce((n,b)=>n+b.quantityLeft,0);return <tr key={p.id}><td>{p.sku}</td><td style={{fontWeight:700}}>{p.name}</td><td>{p.category||"—"}</td><td>{money(Number(p.defaultPrice))}</td><td><span className={`badge ${stock<=p.minimumStock?"orange":"green"}`}>{stock}</span></td><td>{p.minimumStock}</td><td><span className="badge">{p.active?"نشط":"موقوف"}</span></td></tr>})}
    {!products.length&&<tr><td colSpan={7} style={{textAlign:"center",padding:30}}>لا توجد منتجات. أضف منتجًا جديدًا.</td></tr>}
    </tbody></table></div></div></Shell>;
}
