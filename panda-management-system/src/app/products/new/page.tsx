import Shell from "@/components/Shell";
import ProductForm from "@/components/ProductForm";
export default function NewProductPage(){return <Shell active="/products"><div className="page-heading"><div><h1>إضافة منتج</h1><div className="subtitle">أدخل بيانات المنتج الأساسية</div></div></div><div className="card"><ProductForm/></div></Shell>}
