"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
const statuses=[["NEW","جديد"],["CONFIRMING","قيد التأكيد"],["CONFIRMED","مؤكد"],["PREPARING","قيد التجهيز"],["SHIPPED","تم الشحن"],["OUT_FOR_DELIVERY","قيد التوصيل"],["DELIVERED","تم التسليم"],["REFUSED","رفض الاستلام"],["DELIVERY_FAILED","فشل التسليم"],["RETURNED","مرتجع"],["CANCELLED","ملغى"]];
export default function OrderStatusForm({orderId,status}:{orderId:string;status:string}){
 const [next,setNext]=useState(status);const [note,setNote]=useState("");const [error,setError]=useState("");const [busy,setBusy]=useState(false);const router=useRouter();
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");try{const r=await fetch(`/api/orders/${orderId}/status`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:next,note})});const d=await r.json();if(!r.ok)throw new Error(d.error||"تعذر تحديث الحالة");router.refresh();}catch(e){setError(e instanceof Error?e.message:"حدث خطأ");}finally{setBusy(false);}}
 return <form onSubmit={submit}><label className="field">الحالة الجديدة<select className="input" value={next} onChange={e=>setNext(e.target.value)}>{statuses.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label className="field" style={{marginTop:12}}>ملاحظة التغيير<input className="input" value={note} onChange={e=>setNote(e.target.value)} placeholder="سبب التغيير (اختياري)"/></label>{error&&<div className="notice" style={{marginTop:10}}>{error}</div>}<button className="btn" style={{marginTop:14}} disabled={busy||next===status}>{busy?"جارٍ الحفظ...":"تحديث الحالة"}</button></form>
}
