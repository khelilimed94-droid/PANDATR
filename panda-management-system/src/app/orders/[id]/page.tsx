import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { money, statusLabels, dateTime } from "@/lib/format";
import Shell from "@/components/Shell";
import OrderStatusForm from "@/components/OrderStatusForm";
export const dynamic="force-dynamic";
export default async function OrderDetail({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const o=await prisma.order.findUnique({where:{id},include:{customer:true,seller:true,items:true,statusHistory:{orderBy:{createdAt:"desc"}}}});
 if(!o)notFound();
 return <Shell active="/orders"><div className="page-heading"><div><h1>الطلب {o.orderNumber}</h1><div className="subtitle">أنشئ في {dateTime(o.createdAt)}</div></div><span className="badge">{statusLabels[o.status]||o.status}</span></div>
 <div className="grid" style={{gridTemplateColumns:"repeat(2,minmax(0,1fr))",marginBottom:18}}>
 <div className="card"><h3 className="section-title">العميل</h3><p>{o.customer.name}</p><p>{o.customer.phone}</p><p>{[o.customer.province,o.customer.city,o.customer.address].filter(Boolean).join("، ")||"لا يوجد عنوان"}</p></div>
 <div className="card"><h3 className="section-title">ملخص الطلب</h3><p>البائع: {o.seller?.name||"—"}</p><p>الشحن: {money(Number(o.shippingCost))}</p><p>الخصم: {money(Number(o.discount))}</p><strong>الإجمالي: {money(Number(o.totalAmount))}</strong></div></div>
 <div className="card" style={{marginBottom:18}}><h3 className="section-title">المنتجات</h3><div className="table-wrap"><table><thead><tr><th>SKU</th><th>المنتج</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead><tbody>{o.items.map(i=><tr key={i.id}><td>{i.skuSnapshot}</td><td>{i.productNameSnapshot}</td><td>{i.quantity}</td><td>{money(Number(i.unitPrice))}</td><td>{money(i.quantity*Number(i.unitPrice))}</td></tr>)}</tbody></table></div></div>
 <div className="grid" style={{gridTemplateColumns:"repeat(2,minmax(0,1fr))"}}><div className="card"><h3 className="section-title">تحديث الحالة</h3><OrderStatusForm orderId={o.id} status={o.status}/></div><div className="card"><h3 className="section-title">سجل الحالة</h3>{o.statusHistory.map(h=><div key={h.id} style={{padding:"10px 0",borderBottom:"1px solid var(--line)"}}><strong>{statusLabels[h.toStatus]||h.toStatus}</strong><div className="subtitle">{dateTime(h.createdAt)} {h.note?`— ${h.note}`:""}</div></div>)}</div></div>
 </Shell>
}
