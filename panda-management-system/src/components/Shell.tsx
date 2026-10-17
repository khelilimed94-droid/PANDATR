import Link from "next/link";
import { LayoutDashboard, ShoppingCart, Package, Users, Boxes, Truck, Wallet, Settings, ClipboardList } from "lucide-react";

const nav = [
  ["/", "لوحة التحكم", LayoutDashboard],
  ["/orders", "الطلبات", ShoppingCart],
  ["/products", "المنتجات", Package],
  ["/inventory", "المخزون", Boxes],
  ["/customers", "العملاء", Users],
  ["/shipping", "شركات الشحن", Truck],
  ["/accounting", "المحاسبة", Wallet],
  ["/reports", "التقارير", ClipboardList],
  ["/settings", "الإعدادات", Settings]
] as const;

export default function Shell({ children, active = "/" }: { children: React.ReactNode; active?: string }) {
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">P</span><span>Panda <small style={{display:"block",fontSize:10,color:"#7c8494",fontWeight:500}}>Management System</small></span></div>
      <nav className="nav-list">{nav.map(([href,label,Icon]) =>
        <Link key={href} href={href} className={`nav-link ${active === href ? "active" : ""}`}><Icon size={18}/>{label}</Link>
      )}</nav>
      <div style={{marginTop:32,padding:"12px",fontSize:11,color:"#8a91a0"}}>الإصدار الأولي · TRY</div>
    </aside>
    <div className="main">
      <header className="topbar">
        <div><strong>مساحة العمل</strong><div className="subtitle">إدارة العمليات اليومية لمشروع باندا</div></div>
        <div style={{display:"flex",alignItems:"center",gap:10}}><span className="badge green">النظام المحلي</span><span className="brand-mark" style={{width:34,height:34,borderRadius:50}}>م</span></div>
      </header>
      <main className="content">{children}</main>
    </div>
  </div>;
}
