import React,{useEffect,useState} from "react";
import {Routes,Route,Navigate,useLocation,useNavigate} from "react-router-dom";
import {Activity,BarChart3,BookOpen,ChevronRight,CircleDollarSign,Goal,LayoutDashboard,LogOut,Repeat2,Tags,UserRound,WalletCards,Sun,Moon,ShieldCheck} from "lucide-react";
import {unwrap} from "./api";
import {initials,WingedMoneyLogo} from "./components";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import Recurring from "./pages/Recurring";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";

export const getUser=()=>{try{return JSON.parse(localStorage.getItem("expense_user")||"null")}catch{return null}};
export const setUser=u=>localStorage.setItem("expense_user",JSON.stringify(u));
export const clearUser=()=>localStorage.removeItem("expense_user");

const nav=[
 ["Overview","/",LayoutDashboard],
 ["Transactions","/transactions",CircleDollarSign],
 ["Budgets","/budgets",WalletCards],
 ["Savings goals","/goals",Goal],
 ["Recurring","/recurring",Repeat2],
 ["Categories","/categories",Tags],
 ["Reports","/reports",BarChart3],
 ["Profile","/profile",UserRound]
];

function Shell({children}){
 const navg=useNavigate(),loc=useLocation(); const [user,setU]=useState(getUser()); const [dark,setDark]=useState(()=>localStorage.getItem("spendwise_theme")==="dark");
 useEffect(()=>{document.documentElement.dataset.theme=dark?"dark":"light";localStorage.setItem("spendwise_theme",dark?"dark":"light")},[dark]);
 useEffect(()=>{const sync=()=>setU(getUser());window.addEventListener("expense-user-changed",sync);return()=>window.removeEventListener("expense-user-changed",sync)},[]);
 if(!user)return <Navigate to="/welcome" replace/>;
 const visibleNav=user.role==="ADMIN"?[...nav.slice(0,1),["Admin dashboard","/admin",ShieldCheck],...nav.slice(1)]:nav; const title=visibleNav.find(x=>x[1]===loc.pathname)?.[0]||"Overview";
 const logout=()=>{clearUser();navg("/welcome",{replace:true})};
 return <div className={`app-shell ${user.role === "ADMIN" ? "role-admin" : "role-user"}`}>
   <aside className="sidebar">
    <button className="brand brand-link" type="button" onClick={()=>navg("/")} aria-label="Go to SpendWise home"><div className="brand-mark winged-logo-mark"><WingedMoneyLogo size={42}/></div><div><strong>SpendWise</strong><span>Personal finance</span></div></button>
    <div className="user-card"><div className="avatar">{initials(user.name)}</div><div className="user-card-copy"><b>{user.name}</b><span>{user.email}</span><em className={`role-chip ${user.role === "ADMIN" ? "admin" : "user"}`}>{user.role === "ADMIN" ? "ADMIN" : "USER"}</em></div></div>
    <nav className="side-nav">{visibleNav.map(([label,path,Icon])=><button key={path} className={`nav-item ${loc.pathname===path?"active":""}`} onClick={()=>navg(path)}><Icon size={18}/><span>{label}</span>{loc.pathname===path&&<ChevronRight className="nav-arrow" size={16}/>}</button>)}</nav>
    <div className="sidebar-bottom"><div className="tip"><BookOpen size={16}/><div><b>{user.role === "ADMIN" ? "Command with confidence." : "Money, made clear."}</b><small>{user.role === "ADMIN" ? "Keep your SpendWise workspace safe and organized." : "Track every rupee. Plan the next one."}</small></div></div><button className="logout-btn" onClick={logout}><LogOut size={17}/> Sign out</button></div>
   </aside>
   <div className="main-area">
    <header className="topbar"><div className="topbar-left"><div><div className="breadcrumb">SpendWise <span>/</span> {title}</div><h2>{title}</h2></div></div><div className="top-user"><button className="theme-toggle" onClick={()=>setDark(v=>!v)} title={dark?"Switch to light mode":"Switch to dark mode"} aria-label="Toggle theme">{dark?<Sun size={16}/>:<Moon size={16}/>}</button><div className="avatar small">{initials(user.name)}</div><span>{user.name}</span></div></header>
    <main className="content"><div className="page-shell-enter">{children}</div></main>
   </div>
 </div>
}

function OAuthRedirect(){
 const nav=useNavigate();
 useEffect(()=>{(async()=>{try{
   const params=new URLSearchParams(window.location.search);const token=params.get("token");
   if(!token)throw new Error("OAuth login did not return a token.");
   localStorage.setItem("spendwise_token",token);
   const {authApiClient}=await import("./api");
   const result=unwrap(await authApiClient.me());
   const a=result.user||{};
   if(!a.profileId)throw new Error("Your financial profile was not created. Check the backend logs.");
   setUser({userId:a.profileId,authUserId:result.authUserId||a.authUserId,name:a.name,email:a.email,phone:a.phone||"",role:a.role||"USER",provider:a.provider||"GOOGLE"});
   window.dispatchEvent(new Event("expense-user-changed"));nav("/",{replace:true});
 }catch(e){localStorage.removeItem("spendwise_token");nav("/login?error="+encodeURIComponent(e.message),{replace:true})}})()},[nav]);
 return <div className="oauth-loading"><div className="brand-mark winged-logo-mark"><WingedMoneyLogo size={30}/></div><h2>Finishing your secure sign-in…</h2><p>Connecting your account to SpendWise.</p></div>;
}

export default function App(){
 const [user,setU]=useState(getUser());
 useEffect(()=>{const sync=()=>setU(getUser());window.addEventListener("expense-user-changed",sync);return()=>window.removeEventListener("expense-user-changed",sync)},[]);
 return <Routes>
  <Route path="/welcome" element={user?<Navigate to="/" replace/>:<Welcome/>}/>
  <Route path="/login" element={user?<Navigate to="/" replace/>:<Auth mode="login"/>}/>
  <Route path="/register" element={user?<Navigate to="/" replace/>:<Auth mode="register"/>}/>
  <Route path="/oauth2/redirect" element={<OAuthRedirect/>}/>
  <Route path="/" element={<Shell><Dashboard/></Shell>}/>
  <Route path="/admin" element={user?.role==="ADMIN"?<Shell><AdminDashboard/></Shell>:<Navigate to="/" replace/>}/>
  <Route path="/transactions" element={<Shell><Transactions/></Shell>}/>
  <Route path="/budgets" element={<Shell><Budgets/></Shell>}/>
  <Route path="/goals" element={<Shell><Goals/></Shell>}/>
  <Route path="/recurring" element={<Shell><Recurring/></Shell>}/>
  <Route path="/categories" element={<Shell><Categories/></Shell>}/>
  <Route path="/reports" element={<Shell><Reports/></Shell>}/>
  <Route path="/profile" element={<Shell><Profile/></Shell>}/>
  <Route path="*" element={<Navigate to={user?"/":"/welcome"} replace/>}/>
 </Routes>
}
