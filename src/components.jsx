import React from "react";
import {AlertCircle, CheckCircle2, LoaderCircle, Search, X, Plus, ArrowUpRight, ArrowDownRight, WalletCards} from "lucide-react";

export const money=v=>`₹${Number(v||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
export const dateFmt=v=>v?new Date(`${v}T00:00:00`).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—";
export const today=()=>new Date().toISOString().slice(0,10);
export const monthStart=()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),1).toISOString().slice(0,10)};
export const getUser=()=>{try{return JSON.parse(localStorage.getItem("expense_user")||"null")}catch{return null}};
export const initials=s=>(s||"U").trim().split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
export function WingedMoneyLogo({size=40,className=""}){
 return <img
   className={`winged-money-logo ${className}`}
   src="/spendwise-logo.png"
   width={size}
   height={size}
   alt="SpendWise"
   draggable="false"
 />
}

const EMOJI_ASSETS={
  "☀️":"sun.png",
  "🌤️":"partly-cloudy.png",
  "🌙":"moon.png",
  "🌄":"sunrise.png",
  "💸":"money-wings.png",
  "💰":"money-bag.png",
  "🎯":"target.png",
  "🔄":"repeat.png",
  "🏷️":"label.png",
  "📊":"chart.png",
  "👤":"person.png"
};

export function EmojiIcon({emoji,label,size=36,className=""}){
  const asset=EMOJI_ASSETS[emoji];
  if(!asset){
    return <span className={`native-emoji ${className}`} role="img" aria-label={label||emoji}>{emoji}</span>;
  }
  return <img className={`emoji-art ${className}`} src={`/emoji/${asset}`} width={size} height={size} alt={label||emoji} draggable="false" decoding="async"/>;
}

export function PageHeader({eyebrow,title,description,action}){return <div className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description&&<p>{description}</p>}</div>{action}</div>}
export function StatCard({icon,label,value,note,tone="teal"}){return <div className={`stat-card ${tone}`}><div className="stat-top"><span className="stat-icon">{icon}</span>{note&&<span className="stat-note">{note}</span>}</div><b>{value}</b><span>{label}</span></div>}
export function Loading({text="Loading your finances…"}){return <div className="loading"><LoaderCircle className="spin" size={25}/>{text}</div>}
export function ErrorBox({message}){return message?<div className="alert error"><AlertCircle size={18}/><span>{message}</span></div>:null}
export function SuccessBox({message}){return message?<div className="alert success"><CheckCircle2 size={18}/><span>{message}</span></div>:null}
export function Empty({text="No records found."}){return <div className="empty"><div className="empty-icon"><WalletCards size={22}/></div><b>{text}</b><small>Try another filter or add your first record.</small></div>}
export function SearchBox({value,onChange,placeholder="Search…"}){return <div className="search-box"><Search size={17}/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></div>}
export function Modal({title,children,onClose,width="620px"}){return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" style={{maxWidth:width}} onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">ACTION</span><h3>{title}</h3></div><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={19}/></button></div>{children}</div></div>}
export function Field({label,children,required=false}){return <label className="field"><span>{label}{required&&<em>*</em>}</span>{children}</label>}
export function Badge({children,tone="neutral"}){return <span className={`badge ${tone}`}>{children}</span>}
export function Table({columns,rows,empty="No records available."}){return <div className="table-card"><div className="table-scroll"><table><thead><tr>{columns.map(c=><th key={c.key}>{c.label}</th>)}</tr></thead><tbody>{rows?.length?rows.map((row,i)=><tr key={row.id??row.expenseId??row.incomeId??row.budgetId??row.goalId??row.recurringExpenseId??row.categoryId??i}>{columns.map(c=><td key={c.key}>{c.render?c.render(row):row[c.key]??"—"}</td>)}</tr>):<tr><td colSpan={columns.length}><Empty text={empty}/></td></tr>}</tbody></table></div></div>}
export function Trend({type="income"}){return type==="income"?<ArrowUpRight size={14}/>:<ArrowDownRight size={14}/>}
export function FormActions({onCancel,saveLabel="Save",saving=false}){return <div className="form-actions"><button type="button" className="soft-btn" onClick={onCancel}>Cancel</button><button className="primary-btn" disabled={saving}>{saving?"Saving…":saveLabel}<Plus size={15}/></button></div>}
