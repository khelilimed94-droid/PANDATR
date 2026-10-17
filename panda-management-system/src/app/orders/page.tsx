import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { money, statusLabels, dateTime } from "@/lib/format";
import Shell from "@/components/Shell";
export const dynamic = "force-dynamic";
export default async function OrdersPage(){
  const orders=await prisma.order.findMany({orderBy:{createdAt:"desc"},include:{customer:true,seller:true,items:true}});
  return <Shell active="/orders"><div className="page-heading"><div><h1>الطلبات</h1><div className="subtitle">متابعة حالات الطلبات والعملاء والمبالغ</div></div><Link className="btn" href="/orders/new">＋ إنشاء طلب</Link></div>
  <div className="card"><div className="table-wrap"><table><thead><tr><th>رقم الطلب</th><th>العميل</th><th>الهاتف</th><th>البائع</th><th>التاريخ</th><th>الحالة</th><th>الإجمالي</th></tr></thead><tbody>
  {orders.map(o=><tr key={o.id}><td><Link href={`/orders/${o.id}`} style={{color:"var(--brand)",fontWeight:700}}>{o.orderNumber}</Link></td><td>{o.customer.name}</td><td>{o.customer.phone}</td><td>{o.seller?.name||"—"}</td><td>{dateTime(o.createdAt)}</td><td><span className="badge">{statusLabels[o.status]||o.status}</span></td><td>{money(Number(o.totalAmount))}</td></tr>)}
  {!orders.length&&<tr><td colSpan={7} style={{textAlign:"center",padding:30}}>لا توجد طلبات مسجلة.</td></tr>}</tbody></table></div></div></Shell>
}
