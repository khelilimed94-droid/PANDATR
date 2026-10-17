import { prisma } from "@/lib/prisma";
import Shell from "@/components/Shell";
export const dynamic="force-dynamic";
export default async function CustomersPage(){
 const customers=await prisma.customer.findMany({orderBy:{createdAt:"desc"},take:200,include:{_count:{select:{orders:true}}}});
 return <Shell active="/customers"><div className="page-heading"><div><h1>العملاء</h1><div className="subtitle">العملاء المسجلون من خلال الطلبات (آخر 200 سجل)</div></div></div><div className="card"><div className="table-wrap"><table><thead><tr><th>الاسم</th><th>الهاتف</th><th>الولاية</th><th>المدينة</th><th>عدد الطلبات</th></tr></thead><tbody>{customers.map(c=><tr key={c.id}><td>{c.name}</td><td>{c.phone}</td><td>{c.province||"—"}</td><td>{c.city||"—"}</td><td>{c._count.orders}</td></tr>)}{!customers.length&&<tr><td colSpan={5} style={{textAlign:"center",padding:30}}>لا يوجد عملاء بعد.</td></tr>}</tbody></table></div></div></Shell>
}
