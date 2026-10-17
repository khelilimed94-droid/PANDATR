"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function ProductForm(){
  const [form,setForm]=useState({sku:"",name:"",category:"",defaultPrice:"",minimumStock:"0",description:""});
  const [error,setError]=useState(""); const [busy,setBusy]=useState(false); const router=useRouter();
  function change(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>){setForm({...form,[e.target.name]:e.target.value});}
  async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");try{const r=await fetch("/api/products",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,defaultPrice:Number(form.defaultPrice),minimumStock:Number(form.minimumStock)})});const data=await r.json();if(!r.ok)throw new Error(data.error||"تعذر حفظ المنتج");router.push("/products");router.refresh();}catch(err){setError(err instanceof Error?err.message:"حدث خطأ");}finally{setBusy(false);}}
  return <form onSubmit={submit}><div className="form-grid">
    <label className="field">رمز المنتج SKU<input className="input" name="sku" value={form.sku} onChange={change} required maxLength={50}/></label>
    <label className="field">اسم المنتج<input className="input" name="name" value={form.name} onChange={change} required maxLength={150}/></label>
    <label className="field">التصنيف<input className="input" name="category" value={form.category} onChange={change}/></label>
    <label className="field">سعر البيع (TRY)<input className="input" name="defaultPrice" type="number" min="0" step="0.01" value={form.defaultPrice} onChange={change} required/></label>
    <label className="field">حد تنبيه المخزون<input className="input" name="minimumStock" type="number" min="0" step="1" value={form.minimumStock} onChange={change} required/></label>
    <label className="field full">الوصف<textarea className="input" name="description" value={form.description} onChange={change} rows={3}/></label>
  </div>{error&&<div className="notice" style={{marginTop:14}}>{error}</div>}<div style={{display:"flex",gap:10,marginTop:20}}><button className="btn" disabled={busy}>{busy?"جارٍ الحفظ...":"حفظ المنتج"}</button><button type="button" className="btn secondary" onClick={()=>router.back()}>إلغاء</button></div></form>
}
