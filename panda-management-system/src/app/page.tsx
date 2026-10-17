import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { money, statusLabels, dateTime } from "@/lib/format";
import Shell from "@/components/Shell";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [orders, products, delivered, pending, latest] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.order.aggregate({ where: { status: "DELIVERED" }, _sum: { totalAmount: true }, _count: true }),
    prisma.order.count({ where: { status: { in: ["NEW","CONFIRMING","CONFIRMED","PREPARING","SHIPPED","OUT_FOR_DELIVERY"] } } }),
    prisma.order.findMany({ take: 7, orderBy: { createdAt: "desc" }, include: { customer: true } })
  ]);
  const deliveredTotal = Number(delivered._sum.totalAmount ?? 0);
  return <Shell active="/">
    <div className="page-heading"><div><h1>لوحة التحكم</h1><div className="subtitle">ملخص عمليات باندا · البيانات حسب قاعدة البيانات الحالية</div></div><Link className="btn" href="/orders/new">＋ إنشاء طلب</Link></div>
    <div className="notice">هذه نسخة تأسيسية قابلة للتشغيل. قبل اعتمادها محاسبيًا، يجب استكمال دورة المشتريات والتسويات والمصروفات ومراجعة القيود.</div>
    <div className="grid" style={{marginBottom:22}}>
      <div className="card"><div className="metric-label">إجمالي الطلبات</div><div className="metric-value">{orders}</div><div className="metric-note">جميع الحالات</div></div>
      <div className="card"><div className="metric-label">طلبات قيد التنفيذ</div><div className="metric-value">{pending}</div><div className="metric-note">لم تُغلق بعد</div></div>
      <div className="card"><div className="metric-label">قيمة الطلبات المسلّمة</div><div className="metric-value">{money(deliveredTotal)}</div><div className="metric-note">إجمالي الطلبات المسلّمة، قبل احتساب المرتجعات والمصاريف</div></div>
      <div className="card"><div className="metric-label">المنتجات النشطة</div><div className="metric-value">{products}</div><div className="metric-note">في كتالوج المنتجات</div></div>
    </div>
    <div className="card">
      <div className="page-heading" style={{marginBottom:12}}><div className="section-title">أحدث الطلبات</div><Link href="/orders" style={{color:"var(--brand)",fontSize:13,fontWeight:700}}>عرض الكل ←</Link></div>
      <div className="table-wrap"><table><thead><tr><th>رقم الطلب</th><th>العميل</th><th>التاريخ</th><th>الحالة</th><th>الإجمالي</th></tr></thead>
      <tbody>{latest.length ? latest.map(o=><tr key={o.id}><td><Link href={`/orders/${o.id}`} style={{color:"var(--brand)",fontWeight:700}}>{o.orderNumber}</Link></td><td>{o.customer.name}</td><td>{dateTime(o.createdAt)}</td><td><span className="badge">{statusLabels[o.status] ?? o.status}</span></td><td>{money(Number(o.totalAmount))}</td></tr>) : <tr><td colSpan={5} style={{textAlign:"center",padding:30,color:"#8a91a0"}}>لا توجد طلبات بعد. ابدأ بإنشاء أول طلب.</td></tr>}</tbody></table></div>
    </div>
  </Shell>;
}
