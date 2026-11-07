import React, {useEffect,useState} from 'react';
import {CloudSun,RefreshCw,MapPin} from 'lucide-react';
type Row={time:number;temp:number|null;feels:number|null;humidity:number|null;wind:number|null;rain:number|null;uv:number|null;code:number|null};
type Forecast={current:Row;hours:Row[];fetched:number;lat:number;lng:number};
const num=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?v:null;
const show=(v:number|null,u='')=>v===null?'Unavailable':`${Math.round(v*10)/10}${u}`;
export function weatherCondition(code:number|null,language:string){const i=code===null?5:code===0?0:code<=3?1:code<=48?2:code>=95?4:3;return(language==='te'?['నిర్మలంగా','మేఘావృతం','పొగమంచు','వర్షం / మంచు','ఉరుములతో వర్షం','తెలియదు']:language==='hi'?['साफ','बादल','कोहरा','वर्षा / बर्फ','आंधी','अज्ञात']:['Clear sky','Cloudy','Fog','Rain / snow','Thunderstorms','Unknown'])[i];}
export function parseWeather(raw:any,lat:number,lng:number):Forecast{
 const c=raw.current,h=raw.hourly;
 if(!c||typeof c.time!=='number'||num(c.temperature_2m)===null||!Array.isArray(h?.time))throw new Error('Incomplete weather response');
 const hours:Row[]=h.time.map((time:number,i:number)=>({time:time*1000,temp:num(h.temperature_2m?.[i]),feels:num(h.apparent_temperature?.[i]),humidity:num(h.relative_humidity_2m?.[i]),wind:num(h.wind_speed_10m?.[i]),rain:num(h.precipitation_probability?.[i]),uv:num(h.uv_index?.[i]),code:num(h.weather_code?.[i])}));
 const currentHour=hours.find(r=>r.time<=c.time*1000&&r.time+3600000>c.time*1000);
 return{lat,lng,fetched:Date.now(),current:{time:c.time*1000,temp:num(c.temperature_2m),feels:num(c.apparent_temperature),humidity:num(c.relative_humidity_2m),wind:num(c.wind_speed_10m),code:num(c.weather_code),uv:currentHour?.uv??null,rain:currentHour?.rain??null},hours:hours.filter(r=>r.time>c.time*1000).slice(0,8)};
}
export const PilgrimWeatherForecastWidget:React.FC<{language:'en'|'te'|'hi';currentPilgrimLoc?:{lat:number;lng:number}}>=({language,currentPilgrimLoc})=>{
 const [location,setLocation]=useState<{lat:number;lng:number}|null>(null),[locationNotice,setLocationNotice]=useState('');
 const lat=location?.lat??currentPilgrimLoc?.lat??17.0005,lng=location?.lng??currentPilgrimLoc?.lng??81.776;
 const [data,setData]=useState<Forecast|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(false),[refresh,setRefresh]=useState(0),[selected,setSelected]=useState<number|null>(null),[now,setNow]=useState(Date.now());
 const t=(en:string,te:string,hi:string)=>language==='te'?te:language==='hi'?hi:en;
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(timer);},[]);
 useEffect(()=>{
  let disposed=false;let controller:AbortController;const key=`g1-weather-${lat}-${lng}`;setData(null);setSelected(null);
  try{const cache=JSON.parse(localStorage.getItem(key)||'null');if(cache?.current&&Array.isArray(cache.hours)&&cache.lat===lat&&cache.lng===lng&&typeof cache.fetched==='number')setData(cache);}catch{}
  async function update(){controller?.abort();controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);setLoading(true);setError('');
   try{const params=new URLSearchParams({latitude:String(lat),longitude:String(lng),current:'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',hourly:'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation_probability,uv_index,weather_code',timezone:'Asia/Kolkata',timeformat:'unixtime',forecast_days:'2'});
    const response=await fetch(`https://api.open-meteo.com/v1/forecast?${params}`,{signal:controller.signal});if(!response.ok)throw new Error('Provider unavailable');const next=parseWeather(await response.json(),lat,lng);
    if(!disposed){setData(next);setSelected(null);try{localStorage.setItem(key,JSON.stringify(next));}catch{}}
   }catch{if(!disposed)setError('Weather update failed. Check your connection. Any readings below are the last saved forecast.');}
   finally{clearTimeout(timer);if(!disposed)setLoading(false);}
  }
  update();const timer=setInterval(update,600000);return()=>{disposed=true;controller?.abort();clearInterval(timer);};
 },[lat,lng,refresh]);
 const time=(n:number)=>new Intl.DateTimeFormat(language==='te'?'te-IN':language==='hi'?'hi-IN':'en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit',timeZone:'Asia/Kolkata'}).format(n);
 const stale=data&&(!!error||now-data.fetched>900000||now-data.current.time>5400000);
 const row=selected===null?data?.current:data?.hours.find(r=>r.time===selected);
 return <section className="rounded-3xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm space-y-4 min-w-0">
  <header className="flex justify-between items-start gap-3"><div><h3 className="font-bold text-sm flex gap-2"><CloudSun size={20} className="text-amber-600 shrink-0"/>{t('Weather & hourly forecast','వాతావరణం & గంటల అంచనా','मौसम और प्रति घंटा पूर्वानुमान')}</h3><p className="text-xs text-slate-500 mt-2 flex gap-1"><MapPin size={14}/>{(location||currentPilgrimLoc)?`${lat.toFixed(3)}, ${lng.toFixed(3)}`:'Pushkar Ghat, Rajahmundry'}</p></div><button aria-label="Refresh weather" disabled={loading} onClick={()=>setRefresh(r=>r+1)} className="rounded-full p-2 bg-slate-100 disabled:opacity-50"><RefreshCw size={18} className={loading?'animate-spin':''}/></button></header>
  <p className={`text-xs ${stale?'text-amber-800':'text-emerald-800'}`}>{loading?'Updating…':!data?'Unavailable':stale?'Saved forecast · may be outdated':'Updated forecast'} · Open-Meteo</p>
  <div className="text-[11px] text-emerald-800 space-y-1"><button className="underline" onClick={()=>{if(!navigator.geolocation){setLocationNotice('Location is unavailable in this browser.');return;}setLocationNotice('Requesting location…');navigator.geolocation.getCurrentPosition(p=>{setLocation({lat:Math.round(p.coords.latitude*1000)/1000,lng:Math.round(p.coords.longitude*1000)/1000});setLocationNotice('Using your approximate location.');},()=>setLocationNotice('Location permission denied or unavailable. Original location retained.'),{timeout:10000,maximumAge:60000});}}>Use my location (shares coordinates with Open-Meteo)</button>{location&&<button className="block underline" onClick={()=>{setLocation(null);setLocationNotice('');}}>Return to original location</button>}{locationNotice&&<p role="status">{locationNotice}</p>}</div>
  {error&&<p role="status" className="bg-amber-50 rounded-xl p-3 text-xs text-amber-900">{error}</p>}
  {data&&<><div className="rounded-2xl bg-[#0b3028] p-4 text-white"><div className="flex flex-wrap justify-between items-center gap-3"><strong className="text-4xl">{show(data.current.temp,'°C')}</strong><span className="text-xs text-amber-200">{t('Feels like','అనిపించే ఉష్ణోగ్రత','महसूस होता है')} {show(data.current.feels,'°C')}</span></div><p className="mt-2 text-emerald-100">{weatherCondition(data.current.code,language)}</p><p className="text-[11px] text-emerald-200 mt-2">Conditions: {time(data.current.time)} IST · Retrieved: {time(data.fetched)} IST</p><div className="grid grid-cols-2 gap-3 mt-4">{[['Humidity',show(data.current.humidity,'%')],['Wind',show(data.current.wind,' km/h')],['UV (hourly)',show(data.current.uv)],['Rain chance (hourly)',show(data.current.rain,'%')]].map(([label,v])=><div key={label} className="bg-black/20 p-3 rounded-xl"><p className="text-[10px] text-emerald-200">{label}</p><p className="font-bold text-sm mt-1">{v}</p></div>)}</div></div>
  <h4 className="text-sm font-bold">{t('Explore the next 8 hours','రాబోయే 8 గంటలు','अगले 8 घंटे')}</h4><div className="flex gap-2 overflow-x-auto pb-2">{[data.current,...data.hours].map((h,i)=><button key={h.time} aria-pressed={selected===null?i===0:selected===h.time} onClick={()=>setSelected(i===0?null:h.time)} className={`shrink-0 min-w-20 rounded-2xl p-3 border text-xs ${(selected===null?i===0:selected===h.time)?'bg-amber-400 border-amber-500':'bg-slate-50 border-slate-200'}`}><span>{i===0?t('Current','ప్రస్తుతం','अभी'):time(h.time)}</span><strong className="block text-lg my-2">{show(h.temp,'°')}</strong><span>{show(h.rain,'%')} rain</span></button>)}</div>
  {row&&<div className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed"><strong>{time(row.time)} IST · {weatherCondition(row.code,language)}</strong><p>Feels like {show(row.feels,'°C')} · Humidity {show(row.humidity,'%')} · Wind {show(row.wind,' km/h')}</p></div>}</>}
  <p className="text-[10px] text-slate-500 leading-relaxed">Updates every 10 minutes. Air quality is not connected. Weather does not establish river or bathing safety. <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline">Weather data: Open-Meteo</a></p>
 </section>;
};

