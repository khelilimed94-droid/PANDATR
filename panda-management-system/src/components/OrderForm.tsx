"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
type Product={id:string;name:string;sku:string;price:number;stock:number};
export default function OrderForm({products,sellers}:{products:Product[];sellers:{id:string;name:string}[]}){
 const [customer,setCustomer]=useState({name:"",phone:"",alternatePhone:"",province:"",city:"",address:""});
 const [sellerId,setSellerId]=useState(""); const [shippingCost,setShippingCost]=useState("0"); const [discount,setDiscount]=useState("0"); const [notes,setNotes]=useState("");
 const [items,setItems]=useState([{productId:"",quantity:"1",unitPrice:""}]); const [error,setError]=useState(""); const [busy,setBusy]=useState(false); const router=useRouter();
 const total=useMemo(()=>Math.max(0,items.reduce((sum,i)=>sum+(Number(i.quantity)||0)*(Number(i.unitPrice)||0),0)-(Number(discount)||0)),[items,discount]);
 function updateItem(index:number,key:string,value:string){setItems(old=>old.map((item,i)=>{if(i!==index)return item;const next={...item,[key]:value};if(key==="productId"){const p=products.find(p=>p.id===value);next.unitPrice=p?String(p.price):"";}return next;}));}
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");try{const r=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customer,sellerId:sellerId||null,shippingCost:Number(shippingCost),discount:Number(discount),notes,items:items.map(i=>({productId:i.productId,quantity:Number(i.quantity),unitPrice:Number(i.unitPrice)}))})});const data=await r.json();if(!r.ok)throw new Error(data.error||"تعذر إنشاء الطلب");router.push("/orders");router.refresh();}catch(e){setError(e instanceof Error?e.message:"حدث خطأ");}finally{setBusy(false);}}
 return <form onSubmit={submit}>
 <h3 className="section-title">بيانات العميل</h3><div className="form-grid">
 {([["name","اسم العميل"],["phone","رقم الهاتف"],["alternatePhone","هاتف بديل"],["province","الولاية"],["city","المدينة"],["address","العنوان"]] as const).map(([key,label])=><label className="field" key={key}>{label}<input className="input" value={customer[key]} onChange={e=>setCustomer({...customer,[key]:e.target.value})} required={key==="name"||key==="phone"}/></label>)}
 </div><hr style={{border:0,borderTop:"1px solid var(--line)",margin:"24px 0"}}/><h3 className="section-title">المنتجات</h3>
 {items.map((item,index)=><div key={index} className="form-grid" style={{marginBottom:12,alignItems:"end"}}>
 <label className="field">المنتج<select className="input" value={item.productId} onChange={e=>updateItem(index,"productId",e.target.value)} required><option value="">اختر منتجًا</option>{products.map(p=><option key={p.id} value={p.id}>{p.name} — المتاح: {p.stock}</option>)}</select></label>
 <label className="field">الكمية<input className="input" type="number" min="1" step="1" value={item.quantity} onChange={e=>updateItem(index,"quantity",e.target.value)} required/></label>
 <label className="field">سعر الوحدة (TRY)<input className="input" type="number" min="0" step="0.01" value={item.unitPrice} onChange={e=>updateItem(index,"unitPrice",e.target.value)} required/></label>
 <button type="button" className="btn secondary" onClick={()=>setItems(old=>old.length>1?old.filter((_,i)=>i!==index):old)} disabled={items.length===1}>حذف السطر</button>
 </div>)}
 <button type="button" className="btn secondary" onClick={()=>setItems(old=>[...old,{productId:"",quantity:"1",unitPrice:""}])}>＋ إضافة منتج آخر</button>
 <hr style={{border:0,borderTop:"1px solid var(--line)",margin:"24px 0"}}/><div className="form-grid">
 <label className="field">البائع<select className="input" value={sellerId} onChange={e=>setSellerId(e.target.value)}><option value="">بدون بائع</option>{sellers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
 <label className="field">تكلفة الشحن على الشركة (TRY)<input className="input" type="number" min="0" step="0.01" value={shippingCost} onChange={e=>setShippingCost(e.target.value)}/></label>
 <label className="field">الخصم (TRY)<input className="input" type="number" min="0" step="0.01" value={discount} onChange={e=>setDiscount(e.target.value)}/></label>
 <label className="field full">ملاحظات داخلية<textarea className="input" rows={2} value={notes} onChange={e=>setNotes(e.target.value)}/></label>
 </div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#f8f7ff",borderRadius:12,padding:16,marginTop:20}}><span>إجمالي الطلب (دون إضافة تكلفة الشحن إلى ما يدفعه العميل)</span><strong style={{fontSize:22}}>{new Intl.NumberFormat("ar-TR",{style:"currency",currency:"TRY"}).format(total)}</strong></div>
 {error&&<div className="notice" style={{marginTop:14}}>{error}</div>}<div style={{marginTop:20}}><button className="btn" disabled={busy||products.length===0}>{busy?"جارٍ الإنشاء...":"حفظ الطلب"}</button></div>
 </form>
}
