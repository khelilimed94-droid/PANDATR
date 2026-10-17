import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAllowedTransition } from "@/lib/business";

const schema=z.object({status:z.enum(["NEW","CONFIRMING","CONFIRMED","PREPARING","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","REFUSED","DELIVERY_FAILED","RETURNED","CANCELLED"]),note:z.string().trim().max(500).optional().default("")});
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;const parsed=schema.safeParse(await req.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:"الحالة أو البيانات غير صحيحة"},{status:400});
 try{
  const result=await prisma.$transaction(async tx=>{
   const order=await tx.order.findUnique({where:{id},include:{seller:true}});
   if(!order)throw new Error("الطلب غير موجود");
   if(!isAllowedTransition(order.status,parsed.data.status))throw new Error(`الانتقال من ${order.status} إلى ${parsed.data.status} غير مسموح`);
   if(order.status===parsed.data.status)return order;
   const updated=await tx.order.update({where:{id},data:{status:parsed.data.status,...(parsed.data.status==="DELIVERED"?{deliveredAt:new Date()}: {})}});
   await tx.orderStatusHistory.create({data:{orderId:id,fromStatus:order.status,toStatus:parsed.data.status,note:parsed.data.note||null}});
   if(parsed.data.status==="DELIVERED"&&order.sellerId){
    const setting=await tx.sellerCommissionSetting.findUnique({where:{sellerId:order.sellerId}});
    if(setting)await tx.commission.upsert({where:{orderId:id},create:{orderId:id,sellerId:order.sellerId,amount:setting.amountPerOrder},update:{}});
   }
   await tx.auditLog.create({data:{action:"ORDER_STATUS_CHANGED",entityType:"Order",entityId:id,beforeData:{status:order.status},afterData:{status:parsed.data.status,note:parsed.data.note}}});
   return updated;
  },{isolationLevel:"Serializable"});
  return NextResponse.json({id:result.id,status:result.status});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"تعذر تحديث الحالة"},{status:400});}
}
