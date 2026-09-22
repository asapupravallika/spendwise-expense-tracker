import React,{useEffect,useMemo,useState} from "react";
import {BarChart3,Download,IndianRupee,CalendarDays,FileText,TrendingDown,TrendingUp} from "lucide-react";
import {reportApi} from "../api";
import {Badge,EmojiIcon,ErrorBox,Loading,PageHeader,StatCard,Table,dateFmt,getUser,money,monthStart,today} from "../components";
import {CartesianGrid,Line,LineChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from "recharts";

const monthLabel = value => {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? String(value).slice(0,7) : d.toLocaleDateString("en-IN",{month:"short",year:"2-digit"});
};

export default function Reports(){
  const user=getUser();
  const [from,setFrom]=useState(monthStart());
  const [to,setTo]=useState(today());
  const [data,setData]=useState(null);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [downloading,setDownloading]=useState(false);

  const load=async()=>{
    if(!from||!to){setError("Please select both dates.");return;}
    if(from>to){setError("From date cannot be after the To date.");return;}
    setLoading(true);
    setError("");
    try{
      const response=await reportApi.summary(user.userId,from,to);
      setData(response.data);
    }catch(e){
      console.error("Reports load failed",e);
      setError(e?.message||"Unable to build the report. Check that the backend is running.");
    }finally{setLoading(false);}
  };

  useEffect(()=>{load();},[]);

  const pdf=async()=>{
    setDownloading(true);
    setError("");
    try{
      const r=await reportApi.pdf(user.userId,from,to);
      const blob=r.data instanceof Blob ? r.data : new Blob([r.data],{type:"application/pdf"});
      if(blob.size===0) throw new Error("The server returned an empty PDF.");
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;
      a.download=`expense-report-${from}-to-${to}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch(e){
      console.error("PDF download failed",e);
      setError(e?.message||"Unable to download the PDF.");
    }finally{setDownloading(false);}
  };

  const monthly=useMemo(()=>
    (data?.monthlySummary||[]).map(x=>({
      ...x,
      month: monthLabel(x.month),
      income:Number(x.income||0),
      expense:Number(x.expense||0),
    }))
  ,[data]);

  if(loading&&!data)return <Loading text="Building report…"/>;

  return <div>
    <PageHeader
      eyebrow="FINANCIAL STORY"
      title={<span className="title-with-emoji">Reports & insights <EmojiIcon emoji="📊" label="bar chart" size={40} /></span>}
      description="Compare periods, understand category weight and export a clean PDF for your records."
      action={<div className="date-filter">
        <CalendarDays size={16}/>
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)}/>
        <span>to</span>
        <input type="date" value={to} onChange={e=>setTo(e.target.value)}/>
        <button className="primary-btn small" onClick={load} disabled={loading}>{loading?"Generating…":"Generate"}</button>
        <button className="soft-btn small" onClick={pdf} disabled={!data||downloading}>
          <Download size={15}/>{downloading?"Preparing…":"PDF"}
        </button>
      </div>}
    />

    <ErrorBox message={error}/>

    {data&&<>
      <div className="stat-grid">
        <StatCard icon={<TrendingUp/>} label="Income" value={money(data.totalIncome)} note="Selected period" tone="blue"/>
        <StatCard icon={<TrendingDown/>} label="Expenses" value={money(data.totalExpense)} note="Selected period" tone="orange"/>
        <StatCard icon={<IndianRupee/>} label="Net balance" value={money(data.netBalance)} note="Income − expenses" tone={Number(data.netBalance)>=0?"teal":"purple"}/>
        <StatCard icon={<FileText/>} label="Transactions" value={data.transactions?.length||0} note="In selected period" tone="purple"/>
      </div>

      <div className="dashboard-grid">
        <section className="panel large">
          <div className="panel-head">
            <div><span className="eyebrow">MONTHLY VIEW</span><h3>Cash flow</h3></div>
            <span className="legend"><i className="dot income"/>Income <i className="dot expense"/>Expense</span>
          </div>
          <div className="chart-wrap">
            {monthly.length ? <ResponsiveContainer width="100%" height={290}>
              <LineChart data={monthly} margin={{top:10,right:18,left:6,bottom:5}}>
                <CartesianGrid vertical={false} stroke="#d9e7e4"/>
                <XAxis dataKey="month" tick={{fontSize:10}}/>
                <YAxis tick={{fontSize:10}} tickFormatter={v=>`₹${Math.round(Number(v)/1000)}k`}/>
                <Tooltip formatter={(v,n)=>[money(v),n==="income"?"Income":"Expenses"]}/>
                <Line type="monotone" dataKey="income" stroke="#2563eb" strokeWidth={3} dot={{r:3}} activeDot={{r:5}}/>
                <Line type="monotone" dataKey="expense" stroke="#ea580c" strokeWidth={3} dot={{r:3}} activeDot={{r:5}}/>
              </LineChart>
            </ResponsiveContainer> : <div className="empty"><b>No monthly data</b><small>Add income or expenses in the selected period.</small></div>}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><div><span className="eyebrow">CATEGORY WEIGHT</span><h3>Where spending landed</h3></div></div>
          <div className="category-list report-list">
            {(data.expenseByCategory||[]).map(x=><div key={x.categoryName}><span>{x.categoryName}</span><b>{money(x.total)}</b></div>)}
            {!data.expenseByCategory?.length&&<div className="empty"><b>No expenses</b><small>No expense transactions in this period.</small></div>}
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-head"><div><span className="eyebrow">LEDGER</span><h3>Transactions in period</h3></div></div>
        <Table rows={data.transactions||[]} columns={[
          {key:"date",label:"Date",render:r=>dateFmt(r.date)},
          {key:"description",label:"Description",render:r=><div><b>{r.description}</b><small className="table-sub">{r.categoryName}</small></div>},
          {key:"type",label:"Type",render:r=><Badge tone={r.type==="INCOME"?"green":"orange"}>{r.type}</Badge>},
          {key:"paymentMethod",label:"Payment"},
          {key:"amount",label:"Amount",render:r=><b className={r.type==="INCOME"?"amount-income":"amount-expense"}>{r.type==="INCOME"?"+":"−"}{money(r.amount)}</b>}
        ]}/>
      </section>
    </>}
  </div>
}