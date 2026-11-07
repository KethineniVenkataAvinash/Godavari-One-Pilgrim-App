import React, { useEffect, useState } from 'react';
import { Search, CheckCheck, Wallet, Compass, ArrowUpRight, Download, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { AppInterface } from '../types';

type Item = { id: string; text: string; done: boolean };
type Expense = { id: string; label: string; amount: number; category: string };
type Saved = { items: Item[]; expenses: Expense[]; budget: number; favorites: string[] };
const key = 'godavari-journey-tools-v1';
const defaults: Saved = { items: ['Carry drinking water', 'Charge phone and power bank', 'Save meeting point with family', 'Pack identification and travel tickets'].map((text, i) => ({ id: `starter-${i}`, text, done: false })), expenses: [], budget: 5000, favorites: [] };
const destinations: { id: AppInterface; name: string; description: string; keywords: string }[] = [
  { id: 'pilgrim', name: 'Pilgrim companion', description: 'Pass, family circle and journey planning', keywords: 'family token queue map planner' },
  { id: 'mobility', name: 'Transport & parking', description: 'Explore the mobility dashboard', keywords: 'bus shuttle car parking travel' },
  { id: 'seva', name: 'Seva & volunteering', description: 'Explore service opportunities', keywords: 'volunteer food service register' },
  { id: 'respond-directory', name: 'Help directory', description: 'Find assistance and contact information', keywords: 'help medical police emergency contact' },
  { id: 'public-kiosk', name: 'Public kiosk', description: 'Open the dedicated kiosk interface', keywords: 'kiosk public information' },
  { id: 'public-portal', name: 'Main portal', description: 'Return to the full public portal', keywords: 'home dashboard status' },
];
const currency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);
function read(): Saved {
  const raw = localStorage.getItem(key); if (!raw) return defaults;
  const data = JSON.parse(raw);
  if (!Array.isArray(data.items) || !data.items.every((i: Item) => typeof i.id === 'string' && typeof i.text === 'string' && typeof i.done === 'boolean') || !Array.isArray(data.expenses) || !data.expenses.every((e: Expense) => typeof e.id === 'string' && typeof e.label === 'string' && typeof e.category === 'string' && Number.isFinite(e.amount) && e.amount > 0) || !Number.isFinite(data.budget) || data.budget < 0 || !Array.isArray(data.favorites)) throw new Error('Saved journey data could not be read. Existing data has been preserved.');
  return data;
}
export function JourneyTools() {
  const { setCurrentInterface, currentInterface } = useApp();
  const [saved, setSaved] = useState<Saved>(defaults);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('discover');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    function reload() { try { setSaved(read()); setReady(true); setError(''); } catch (e) { setError(String(e)); setReady(false); } }
    reload(); window.addEventListener('storage', reload); return () => window.removeEventListener('storage', reload);
  }, []);
  function save(next: Saved) {
    try { localStorage.setItem(key, JSON.stringify(next)); setSaved(next); setError(''); setNotice('Saved on this browser.'); }
    catch { setError('Unable to save. Browser storage may be full or disabled.'); }
  }
  function exportData() {
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...saved }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'godavari-my-journey.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const total = saved.expenses.reduce((sum, e) => sum + e.amount, 0);
  const completed = saved.items.filter(i => i.done).length;
  const field = 'w-full rounded-xl border border-emerald-800 bg-[#061e19] p-3 text-sm text-white placeholder:text-emerald-200/50';
  return <section aria-label="Personal journey tools" className="my-5 rounded-3xl border border-emerald-800 bg-[#0a2b24] p-4 sm:p-6 text-white shadow-lg">
    <div className="flex flex-wrap justify-between items-start gap-3"><div><p className="text-[10px] font-bold tracking-[0.2em] text-amber-300 uppercase">Plan • Prepare • Explore</p><h2 className="text-xl font-extrabold mt-1">Your journey companion</h2><p className="text-xs text-emerald-200 mt-1">Personal tools shared between this app and portal on the same browser.</p></div><button onClick={exportData} disabled={!ready} className="flex items-center gap-2 border border-emerald-700 rounded-xl px-3 py-2 text-xs hover:bg-emerald-900 disabled:opacity-40"><Download size={14}/>Export my data</button></div>
    <div className="grid grid-cols-3 gap-2 my-4" role="tablist" aria-label="Journey tools">{[{ id: 'discover', name: 'Discover', icon: Compass }, { id: 'checklist', name: 'Checklist', icon: CheckCheck }, { id: 'budget', name: 'Budget', icon: Wallet }].map(({id,name,icon:Icon})=><button key={id} role="tab" id={`journey-tab-${id}`} aria-controls="journey-panel" aria-selected={tab===id} onClick={()=>{setTab(id);setNotice('');}} className={`flex justify-center items-center gap-1.5 rounded-xl py-3 text-xs font-bold ${tab===id ? 'bg-amber-400 text-black' : 'bg-emerald-950 text-emerald-100 hover:bg-emerald-900'}`}><Icon size={15}/>{name}</button>)}</div>
    {error && <p role="alert" className="text-red-200 bg-red-950 rounded-lg p-3 text-sm">{error}</p>}
    <div id="journey-panel" role="tabpanel" aria-labelledby={`journey-tab-${tab}`}>
    {tab==='discover' && <><label className="relative block"><Search size={16} className="absolute left-3 top-3.5 text-emerald-300"/><input aria-label="Search features" placeholder="Search transport, family, help…" value={query} onChange={e=>setQuery(e.target.value)} className={`${field} pl-10`}/></label><div className="grid sm:grid-cols-2 gap-2 mt-3">{destinations.filter(d=>(d.name+d.description+d.keywords).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>Number(saved.favorites.includes(b.id))-Number(saved.favorites.includes(a.id))).map(d=><div key={d.id} className="rounded-xl bg-emerald-950/70 border border-emerald-800 p-3 flex gap-2 items-start"><button onClick={()=>setCurrentInterface(d.id)} className="flex-1 text-left"><span className="text-sm font-bold flex items-center gap-2">{d.name}<ArrowUpRight size={14}/></span><span className="text-xs text-emerald-200 block mt-1">{d.description}</span>{currentInterface===d.id && <span className="text-[10px] text-amber-300">You are here</span>}</button><button disabled={!ready} aria-label={`${saved.favorites.includes(d.id)?'Unpin':'Pin'} ${d.name}`} aria-pressed={saved.favorites.includes(d.id)} onClick={()=>save({...saved,favorites:saved.favorites.includes(d.id)?saved.favorites.filter(f=>f!==d.id):[...saved.favorites,d.id]})} className="text-xl text-amber-300 px-1"><Star size={20} fill={saved.favorites.includes(d.id) ? 'currentColor' : 'none'} /></button></div>)}</div>{!destinations.some(d=>(d.name+d.description+d.keywords).toLowerCase().includes(query.toLowerCase())) && <p className="py-5 text-sm text-emerald-200">No features match. Try “help” or “transport”.</p>}</>}
    {tab==='checklist' && <><div className="flex justify-between text-sm mb-2"><span>Ready for your visit</span><span>{completed}/{saved.items.length} complete</span></div><progress aria-label="Checklist completion" value={completed} max={saved.items.length || 1} className="w-full h-2 accent-amber-400"/><form className="flex gap-2 my-3" onSubmit={e=>{e.preventDefault();const form=e.currentTarget;const text=String(new FormData(form).get('item')||'').trim();if(!text)return;save({...saved,items:[...saved.items,{id:crypto.randomUUID(),text,done:false}]});form.reset();}}><input name="item" aria-label="New checklist item" required maxLength={160} placeholder="Add something to prepare…" className={field}/><button disabled={!ready} className="bg-amber-400 text-black px-4 rounded-xl font-bold text-sm">Add</button></form><div className="space-y-2 max-h-80 overflow-auto">{saved.items.map(item=><label key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-950 text-sm"><input disabled={!ready} type="checkbox" checked={item.done} onChange={()=>save({...saved,items:saved.items.map(i=>i.id===item.id?{...i,done:!i.done}:i)})} className="w-5 h-5 accent-amber-400"/><span className={item.done?'line-through text-emerald-400':''}>{item.text}</span></label>)}</div></>}
    {tab==='budget' && <><div className="grid grid-cols-2 gap-3 mb-4"><div className="rounded-xl bg-emerald-950 p-3"><p className="text-xs text-emerald-300">Recorded expenses</p><p className="text-xl font-bold mt-1">{currency(total)}</p></div><div className="rounded-xl bg-emerald-950 p-3"><p className="text-xs text-emerald-300">{total>saved.budget?'Over budget':'Remaining'}</p><p className={`text-xl font-bold mt-1 ${total>saved.budget?'text-red-300':'text-amber-300'}`}>{currency(Math.abs(saved.budget-total))}</p></div></div><label className="text-xs block mb-3">Trip budget (₹)<input type="number" min="0" max="10000000" step="0.01" disabled={!ready} value={saved.budget} onChange={e=>{const value=Number(e.target.value);if(Number.isFinite(value)&&value>=0&&value<=10000000)save({...saved,budget:value});}} className={`${field} mt-1`}/></label><form className="grid grid-cols-2 gap-2" onSubmit={e=>{e.preventDefault();const form=e.currentTarget;const data=new FormData(form);const amount=Number(data.get('amount'));const label=String(data.get('label')||'').trim();if(!label||!Number.isFinite(amount)||amount<=0||amount>10000000)return;save({...saved,expenses:[...saved.expenses,{id:crypto.randomUUID(),label,amount,category:String(data.get('category'))}]});form.reset();}}><input className={`${field} col-span-2`} name="label" aria-label="Expense description" placeholder="Expense description" maxLength={100} required/><input className={field} name="amount" aria-label="Amount in rupees" type="number" min="0.01" max="10000000" step="0.01" placeholder="Amount ₹" required/><select className={field} name="category" aria-label="Expense category">{['Travel','Stay','Food','Supplies','Other'].map(c=><option key={c}>{c}</option>)}</select><button disabled={!ready} className="col-span-2 bg-amber-400 text-black rounded-xl p-3 font-bold text-sm">Record expense</button></form><p className="text-xs text-emerald-300 mt-3">Personal records only; no payment is made.</p><ul className="max-h-64 overflow-auto mt-3 space-y-2">{[...saved.expenses].reverse().map(e=><li key={e.id} className="flex justify-between gap-3 bg-emerald-950 rounded-xl p-3 text-sm"><div>{e.label}<span className="block text-xs text-emerald-300">{e.category}</span></div><span>{currency(e.amount)}</span></li>)}</ul>{!saved.expenses.length && <p className="text-sm text-emerald-200 py-3">No expenses yet.</p>}</>}
    </div><p role="status" className="mt-3 text-[11px] text-emerald-300">{notice || 'Saved locally • Export a copy before clearing browser data.'}</p>
  </section>;
}

