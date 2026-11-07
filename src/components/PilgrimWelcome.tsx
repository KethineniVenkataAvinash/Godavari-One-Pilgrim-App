import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Globe2, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
type Account = { name: string; phone: string; regNumber: string; pin: string; passType: 'GENERAL' };
export function PilgrimWelcome({ returning, onComplete, initialStep = 'splash' }: { returning: boolean; initialStep?: 'splash'|'account'|'login'|'signup'; onComplete: (account?: Account) => void }) {
  const { appLanguage: language, setAppLanguage, setCurrentInterface, loginPilgrim } = useApp();
  const [step, setStep] = useState<'splash'|'language'|'account'|'login'|'signup'>(initialStep);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const t = (en:string,te:string,hi:string) => language==='te'?te:language==='hi'?hi:en;
  useEffect(() => {
    if (initialStep !== 'splash') return;
    const timer=setTimeout(()=>{
      try {
        const saved=localStorage.getItem('g1_welcome_language');
        if(saved==='en'||saved==='te'||saved==='hi') {setAppLanguage(saved);if(returning){onComplete();return;}setStep('account');return;}
      } catch {}
      setStep('language');
    },1600);
    return ()=>clearTimeout(timer);
  }, []);
  useEffect(()=>{document.title=`${step==='splash'?'Welcome':step==='language'?'Choose Language':step==='signup'?'Create Account':step==='login'?'Log In':'Get Started'} | Godavari One`;},[step]);
  function navigate(next: typeof step) {setError('');setPin('');setConfirm('');setStep(next);}
  function submit(e: React.FormEvent) {
    e.preventDefault();setError('');
    if(!/^[6-9]\d{9}$/.test(phone)||!/^\d{4}$/.test(pin)){setError(t('Enter a valid 10-digit mobile number and 4-digit PIN.','సరైన 10 అంకెల మొబైల్ నంబర్, 4 అంకెల పిన్ ఇవ్వండి.','सही 10-अंकीय मोबाइल नंबर और 4-अंकीय पिन दर्ज करें।'));return;}
    try {
      const raw=localStorage.getItem('g1_registered_devotees');
      const accounts:Account[]=raw?JSON.parse(raw):[];
      if(!Array.isArray(accounts))throw new Error('Invalid account storage');
      let account=accounts.find(a=>a.phone===phone);
      if(step==='signup') {
        if(!name.trim()||pin!==confirm||!consent){setError(t('Enter your name, match both PINs and accept local account storage.','పేరు, సరిపోలే పిన్‌లు, సమ్మతి అవసరం.','नाम, मेल खाते पिन और सहमति आवश्यक हैं।'));return;}
        if(account){setError(t('This number is already registered. Choose Log in.','ఈ నంబర్ నమోదైంది. లాగిన్ ఎంచుకోండి.','यह नंबर पंजीकृत है। लॉग इन चुनें।'));return;}
        account={name:name.trim(),phone,pin,regNumber:`PK-2027-${crypto.randomUUID().slice(0,8).toUpperCase()}`,passType:'GENERAL'};
        localStorage.setItem('g1_registered_devotees',JSON.stringify([...accounts,account]));
      } else if(!account||account.pin!==pin){setError(t('Mobile number or PIN is incorrect.','మొబైల్ నంబర్ లేదా పిన్ తప్పు.','मोबाइल नंबर या पिन गलत है।'));return;}
      loginPilgrim({...account!,signatureVerified:false});onComplete(account!);
    } catch {setError(t('Unable to read or save your account. Enable browser storage and try again.','ఖాతాను సేవ్ చేయలేకపోయాము. బ్రౌజర్ నిల్వను అనుమతించండి.','खाता सहेजा नहीं जा सका। ब्राउज़र स्टोरेज चालू करें।'));}
  }
  const input='mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';
  return <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#03110f] text-white sm:p-4">
    <div className="h-[100dvh] w-full max-w-[420px] sm:h-[92dvh] sm:max-h-[900px] sm:rounded-[36px] sm:border-[8px] sm:border-[#1E292E] sm:shadow-2xl bg-[#061e1b] overflow-y-auto overflow-x-hidden relative isolate" aria-label="Pilgrim mobile welcome">
      <div className="min-h-full flex flex-col relative">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_15%,#bc8b3440,transparent_50%)]" />
      {step==='splash'?<div className="relative flex-1 min-h-[calc(100dvh-2rem)] sm:min-h-[calc(92dvh-16px)] sm:max-h-[884px] flex flex-col items-center justify-center px-6 text-center">
        <div className="absolute bottom-0 left-[-30%] w-[160%] h-64 rounded-[50%] bg-emerald-800/30 rotate-[-12deg]"/>
        <div className="absolute bottom-[-7rem] left-[-30%] w-[160%] h-72 rounded-[50%] border border-amber-300/20 rotate-[10deg]"/>
        <img src="/assets/branding/godavari-one-logo.png" alt="Godavari One" className="relative w-56 h-56 object-contain rounded-full bg-white p-2 shadow-2xl ring-8 ring-amber-300/10"/>
        <p className="mt-10 text-amber-300 uppercase tracking-[0.3em] text-xs">Godavari Maha Pushkaralu</p>
        <h1 className="text-4xl font-bold mt-3">Godavari One</h1><p className="text-emerald-100/70 mt-3">Your companion for a sacred journey</p>
        <p role="status" className="mt-16 text-xs tracking-widest text-amber-200">WELCOME • 2027</p>
      </div>:<>
        <header className="relative px-6 py-6 flex items-center justify-between"><button aria-label="Go back" onClick={()=>step==='language'?setCurrentInterface('public-portal'):navigate(step==='account'?'language':'account')} className="p-2 rounded-full bg-white/10"><ArrowLeft size={20}/></button><span className="text-xs tracking-widest text-amber-200">GODAVARI ONE</span><img src="/assets/branding/godavari-one-logo.png" alt="Godavari One" className="w-10 h-10 rounded-full bg-white object-contain"/></header>
        <div className="relative px-7 pt-5 pb-8"><p className="text-xs text-amber-300 uppercase tracking-widest">{step==='language'?'01 / LANGUAGE':'02 / YOUR JOURNEY'}</p><h1 className="text-3xl font-bold mt-3">{step==='language'?'Choose your language':step==='login'?t('Welcome back','తిరిగి స్వాగతం','वापसी पर स्वागत है'):step==='signup'?t('Create your account','మీ ఖాతా సృష్టించండి','अपना खाता बनाएं'):t('Your journey starts here','మీ ప్రయాణం ఇక్కడ మొదలవుతుంది','आपकी यात्रा यहाँ से शुरू होती है')}</h1><p className="text-sm text-emerald-100/70 mt-3">{t('Plan your visit. Stay connected. Travel together.','మీ యాత్రను ప్లాన్ చేయండి. కలిసి ప్రయాణించండి.','अपनी यात्रा की योजना बनाएं। साथ चलें।')}</p></div>
        <main className="relative flex-1 rounded-t-[2rem] bg-white px-6 py-7 text-slate-900">
          {step==='language' && <><div className="space-y-3">{[{code:'te',name:'తెలుగు',sub:'Telugu'},{code:'en',name:'English',sub:'English'},{code:'hi',name:'हिन्दी',sub:'Hindi'}].map(l=><button key={l.code} onClick={()=>setAppLanguage(l.code as 'en'|'te'|'hi')} aria-pressed={language===l.code} className={`w-full flex items-center gap-4 text-left p-4 rounded-2xl border-2 ${language===l.code?'border-emerald-700 bg-emerald-50':'border-slate-100 bg-slate-50'}`}><Globe2 size={22} className="text-emerald-700"/><span className="flex-1"><strong className="text-lg">{l.name}</strong><span className="block text-xs text-slate-500">{l.sub}</span></span>{language===l.code&&<Check size={20} className="text-emerald-700"/>}</button>)}</div><button onClick={()=>{try{localStorage.setItem('g1_welcome_language',language);}catch{}navigate('account');}} className="mt-6 w-full rounded-2xl bg-emerald-900 text-white p-4 font-bold">{t('Continue','కొనసాగించండి','जारी रखें')}<ArrowRight size={18} className="inline ml-2"/></button></>}
          {step==='account' && <div className="space-y-4"><div className="rounded-2xl bg-emerald-50 p-5 mb-6"><ShieldCheck className="text-emerald-800"/><p className="mt-3 font-semibold">{t('One place for your pilgrim experience','మీ యాత్ర కోసం ఒకే వేదిక','आपकी तीर्थयात्रा के लिए एक जगह')}</p><p className="mt-2 text-sm text-slate-500">{t('Save your profile and explore family, travel and planning tools.','ప్రొఫైల్ సేవ్ చేసి కుటుంబం, ప్రయాణ సాధనాలను చూడండి.','प्रोफ़ाइल सहेजें और परिवार व यात्रा सुविधाएँ देखें।')}</p></div><button onClick={()=>navigate('login')} className="w-full bg-emerald-900 text-white rounded-2xl p-4 font-bold">{t('Log in','లాగిన్','लॉग इन')}</button><button onClick={()=>navigate('signup')} className="w-full bg-amber-400 rounded-2xl p-4 font-bold">{t('Create account','ఖాతా సృష్టించండి','खाता बनाएं')}</button><button onClick={()=>onComplete()} className="w-full p-3 text-sm text-slate-500">{t('Explore as guest','అతిథిగా చూడండి','अतिथि के रूप में देखें')}</button></div>}
          {(step==='login'||step==='signup')&&<form onSubmit={submit} className="space-y-4">
            {step==='signup'&&<label className="block text-sm font-semibold">{t('Full name','పూర్తి పేరు','पूरा नाम')}<input required autoComplete="name" maxLength={80} value={name} onChange={e=>setName(e.target.value)} className={input}/></label>}
            <label className="block text-sm font-semibold">{t('Mobile number','మొబైల్ నంబర్','मोबाइल नंबर')}<input required type="tel" autoComplete="username" inputMode="numeric" maxLength={10} placeholder="10-digit mobile number" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,''))} className={input}/></label>
            <label className="block text-sm font-semibold">{t('4-digit PIN','4 అంకెల పిన్','4-अंकीय पिन')}<div className="relative"><input required type={visible?'text':'password'} autoComplete={step==='signup'?'new-password':'current-password'} inputMode="numeric" maxLength={4} value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,''))} className={`${input} pr-14`}/><button type="button" aria-label={visible?'Hide PIN':'Show PIN'} onClick={()=>setVisible(!visible)} className="absolute right-4 top-6 text-slate-500">{visible?<EyeOff size={20}/>:<Eye size={20}/>}</button></div></label>
            {step==='signup'&&<><label className="block text-sm font-semibold">{t('Confirm PIN','పిన్ నిర్ధారించండి','पिन की पुष्टि करें')}<input required autoComplete="new-password" type={visible?'text':'password'} inputMode="numeric" maxLength={4} value={confirm} onChange={e=>setConfirm(e.target.value.replace(/\D/g,''))} className={input}/></label><label className="flex items-start gap-3 text-xs text-slate-500"><input required type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1"/>{t('Save my account on this browser. I understand this is local access, without SMS verification.','ఈ బ్రౌజర్‌లో నా ఖాతాను సేవ్ చేయండి. SMS నిర్ధారణ లేదు.','इस ब्राउज़र पर खाता सहेजें। SMS सत्यापन उपलब्ध नहीं है।')}</label></>}
            {error&&<p role="alert" className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</p>}
            <button type="submit" className="w-full rounded-2xl bg-emerald-900 p-4 text-white font-bold">{step==='signup'?t('Create account & continue','ఖాతా సృష్టించి కొనసాగించండి','खाता बनाएं और जारी रखें'):t('Log in & continue','లాగిన్ చేసి కొనసాగించండి','लॉग इन करें और जारी रखें')}</button>
            <button type="button" onClick={()=>navigate(step==='login'?'signup':'login')} className="w-full text-sm text-emerald-800 py-2">{step==='login'?t('New here? Create account','కొత్తవారా? ఖాతా సృష్టించండి','नए हैं? खाता बनाएं'):t('Already registered? Log in','ఖాతా ఉందా? లాగిన్','पहले से खाता है? लॉग इन')}</button>
            <p className="text-xs text-slate-400 text-center">{t('Local account • Use the browser where you registered','స్థానిక ఖాతా • నమోదు చేసిన బ్రౌజర్ వాడండి','स्थानीय खाता • पंजीकरण वाला ब्राउज़र उपयोग करें')}</p>
          </form>}
        </main>
      </>}
      </div>
    </div>
  </div>;
}

