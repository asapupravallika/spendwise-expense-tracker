import React,{useEffect,useState} from "react";
import {ArrowDownLeft,ArrowUpRight,CalendarDays,Plus,Target,WalletCards,TrendingUp,ReceiptIndianRupee,Landmark,ChartNoAxesCombined,RefreshCw,ArrowRight} from "lucide-react";
import {Bar,BarChart,CartesianGrid,Line,LineChart,ResponsiveContainer,Tooltip,XAxis,YAxis,PieChart,Pie,Cell} from "recharts";
import {dashboardApi} from "../api";
import {Badge,EmojiIcon,ErrorBox,Loading,PageHeader,StatCard,Table,dateFmt,getUser,initials,money,today} from "../components";
const getGreetingInfo = () => {
  const h = new Date().getHours();
  if (h < 6)
    return { text: "Good night", emoji: "🌙", label: "moon" };
  if (h < 12)
    return { text: "Good morning", emoji: "☀️", label: "sun" };
  if (h < 18)
    return { text: "Good afternoon", emoji: "🌤️", label: "partly cloudy" };
  if (h < 21)
    return { text: "Good evening", emoji: "🌇", label: "sunset" };
  return { text: "Good night", emoji: "🌙", label: "moon" };
};
const COLORS=["#0f766e","#2563eb","#7c3aed","#ea580c","#0891b2","#db2777","#65a30d"];
export default function Dashboard(){
 const user=getUser(); const greeting=getGreetingInfo(); const [d,setD]=useState(null),[error,setError]=useState(""),[loading,setLoading]=useState(true),[refreshing,setRefreshing]=useState(false);
 const load=async()=>{setLoading(true);try{setD((await dashboardApi.get(user.userId)).data);setError("")}catch(e){setError(e.message)}finally{setLoading(false)}}; const refresh=async()=>{setRefreshing(true);try{setD((await dashboardApi.get(user.userId)).data);setError("")}catch(e){setError(e.message)}finally{setRefreshing(false)}};useEffect(()=>{load()},[]);
 if(loading)return <Loading/>; if(!d)return <ErrorBox message={error}/>;
 const monthly=(d.monthlySummary||[]).map(x=>({...x,month:x.month?.slice(5)||x.month}));
 return <div>
  <PageHeader eyebrow="FINANCIAL PULSE" title={<span className="greeting-title">{greeting.text}, {user.name.split(" ")[0]} <EmojiIcon emoji={greeting.emoji} label={greeting.label} size={42} className="greeting-emoji" /></span>} description="A live view of your income, spending and the decisions that matter next." action={<div className="button-row"><button className="primary-btn" onClick={()=>location.href="/transactions?new=expense"}><Plus size={17}/> Add transaction</button><button className="soft-btn" onClick={refresh} disabled={refreshing}>{refreshing?"Refreshing…":<><RefreshCw size={15}/> Refresh</>}</button></div>}/>
  <ErrorBox message={error}/>
  <div className="stat-grid">
   <StatCard icon={<WalletCards/>} label="Net balance" value={money(d.balance)} note="All-time" tone={Number(d.balance)>=0?"teal":"orange"}/>
   <StatCard icon={<ArrowUpRight/>} label="Total income" value={money(d.totalIncome)} note="All-time" tone="blue"/>
   <StatCard icon={<ArrowDownLeft/>} label="Total expense" value={money(d.totalExpense)} note="All-time" tone="orange"/>
   <StatCard icon={<ReceiptIndianRupee/>} label="This month" value={money(d.currentMonthExpense)} note="Expense" tone="purple"/>
  </div>
  <div className="dashboard-hero-mini"><div className="hero-mini-copy"><span className="eyebrow">YOUR MONEY, YOUR MOMENT <ChartNoAxesCombined size={14}/></span><b>Small habits add up to big financial wins.</b><span>Use your numbers to make the next decision easier.</span></div><div className="hero-mini-art" aria-hidden="true"><img className="hero-mini-picture" src="/spendwise-finance.svg" alt=""/><div className="hero-mini-emojis" aria-hidden="true"><Landmark size={24}/><TrendingUp size={24}/><Target size={24}/></div></div></div><div className="insight-strip"><div><span className="eyebrow">SPENDING SIGNAL</span><b>{d.highestExpenseCategory==="N/A"?"No spending pattern yet":`${d.highestExpenseCategory} is your highest-spend category`}</b><small>Average daily expense over the last 12 months: <strong>{money(d.averageDailyExpense)}</strong></small></div><div className="signal"><TrendingUp size={18}/><span>Keep your balance intentional.</span></div></div>
  <div className="dashboard-grid">
   <section className="panel large"><div className="panel-head"><div><span className="eyebrow">12-MONTH FLOW</span><h3>Income vs expenses</h3></div><span className="legend"><i className="dot income"/>Income <i className="dot expense"/>Expense</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height={300}><BarChart data={monthly} barGap={8}><CartesianGrid vertical={false} stroke="#e8efed"/><XAxis dataKey="month" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}} tickFormatter={v=>`₹${Math.round(v/1000)}k`}/><Tooltip formatter={v=>money(v)}/><Bar dataKey="income" fill="#2563eb" radius={[6,6,0,0]}/><Bar dataKey="expense" fill="#ea580c" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></section>
   <section className="panel"><div className="panel-head"><div><span className="eyebrow">WHERE IT GOES</span><h3>Expense by category</h3></div></div>{d.expenseByCategory?.length?<><div className="pie-wrap"><ResponsiveContainer width="100%" height={190}><PieChart><Pie data={d.expenseByCategory} dataKey="total" nameKey="categoryName" innerRadius={52} outerRadius={76} paddingAngle={3}>{d.expenseByCategory.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip formatter={v=>money(v)}/></PieChart></ResponsiveContainer></div><div className="category-list">{d.expenseByCategory.slice(0,5).map((x,i)=><div key={x.categoryName}><span><i className="dot" style={{background:COLORS[i%COLORS.length]}}/>{x.categoryName}</span><b>{money(x.total)}</b></div>)}</div></>:<div className="empty"><b>No expenses yet</b><small>Add an expense to see your spending mix.</small></div>}</section>
  </div>
  <section className="panel"><div className="panel-head"><div><span className="eyebrow">RECENT ACTIVITY</span><h3>Latest transactions</h3></div><button className="link-btn" onClick={()=>location.href="/transactions"}><ArrowRight size={15}/> View all</button></div>
   <Table rows={(d.recentTransactions||[]).slice(0,5)} columns={[
    {key:"date",label:"Date",render:r=>dateFmt(r.date)},{key:"description",label:"Description",render:r=><div><b>{r.description}</b><small className="table-sub">{r.categoryName}</small></div>},
    {key:"paymentMethod",label:"Payment",render:r=><Badge tone="neutral">{r.paymentMethod}</Badge>},
    {key:"type",label:"Type",render:r=><Badge tone={r.type==="INCOME"?"green":"orange"}>{r.type}</Badge>},
    {key:"amount",label:"Amount",render:r=><b className={r.type==="INCOME"?"amount-income":"amount-expense"}>{r.type==="INCOME"?"+":"−"}{money(r.amount)}</b>}
   ]}/>
  </section>
 </div>
}