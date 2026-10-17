import { prisma } from "@/lib/prisma";
import Shell from "@/components/Shell";
import OrderForm from "@/components/OrderForm";
export const dynamic="force-dynamic";
export default async function NewOrderPage(){
 const [products,users]=await Promise.all([prisma.product.findMany({where:{active:true},orderBy:{name:"asc"},include:{batches:true}}),prisma.user.findMany({where:{active:true},select:{id:true,name:true},orderBy:{name:"asc"}})]);
 const choices=products.map(p=>({id:p.id,name:p.name,sku:p.sku,price:Number(p.defaultPrice),stock:p.batches.reduce((s,b)=>s+b.quantityLeft,0)}));
 return <Shell active="/orders"><div className="page-heading"><div><h1>إنشاء طلب</h1><div className="subtitle">تسجيل بيانات العميل والمنتجات</div></div></div><div className="card"><OrderForm products={choices} sellers={users}/></div></Shell>
}
