import { prisma } from "@/lib/prisma";
import Shell from "@/components/Shell";
export const dynamic="force-dynamic";
export default async function InventoryPage(){
 const products=await prisma.product.findMany({where:{active:true},include:{batches:{orderBy:{purchasedAt:"asc"}}},orderBy:{name:"asc"}});
 const movements=await prisma.stockMovement.findMany({take:20,orderBy:{createdAt:"desc"},include:{product:true}});
 return <Shell active="/inventory"><div className="page-heading"><div><h1>المخزون</h1><div className="subtitle">الأرصدة حسب دفعات الشراء وسجل الحركات</div></div></div><div className="notice">في هذه المرحلة، إنشاء الطلب لا يحجز المخزون ولا يخصمه تلقائيًا. لا تستخدم هذه النسخة لتشغيل المخزون الفعلي قبل إكمال دورة الحجز والتسليم.</div>
 <div className="card" style={{marginBottom:18}}><h3 className="section-title">الأرصدة الحالية</h3><div className="table-wrap"><table><thead><tr><th>SKU</th><th>المنتج</th><th>المخزون الفعلي</th><th>حد التنبيه</th><th>عدد الدفعات</th></tr></thead><tbody>{products.map(p=>{const stock=p.batches.reduce((s,b)=>s+b.quantityLeft,0);return <tr key={p.id}><td>{p.sku}</td><td>{p.name}</td><td><span className={`badge ${stock<=p.minimumStock?"orange":"green"}`}>{stock}</span></td><td>{p.minimumStock}</td><td>{p.batches.length}</td></tr>})}</tbody></table></div></div>
 <div className="card"><h3 className="section-title">آخر حركات المخزون</h3><div className="table-wrap"><table><thead><tr><th>التاريخ</th><th>المنتج</th><th>نوع الحركة</th><th>الكمية</th><th>المرجع</th></tr></thead><tbody>{movements.map(m=><tr key={m.id}><td>{new Intl.DateTimeFormat("ar",{dateStyle:"short",timeStyle:"short"}).format(m.createdAt)}</td><td>{m.product.name}</td><td>{m.type}</td><td>{m.quantity}</td><td>{m.reference||"—"}</td></tr>)}{!movements.length&&<tr><td colSpan={5}>لا توجد حركات.</td></tr>}</tbody></table></div></div></Shell>
}
