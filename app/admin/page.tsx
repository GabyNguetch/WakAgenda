"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const API_BASE = "https://wakagenda-backend.onrender.com/api/v1";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  supervisor_name: string;
  internship_start_date: string;
  is_active: boolean;
  created_at: string;
}

type View = "users" | "broadcast" | "backup";

function strColor(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return ["#C8102E","#E8600A","#0E7490","#7C3AED","#059669","#B45309","#DB2777"][Math.abs(h) % 7];
}
const ini = (u: User) => ((u.first_name[0]||"?")+( u.last_name[0]||"?")).toUpperCase();

/* ══ BACKGROUND ANIMÉ ══ */
const BUBBLES = [
  { icon:"👥", label:"Users",    x:8,  y:15, d:7,  dl:0   },
  { icon:"✉️", label:"Email",   x:85, y:20, d:9,  dl:1.5 },
  { icon:"💾", label:"Backup",  x:12, y:68, d:8,  dl:3   },
  { icon:"🔐", label:"Secure",  x:80, y:72, d:10, dl:0.8 },
  { icon:"📊", label:"Stats",   x:45, y:8,  d:11, dl:2   },
  { icon:"🗄️", label:"DB",     x:91, y:45, d:7,  dl:4   },
  { icon:"📡", label:"API",     x:4,  y:44, d:9,  dl:1   },
  { icon:"⚡", label:"Fast",    x:55, y:88, d:8,  dl:2.5 },
  { icon:"🛡️", label:"Admin",  x:30, y:82, d:10, dl:3.5 },
  { icon:"📋", label:"Tasks",   x:70, y:85, d:6,  dl:0.5 },
  { icon:"🔔", label:"Notifs",  x:22, y:32, d:12, dl:1.2 },
  { icon:"📈", label:"Reports", x:63, y:35, d:9,  dl:3.8 },
];

function Background() {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
      {/* grille */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px)",
        backgroundSize:"54px 54px",
      }}/>
      {/* orbs */}
      {[
        {w:700,h:700,top:"-200px",left:"-150px",bg:"rgba(200,16,46,.13)",a:"orbA"},
        {w:500,h:500,bottom:"-130px",right:"-100px",bg:"rgba(232,96,10,.09)",a:"orbB"},
        {w:400,h:400,top:"35%",left:"38%",bg:"rgba(124,58,237,.07)",a:"orbC"},
      ].map((o,i)=>(
        <div key={i} style={{
          position:"absolute",width:o.w,height:o.h,
          top:(o as {top?:string}).top,left:(o as {left?:string}).left,
          bottom:(o as {bottom?:string}).bottom,right:(o as {right?:string}).right,
          borderRadius:"50%",
          background:`radial-gradient(circle,${o.bg} 0%,transparent 70%)`,
          filter:"blur(65px)",
          animation:`${o.a} ${20+i*5}s ease-in-out infinite`,
        }}/>
      ))}
      {/* bulles flottantes */}
      {BUBBLES.map((b,i)=>(
        <div key={i} style={{
          position:"absolute",left:`${b.x}%`,top:`${b.y}%`,
          animation:`bbl ${b.d}s ease-in-out ${b.dl}s infinite`,
          opacity:.5,
        }}>
          <div style={{
            background:"rgba(22,22,32,.78)",backdropFilter:"blur(14px)",
            border:"1px solid rgba(255,255,255,.07)",borderRadius:13,
            padding:"9px 15px",display:"flex",alignItems:"center",gap:8,
          }}>
            <span style={{fontSize:18}}>{b.icon}</span>
            <span style={{fontSize:10,color:"#9898B0",fontFamily:"monospace",letterSpacing:.5}}>{b.label}</span>
          </div>
        </div>
      ))}
      {/* formes géométriques */}
      {[
        {w:160,h:160,top:"7%",right:"5%",br:24,d:42,c:"rgba(200,16,46,.06)"},
        {w:90,h:90,top:"62%",left:"3%",br:"50%",d:28,c:"rgba(232,96,10,.07)"},
        {w:55,h:55,top:"48%",right:"17%",br:8,d:20,c:"rgba(255,255,255,.04)"},
      ].map((s,i)=>(
        <div key={i} style={{
          position:"absolute",width:s.w,height:s.h,
          top:s.top,right:(s as {right?:string}).right,left:(s as {left?:string}).left,
          borderRadius:s.br,border:`1px solid ${s.c}`,
          animation:`spin ${s.d}s linear infinite`,
        }}/>
      ))}
      {/* scanlines */}
      <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.022) 3px,rgba(0,0,0,.022) 4px)"}}/>
    </div>
  );
}

/* ══ STYLES ══ */
const C={
  bg:"#0A0A0F",sf:"rgba(17,17,24,.93)",pn:"rgba(22,22,31,.97)",
  cd:"#1C1C28",bd:"rgba(255,255,255,.07)",bd2:"rgba(255,255,255,.12)",
  tx:"#F0F0F8",mt:"#6E6E88",mt2:"#9898B0",
  red:"#C8102E",red2:"#E8304E",rdim:"rgba(200,16,46,.12)",
  grn:"#16A34A",gdim:"rgba(22,163,74,.12)",
  org:"#E8600A",
};
const bx=(bg:string,color="#fff",brd?:string):React.CSSProperties=>({
  background:bg,color,border:brd||"none",borderRadius:8,
  padding:"9px 18px",fontSize:13,fontWeight:600,cursor:"pointer",
  display:"inline-flex",alignItems:"center",gap:7,transition:"all .18s",
  fontFamily:"'Figtree',sans-serif",
});
const bxs=(bg:string,color="#fff",brd?:string):React.CSSProperties=>({
  ...bx(bg,color,brd),padding:"6px 12px",fontSize:12,borderRadius:6,
});

/* ══ MINI COMPOSANTS ══ */
function Toast({msg,type,done}:{msg:string;type:"success"|"error"|"info";done:()=>void}){
  useEffect(()=>{const t=setTimeout(done,4000);return()=>clearTimeout(t);},[done]);
  return(
    <div style={{position:"fixed",bottom:24,right:24,zIndex:999,
      background:type==="success"?C.grn:type==="error"?C.red:C.cd,
      color:"#fff",padding:"13px 20px",borderRadius:10,fontSize:13,fontWeight:500,
      maxWidth:360,boxShadow:"0 8px 32px rgba(0,0,0,.55)",animation:"sIn .3s ease",
      backdropFilter:"blur(10px)"}}>
      {msg}
    </div>
  );
}

function Loader({text}:{text:string}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(10,10,15,.88)",backdropFilter:"blur(6px)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,zIndex:900}}>
      <div style={{width:48,height:48,borderRadius:"50%",border:"3px solid rgba(255,255,255,.07)",
        borderTopColor:C.red,animation:"spin .8s linear infinite"}}/>
      <span style={{fontSize:12,color:C.mt,fontFamily:"monospace"}}>{text}</span>
    </div>
  );
}

function Dialog({title,msg,icon,onOk,onCancel}:{title:string;msg:string;icon:string;onOk:()=>void;onCancel:()=>void}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.82)",backdropFilter:"blur(8px)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:800,padding:20}}>
      <div style={{background:C.pn,border:`1px solid ${C.bd2}`,borderRadius:16,padding:32,
        maxWidth:420,width:"90%",boxShadow:"0 32px 80px rgba(0,0,0,.6)",animation:"scIn .2s ease"}}>
        <div style={{fontSize:36,marginBottom:14}}>{icon}</div>
        <div style={{fontSize:19,fontWeight:700,marginBottom:8}}>{title}</div>
        <div style={{fontSize:13,color:C.mt,lineHeight:1.65,marginBottom:28,whiteSpace:"pre-line"}}>{msg}</div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button style={bx(C.cd,C.tx,`1px solid ${C.bd}`)} onClick={onCancel}>Annuler</button>
          <button style={bx(C.red)} onClick={onOk}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}

/* ══ PAGE ══ */
export default function AdminPage(){
  const [view,setView]=useState<View>("users");
  const [token,setToken]=useState("");
  const [connUser,setConnUser]=useState<User|null>(null);
  const [users,setUsers]=useState<User[]>([]);
  const [filtered,setFiltered]=useState<User[]>([]);
  const [search,setSearch]=useState("");
  const [loading,setLoading]=useState(false);
  const [loadTxt,setLoadTxt]=useState("");
  const [toast,setToast]=useState<{msg:string;type:"success"|"error"|"info"}|null>(null);
  const [dlg,setDlg]=useState<{title:string;msg:string;icon:string;onOk:()=>void}|null>(null);
  const [selUser,setSelUser]=useState<User|null>(null);
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [loginErr,setLoginErr]=useState("");
  const [subj,setSubj]=useState("");
  const cRef=useRef<HTMLDivElement>(null);
  const [bcRes,setBcRes]=useState<{ok:boolean;msg:string}|null>(null);
  const [csvFile,setCsvFile]=useState<File|null>(null);
  const [rstStats,setRstStats]=useState<{created:number;skipped:number;errors:number}|null>(null);
  const [expMsg,setExpMsg]=useState<{ok:boolean;msg:string}|null>(null);
  const [rstMsg,setRstMsg]=useState<{ok:boolean;msg:string}|null>(null);
  const fRef=useRef<HTMLInputElement>(null);
  const [mounted,setMounted]=useState(false);

  useEffect(()=>{
    setMounted(true);
    const t=localStorage.getItem("wak_admin_token");
    if(t) setToken(t);
  },[]);

  const ld=(s:boolean,t="Chargement…")=>{setLoading(s);setLoadTxt(t);};
  const toast2=useCallback((msg:string,type:"success"|"error"|"info"="info")=>setToast({msg,type}),[]);
  const ask=(title:string,msg:string,icon:string):Promise<boolean>=>
    new Promise(res=>setDlg({title,msg,icon,onOk:()=>{setDlg(null);res(true);}}));

  const loadUsers=useCallback(async(tk?:string)=>{
    const t=tk||token;
    if(!t) return;
    ld(true,"Chargement des utilisateurs…");
    try{
      const r=await fetch(`${API_BASE}/users`,{headers:{Authorization:`Bearer ${t}`}});
      if(r.status===401){setToken("");localStorage.removeItem("wak_admin_token");return;}
      const d:User[]=await r.json();
      setUsers(d);setFiltered(d);
    }catch{toast2("Impossible de charger les utilisateurs.","error");}
    finally{ld(false);}
  },[token,toast2]);

  useEffect(()=>{if(token) loadUsers(token);},[token]);

  useEffect(()=>{
    const q=search.toLowerCase();
    setFiltered(users.filter(u=>`${u.first_name} ${u.last_name} ${u.email} ${u.department}`.toLowerCase().includes(q)));
  },[search,users]);

  async function doLogin(){
    setLoginErr("");
    if(!email||!pass){setLoginErr("Email et mot de passe requis.");return;}
    ld(true,"Connexion…");
    try{
      const r=await fetch(`${API_BASE}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password:pass})});
      const d=await r.json();
      if(!r.ok) throw new Error(d.detail||"Identifiants invalides");
      setToken(d.access_token);
      localStorage.setItem("wak_admin_token",d.access_token);
      setConnUser(d.user);
      toast2(`Bienvenue ${d.user.first_name} !`,"success");
    }catch(e:unknown){setLoginErr("✗ "+(e instanceof Error?e.message:"Erreur"));}
    finally{ld(false);}
  }

  function logout(){setToken("");localStorage.removeItem("wak_admin_token");setConnUser(null);setUsers([]);setFiltered([]);}

  async function viewUser(id:string){
    ld(true,"Chargement…");
    try{
      const r=await fetch(`${API_BASE}/users/${id}`,{headers:{Authorization:`Bearer ${token}`}});
      if(!r.ok) throw new Error("Introuvable");
      setSelUser(await r.json());
    }catch(e:unknown){toast2(e instanceof Error?e.message:"Erreur","error");}
    finally{ld(false);}
  }

  async function deleteUser(id:string,name:string){
    const ok=await ask("Supprimer l'utilisateur",`Supprimer définitivement « ${name} » ?\nToutes ses tâches et données seront supprimées.`,"🗑️");
    if(!ok) return;
    ld(true,"Suppression…");
    try{
      const r=await fetch(`${API_BASE}/users/${id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
      if(r.status===204||r.ok){toast2(`${name} supprimé.`,"success");setSelUser(null);await loadUsers();}
      else{const d=await r.json();throw new Error(d.detail||"Erreur");}
    }catch(e:unknown){toast2(e instanceof Error?e.message:"Erreur","error");}
    finally{ld(false);}
  }

  function fmt(cmd:string){document.execCommand(cmd,false,undefined);cRef.current?.focus();}

  async function sendBroadcast(){
    const s=subj.trim(),m=cRef.current?.innerHTML.trim()||"";
    if(!token){toast2("Connectez-vous d'abord.","error");return;}
    if(!s){toast2("L'objet est requis.","error");return;}
    if(!m||m==="<br>"){toast2("Le message est vide.","error");return;}
    const active=users.filter(u=>u.is_active).length;
    const ok=await ask("Envoyer le message",`Envoi à ${active} utilisateur${active>1?"s":""} actif${active>1?"s":""}.\n\nObjet : "${s}"`, "✉️");
    if(!ok) return;
    ld(true,"Envoi en cours…");
    try{
      const r=await fetch(`${API_BASE}/notifications/broadcast`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({subject:s,message:m})});
      const d=await r.json();
      if(!r.ok) throw new Error(d.detail||"Erreur serveur");
      setBcRes({ok:d.failed===0,msg:d.failed>0?`✓ ${d.sent} envoyé(s)  ·  ✗ ${d.failed} échec(s)`:`✓ ${d.sent} message${d.sent>1?"s":""} envoyé${d.sent>1?"s":""}.`});
      if(d.failed===0){setSubj("");if(cRef.current) cRef.current.innerHTML="";}
    }catch(e:unknown){setBcRes({ok:false,msg:"✗ "+(e instanceof Error?e.message:"Erreur")});}
    finally{ld(false);}
  }

  async function downloadBackup(){
    ld(true,"Génération du CSV…");setExpMsg(null);
    try{
      const r=await fetch(`${API_BASE}/backup/export`);
      if(!r.ok) throw new Error("Erreur serveur "+r.status);
      const blob=await r.blob(),url=URL.createObjectURL(blob),a=document.createElement("a");
      a.href=url;a.download=`wakagenda_backup_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
      setExpMsg({ok:true,msg:"✓ Backup téléchargé."});toast2("Backup téléchargé !","success");
    }catch(e:unknown){setExpMsg({ok:false,msg:"✗ "+(e instanceof Error?e.message:"Erreur")});}
    finally{ld(false);}
  }

  async function uploadRestore(){
    if(!csvFile) return;
    const ok=await ask("Lancer la restauration",`Importer « ${csvFile.name} » ?\nLes données existantes (même UUID) ne seront pas modifiées.`,"⬆️");
    if(!ok) return;
    ld(true,"Restauration en cours…");setRstMsg(null);setRstStats(null);
    try{
      const form=new FormData();form.append("file",csvFile);
      const r=await fetch(`${API_BASE}/backup/import`,{method:"POST",body:form});
      const d=await r.json();
      if(!r.ok) throw new Error(d.detail||"Erreur serveur");
      setRstStats({created:d.users_created??d.tasks_created??d.imported??0,skipped:d.users_skipped??d.tasks_skipped??d.skipped??0,errors:d.errors?.length??0});
      setRstMsg({ok:true,msg:"✓ Restauration terminée."});toast2("Restauration terminée !","success");
      await loadUsers();
    }catch(e:unknown){setRstMsg({ok:false,msg:"✗ "+(e instanceof Error?e.message:"Erreur")});}
    finally{ld(false);}
  }

  if(!mounted) return null;

  const activeN=users.filter(u=>u.is_active).length;
  const inactN=users.length-activeN;

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;overflow:hidden}
        body{background:#0A0A0F;font-family:'Figtree',sans-serif;color:#F0F0F8}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes sIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes scIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
        @keyframes fUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes rIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        @keyframes orbA{0%,100%{transform:translate(0,0)}33%{transform:translate(60px,40px)}66%{transform:translate(-30px,60px)}}
        @keyframes orbB{0%,100%{transform:translate(0,0)}40%{transform:translate(-70px,-50px)}70%{transform:translate(40px,-30px)}}
        @keyframes orbC{0%,100%{transform:translate(0,0)}50%{transform:translate(-50px,70px)}}
        @keyframes bbl{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-14px) scale(1.03)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(200,16,46,.35)}50%{box-shadow:0 0 0 8px rgba(200,16,46,0)}}
        @keyframes glow{0%,100%{opacity:.5}50%{opacity:1}}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:3px}
        [contenteditable]:empty::before{content:attr(data-placeholder);color:#6E6E88;pointer-events:none}
        .nb:hover{background:rgba(255,255,255,.05)!important;color:#F0F0F8!important}
        tr:hover>td{background:rgba(255,255,255,.022);}
      `}</style>

      <Background/>
      {loading&&<Loader text={loadTxt}/>}
      {toast&&<Toast msg={toast.msg} type={toast.type} done={()=>setToast(null)}/>}
      {dlg&&<Dialog title={dlg.title} msg={dlg.msg} icon={dlg.icon} onOk={dlg.onOk} onCancel={()=>setDlg(null)}/>}

      {/* Modal user */}
      {selUser&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.78)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:700,padding:20}} onClick={()=>setSelUser(null)}>
          <div style={{background:C.pn,border:`1px solid ${C.bd2}`,borderRadius:16,width:"100%",maxWidth:500,animation:"scIn .2s ease",boxShadow:"0 32px 80px rgba(0,0,0,.6)",overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
            <div style={{height:2,background:"linear-gradient(90deg,#C8102E,#E8600A)"}}/>
            <div style={{padding:"20px 24px",borderBottom:`1px solid ${C.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:16,fontWeight:700}}>Détail utilisateur</span>
              <button style={{background:"none",border:"none",color:C.mt,fontSize:22,cursor:"pointer",lineHeight:1}} onClick={()=>setSelUser(null)}>×</button>
            </div>
            <div style={{padding:"20px 24px"}}>
              <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:22}}>
                <div style={{width:60,height:60,borderRadius:"50%",flexShrink:0,background:strColor(selUser.email),display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:"#fff",boxShadow:`0 0 20px ${strColor(selUser.email)}55`}}>{ini(selUser)}</div>
                <div>
                  <div style={{fontSize:19,fontWeight:700}}>{selUser.first_name} {selUser.last_name}</div>
                  <div style={{fontSize:12,color:C.mt,fontFamily:"monospace",marginTop:2}}>{selUser.email}</div>
                  <span style={{display:"inline-block",marginTop:6,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:selUser.is_active?C.gdim:"rgba(110,110,136,.1)",color:selUser.is_active?C.grn:C.mt,border:`1px solid ${selUser.is_active?"rgba(22,163,74,.25)":C.bd}`}}>
                    {selUser.is_active?"Actif":"Inactif"}
                  </span>
                </div>
              </div>
              {([["ID",selUser.id],["Département",selUser.department],["Encadreur",selUser.supervisor_name],["Début stage",selUser.internship_start_date?new Date(selUser.internship_start_date).toLocaleDateString("fr-FR"):"—"],["Créé le",selUser.created_at?new Date(selUser.created_at).toLocaleString("fr-FR"):"—"]] as [string,string][]).map(([l,v])=>(
                <div key={l} style={{display:"flex",padding:"10px 0",borderBottom:`1px solid ${C.bd}`,gap:12}}>
                  <div style={{width:120,flexShrink:0,fontSize:10,fontWeight:700,color:C.mt,textTransform:"uppercase",letterSpacing:.8}}>{l}</div>
                  <div style={{fontSize:13,fontWeight:500,flex:1,wordBreak:"break-all"}}>{v||"—"}</div>
                </div>
              ))}
            </div>
            <div style={{padding:"16px 24px",borderTop:`1px solid ${C.bd}`,display:"flex",justifyContent:"flex-end",gap:10}}>
              <button style={bxs(C.cd,C.tx,`1px solid ${C.bd}`)} onClick={()=>setSelUser(null)}>Fermer</button>
              <button style={bxs(C.rdim,C.red2,"1px solid rgba(200,16,46,.25)")} onClick={()=>deleteUser(selUser.id,`${selUser.first_name} ${selUser.last_name}`)}>🗑 Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SHELL ═══ */}
      <div style={{display:"flex",height:"100vh",overflow:"hidden",position:"relative",zIndex:1}}>

        {/* Sidebar */}
        <nav style={{width:245,minWidth:245,background:"rgba(17,17,24,.92)",backdropFilter:"blur(24px)",borderRight:`1px solid ${C.bd}`,display:"flex",flexDirection:"column",position:"relative",zIndex:10}}>
          <div style={{padding:"24px 20px 22px",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",gap:13}}>
            <div style={{width:40,height:40,borderRadius:10,background:C.red,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:"#fff",flexShrink:0,boxShadow:"0 0 20px rgba(200,16,46,.4)",animation:"pulse 3s infinite"}}>W</div>
            <div>
              <div style={{fontSize:15,fontWeight:800,letterSpacing:"-.3px"}}>WakAgenda</div>
              <div style={{fontSize:9,color:C.mt,letterSpacing:"2px",textTransform:"uppercase",marginTop:1}}>Admin Panel</div>
            </div>
          </div>
          <div style={{flex:1,padding:"14px 10px",display:"flex",flexDirection:"column",gap:3}}>
            <div style={{fontSize:9,color:C.mt,letterSpacing:"2px",textTransform:"uppercase",padding:"8px 12px 4px"}}>Navigation</div>
            {([["users","👥","Utilisateurs",users.length>0?String(users.length):null],["broadcast","✉️","Diffusion email",null],["backup","💾","Backup / Restore",null]] as [View,string,string,string|null][]).map(([v,ico,label,badge])=>(
              <button key={v} className="nb" onClick={()=>setView(v)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 12px",borderRadius:9,fontSize:13,fontWeight:view===v?700:500,color:view===v?"#E8304E":C.mt2,background:view===v?"rgba(200,16,46,.13)":"transparent",border:view===v?"1px solid rgba(200,16,46,.2)":"1px solid transparent",cursor:"pointer",width:"100%",textAlign:"left",transition:"all .2s",fontFamily:"'Figtree',sans-serif"}}>
                <span style={{fontSize:16}}>{ico}</span>
                {label}
                {badge&&badge!=="0"&&<span style={{marginLeft:"auto",background:C.red,color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10,fontFamily:"monospace"}}>{badge}</span>}
              </button>
            ))}
          </div>
          <div style={{padding:"16px",borderTop:`1px solid ${C.bd}`}}>
            {token?(
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:C.grn,boxShadow:`0 0 8px ${C.grn}`,animation:"glow 2s infinite"}}/>
                  <span style={{fontSize:11,color:C.mt2,fontFamily:"monospace"}}>{connUser?connUser.first_name:"Connecté"}</span>
                </div>
                <button onClick={logout} style={{background:"none",border:"none",color:C.mt,fontSize:11,cursor:"pointer",fontFamily:"'Figtree',sans-serif"}}>Déconnexion</button>
              </div>
            ):(
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:"#CA8A04",animation:"glow 2s infinite"}}/>
                <span style={{fontSize:11,color:C.mt,fontFamily:"monospace"}}>Non connecté</span>
              </div>
            )}
          </div>
        </nav>

        {/* Main */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {/* Topbar */}
          <div style={{height:56,minHeight:56,background:"rgba(17,17,24,.92)",backdropFilter:"blur(24px)",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",gap:16}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>{view==="users"?"👥":view==="broadcast"?"✉️":"💾"}</span>
              <span style={{fontSize:15,fontWeight:700}}>{{users:"Utilisateurs",broadcast:"Diffusion email",backup:"Backup & Restauration"}[view]}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,background:C.cd,border:`1px solid ${C.bd}`,borderRadius:7,padding:"5px 12px"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:token?C.grn:"#CA8A04",boxShadow:token?`0 0 6px ${C.grn}`:"0 0 6px #CA8A04"}}/>
              <span style={{fontSize:10,color:C.mt,fontFamily:"monospace",letterSpacing:1}}>{token?"API CONNECTÉE":"NON AUTHENTIFIÉ"}</span>
            </div>
          </div>

          {/* Content */}
          <div style={{flex:1,overflowY:"auto",padding:28}}>

            {/* Login flottant si pas de token */}
            {!token&&(
              <div style={{position:"fixed",bottom:28,right:28,zIndex:50,background:"rgba(22,22,31,.98)",backdropFilter:"blur(20px)",border:`1px solid ${C.bd2}`,borderRadius:16,padding:28,width:310,boxShadow:"0 24px 60px rgba(0,0,0,.65)",animation:"sIn .4s ease"}}>
                <div style={{height:2,background:"linear-gradient(90deg,#C8102E,#E8600A)",borderRadius:"2px 2px 0 0",margin:"-28px -28px 18px"}}/>
                <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>🔑 Connexion requise</div>
                <div style={{fontSize:12,color:C.mt,marginBottom:16,lineHeight:1.5}}>Entrez vos identifiants pour gérer les utilisateurs et envoyer des emails.</div>
                {loginErr&&<div style={{fontSize:11,color:C.red2,background:C.rdim,borderRadius:6,padding:"7px 10px",marginBottom:10,fontFamily:"monospace"}}>{loginErr}</div>}
                <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:"100%",background:C.cd,border:`1px solid ${C.bd}`,borderRadius:7,padding:"9px 12px",color:C.tx,fontSize:13,outline:"none",marginBottom:8}}/>
                <input type="password" placeholder="Mot de passe" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} style={{width:"100%",background:C.cd,border:`1px solid ${C.bd}`,borderRadius:7,padding:"9px 12px",color:C.tx,fontSize:13,outline:"none",marginBottom:12}}/>
                <button style={{...bx(C.red),width:"100%",justifyContent:"center"}} onClick={doLogin}>Se connecter</button>
              </div>
            )}

            {/* ═══ USERS ═══ */}
            {view==="users"&&(
              <div style={{animation:"fUp .35s ease"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,flexWrap:"wrap",gap:16}}>
                  <div>
                    <div style={{fontSize:24,fontWeight:800,letterSpacing:"-.5px"}}>Utilisateurs</div>
                    <div style={{fontSize:13,color:C.mt,marginTop:4}}>Gestion des comptes stagiaires enregistrés</div>
                  </div>
                  <button style={bx(C.cd,C.tx,`1px solid ${C.bd}`)} onClick={()=>loadUsers()}>↺ Rafraîchir</button>
                </div>
                {/* Stats */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:14,marginBottom:24}}>
                  {[{l:"Total",v:users.length,c:C.tx,i:"👥"},{l:"Actifs",v:activeN,c:C.grn,i:"✅"},{l:"Inactifs",v:inactN,c:C.red2,i:"⚠️"}].map(s=>(
                    <div key={s.l} style={{background:C.pn,border:`1px solid ${C.bd}`,borderRadius:12,padding:"18px 20px",animation:"fUp .35s ease"}}>
                      <div style={{fontSize:22,marginBottom:6}}>{s.i}</div>
                      <div style={{fontSize:30,fontWeight:800,fontFamily:"monospace",color:s.c,letterSpacing:"-1px"}}>{s.v}</div>
                      <div style={{fontSize:11,color:C.mt,textTransform:"uppercase",letterSpacing:"1px",marginTop:4}}>{s.l}</div>
                    </div>
                  ))}
                </div>
                {/* Table */}
                <div style={{background:C.pn,border:`1px solid ${C.bd}`,borderRadius:12,overflow:"hidden"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:`1px solid ${C.bd}`,flexWrap:"wrap",gap:12}}>
                    <input placeholder="🔍  Rechercher…" value={search} onChange={e=>setSearch(e.target.value)} style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:8,padding:"9px 14px",color:C.tx,fontSize:13,outline:"none",width:270}}/>
                    <span style={{fontSize:12,color:C.mt,fontFamily:"monospace"}}>{filtered.length}/{users.length} utilisateur{users.length>1?"s":""}</span>
                  </div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead>
                        <tr style={{borderBottom:`1px solid ${C.bd}`}}>
                          {["Utilisateur","Département","Encadreur","Début stage","Statut","Actions"].map((h,i)=>(
                            <th key={h} style={{padding:"12px 16px",textAlign:i===5?"right":"left",fontSize:10,fontWeight:700,color:C.mt,letterSpacing:"1px",textTransform:"uppercase"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {!token?(
                          <tr><td colSpan={6} style={{textAlign:"center",padding:52,color:C.mt,fontSize:13}}>Connectez-vous pour voir les utilisateurs.</td></tr>
                        ):filtered.length===0?(
                          <tr><td colSpan={6} style={{textAlign:"center",padding:52,color:C.mt,fontSize:13}}>{users.length===0?"Aucun utilisateur.":"Aucun résultat."}</td></tr>
                        ):filtered.map((u,i)=>(
                          <tr key={u.id} style={{borderBottom:`1px solid ${C.bd}`,transition:"background .15s",animation:`rIn .3s ease ${i*25}ms both`}}>
                            <td style={{padding:"13px 16px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:12}}>
                                <div style={{width:38,height:38,borderRadius:"50%",flexShrink:0,background:strColor(u.email),display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",boxShadow:`0 0 10px ${strColor(u.email)}50`}}>{ini(u)}</div>
                                <div>
                                  <div style={{fontWeight:600,fontSize:13}}>{u.first_name} {u.last_name}</div>
                                  <div style={{fontSize:11,color:C.mt,fontFamily:"monospace"}}>{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{padding:"13px 16px",fontSize:13}}>{u.department||"—"}</td>
                            <td style={{padding:"13px 16px",fontSize:13,color:C.mt2}}>{u.supervisor_name||"—"}</td>
                            <td style={{padding:"13px 16px",fontSize:12,fontFamily:"monospace",color:C.mt}}>{u.internship_start_date?new Date(u.internship_start_date).toLocaleDateString("fr-FR"):"—"}</td>
                            <td style={{padding:"13px 16px"}}>
                              <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:u.is_active?C.gdim:"rgba(110,110,136,.1)",color:u.is_active?C.grn:C.mt,border:`1px solid ${u.is_active?"rgba(22,163,74,.25)":C.bd}`}}>
                                {u.is_active?"Actif":"Inactif"}
                              </span>
                            </td>
                            <td style={{padding:"13px 16px"}}>
                              <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                                <button style={bxs(C.cd,C.tx,`1px solid ${C.bd}`)} onClick={()=>viewUser(u.id)}>Voir</button>
                                <button style={bxs(C.rdim,C.red2,"1px solid rgba(200,16,46,.25)")} onClick={()=>deleteUser(u.id,`${u.first_name} ${u.last_name}`)}>Supprimer</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ BROADCAST ═══ */}
            {view==="broadcast"&&(
              <div style={{animation:"fUp .35s ease"}}>
                <div style={{marginBottom:24}}>
                  <div style={{fontSize:24,fontWeight:800,letterSpacing:"-.5px"}}>Diffusion email</div>
                  <div style={{fontSize:13,color:C.mt,marginTop:4}}>Envoyer un message à tous les utilisateurs actifs</div>
                </div>
                <div style={{maxWidth:820,background:C.pn,border:`1px solid ${C.bd}`,borderRadius:12,overflow:"hidden"}}>
                  <div style={{height:2,background:"linear-gradient(90deg,#C8102E,#E8600A)"}}/>
                  <div style={{padding:"16px 22px",borderBottom:`1px solid ${C.bd}`,display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:18}}>✉️</span>
                    <span style={{fontSize:14,fontWeight:700}}>Nouveau message</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",padding:"13px 22px",borderBottom:`1px solid ${C.bd}`,gap:14}}>
                    <span style={{fontSize:12,color:C.mt,width:50,flexShrink:0}}>De</span>
                    <span style={{fontSize:13,color:C.mt2,fontFamily:"monospace"}}>{connUser?.email||"wakagenda.dsi@gmail.com"}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",padding:"13px 22px",borderBottom:`1px solid ${C.bd}`,gap:14}}>
                    <span style={{fontSize:12,color:C.mt,width:50,flexShrink:0}}>À</span>
                    <span style={{display:"inline-flex",alignItems:"center",gap:6,background:C.rdim,border:"1px solid rgba(200,16,46,.2)",borderRadius:20,padding:"4px 12px",fontSize:12,color:C.red2,fontWeight:600}}>
                      👥 Tous les utilisateurs actifs ({activeN})
                    </span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",padding:"13px 22px",borderBottom:`1px solid ${C.bd}`,gap:14}}>
                    <span style={{fontSize:12,color:C.mt,width:50,flexShrink:0}}>Objet</span>
                    <input value={subj} onChange={e=>setSubj(e.target.value)} placeholder="Objet du message…" style={{flex:1,background:"none",border:"none",outline:"none",color:C.tx,fontSize:15,fontWeight:600}}/>
                  </div>
                  <div style={{padding:"8px 16px",borderBottom:`1px solid ${C.bd}`,display:"flex",gap:3,flexWrap:"wrap",alignItems:"center"}}>
                    {([["bold","B",700,"normal"],["italic","I",400,"italic"],["underline","U",400,"normal","underline"]] as [string,string,number,string,string?][]).map(([cmd,lbl,fw,fs,td])=>(
                      <button key={cmd} onClick={()=>fmt(cmd)} style={{background:"none",border:"none",color:C.mt2,padding:"5px 9px",borderRadius:5,fontSize:13,cursor:"pointer",fontWeight:fw,fontStyle:fs,textDecoration:td}}>{lbl}</button>
                    ))}
                    <div style={{width:1,height:16,background:C.bd,margin:"0 4px"}}/>
                    <button onClick={()=>fmt("insertUnorderedList")} style={{background:"none",border:"none",color:C.mt2,padding:"5px 9px",borderRadius:5,fontSize:12,cursor:"pointer"}}>• Liste</button>
                    <button onClick={()=>fmt("insertOrderedList")} style={{background:"none",border:"none",color:C.mt2,padding:"5px 9px",borderRadius:5,fontSize:12,cursor:"pointer"}}>1. Liste</button>
                    <button onClick={()=>fmt("removeFormat")} style={{background:"none",border:"none",color:C.mt2,padding:"5px 9px",borderRadius:5,fontSize:12,cursor:"pointer"}}>✕ Format</button>
                  </div>
                  <div ref={cRef} contentEditable data-placeholder="Rédigez votre message ici…" style={{minHeight:260,padding:"20px 22px",outline:"none",fontSize:14,lineHeight:1.75,color:C.tx}}/>
                  <div style={{padding:"16px 22px",borderTop:`1px solid ${C.bd}`,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                    <button style={bx(C.red)} onClick={sendBroadcast}>▶ Envoyer</button>
                    <button style={bx(C.cd,C.tx,`1px solid ${C.bd}`)} onClick={()=>{setSubj("");if(cRef.current) cRef.current.innerHTML="";setBcRes(null);}}>Effacer</button>
                    {bcRes&&<span style={{fontSize:12,fontFamily:"monospace",padding:"8px 14px",borderRadius:7,background:bcRes.ok?C.gdim:C.rdim,color:bcRes.ok?C.grn:C.red2,border:`1px solid ${bcRes.ok?"rgba(22,163,74,.25)":"rgba(200,16,46,.25)"}`}}>{bcRes.msg}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ═══ BACKUP ═══ */}
            {view==="backup"&&(
              <div style={{animation:"fUp .35s ease"}}>
                <div style={{marginBottom:24}}>
                  <div style={{fontSize:24,fontWeight:800,letterSpacing:"-.5px"}}>Backup & Restauration</div>
                  <div style={{fontSize:13,color:C.mt,marginTop:4}}>Sauvegarde et restauration complète de la base de données</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
                  {/* Export */}
                  <div style={{background:C.pn,border:`1px solid ${C.bd}`,borderRadius:12,padding:28,display:"flex",flexDirection:"column",gap:18,overflow:"hidden",position:"relative"}}>
                    <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#16A34A,#059669)"}}/>
                    <div style={{display:"flex",alignItems:"center",gap:14,marginTop:6}}>
                      <div style={{width:48,height:48,borderRadius:12,background:"rgba(22,163,74,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>⬇️</div>
                      <div>
                        <div style={{fontSize:16,fontWeight:700}}>Exporter la base</div>
                        <div style={{fontSize:11,color:C.mt,marginTop:2}}>CSV complet · aucune auth requise</div>
                      </div>
                    </div>
                    <div style={{fontSize:13,color:C.mt,lineHeight:1.7}}>Télécharge un CSV avec <strong style={{color:C.tx}}>tous les utilisateurs</strong>, leurs tâches, commentaires et domaines.</div>
                    <div style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:8,padding:"12px 16px",fontSize:12,color:C.mt2,lineHeight:2}}>✓ users &nbsp;✓ tasks &nbsp;✓ comments &nbsp;✓ domains</div>
                    <button style={bx(C.grn)} onClick={downloadBackup}>⬇ Télécharger le backup CSV</button>
                    {expMsg&&<span style={{fontSize:12,fontFamily:"monospace",padding:"8px 14px",borderRadius:7,background:expMsg.ok?C.gdim:C.rdim,color:expMsg.ok?C.grn:C.red2,border:`1px solid ${expMsg.ok?"rgba(22,163,74,.25)":"rgba(200,16,46,.25)"}`}}>{expMsg.msg}</span>}
                  </div>
                  {/* Import */}
                  <div style={{background:C.pn,border:`1px solid ${C.bd}`,borderRadius:12,padding:28,display:"flex",flexDirection:"column",gap:18,overflow:"hidden",position:"relative"}}>
                    <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#E8600A,#CA8A04)"}}/>
                    <div style={{display:"flex",alignItems:"center",gap:14,marginTop:6}}>
                      <div style={{width:48,height:48,borderRadius:12,background:"rgba(202,138,4,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>⬆️</div>
                      <div>
                        <div style={{fontSize:16,fontWeight:700}}>Restaurer la base</div>
                        <div style={{fontSize:11,color:C.mt,marginTop:2}}>Import CSV · données existantes préservées</div>
                      </div>
                    </div>
                    <div style={{fontSize:13,color:C.mt,lineHeight:1.7}}>Les enregistrements existants (même UUID) sont <strong style={{color:C.tx}}>ignorés</strong> — aucune donnée ne sera écrasée.</div>
                    <div style={{border:`2px dashed ${csvFile?C.org:C.bd2}`,borderRadius:10,padding:"28px 20px",textAlign:"center",cursor:"pointer",background:csvFile?"rgba(232,96,10,.06)":"transparent",transition:"all .2s"}} onClick={()=>fRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f?.name.endsWith(".csv")) setCsvFile(f);}}>
                      <input ref={fRef} type="file" accept=".csv" style={{display:"none"}} onChange={e=>setCsvFile(e.target.files?.[0]||null)}/>
                      <div style={{fontSize:28,marginBottom:8}}>{csvFile?"📄":"📂"}</div>
                      <div style={{fontSize:13,color:C.mt}}>{csvFile?<span style={{color:C.org,fontFamily:"monospace"}}>{csvFile.name}</span>:<>Glissez votre CSV ici ou <span style={{color:C.red2,fontWeight:600}}>parcourir</span></>}</div>
                    </div>
                    <button style={{...bx(C.org),opacity:csvFile?1:.45,cursor:csvFile?"pointer":"not-allowed"}} onClick={uploadRestore} disabled={!csvFile}>⬆ Lancer la restauration</button>
                    {rstStats&&(
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                        {[{l:"Créés",v:rstStats.created,c:C.grn},{l:"Ignorés",v:rstStats.skipped,c:"#CA8A04"},{l:"Erreurs",v:rstStats.errors,c:C.red2}].map(s=>(
                          <div key={s.l} style={{background:C.cd,border:`1px solid ${C.bd}`,borderRadius:9,padding:14,textAlign:"center"}}>
                            <div style={{fontSize:26,fontWeight:800,fontFamily:"monospace",color:s.c}}>{s.v}</div>
                            <div style={{fontSize:10,color:C.mt,textTransform:"uppercase",letterSpacing:"1px",marginTop:3}}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {rstMsg&&<span style={{fontSize:12,fontFamily:"monospace",padding:"8px 14px",borderRadius:7,background:rstMsg.ok?C.gdim:C.rdim,color:rstMsg.ok?C.grn:C.red2,border:`1px solid ${rstMsg.ok?"rgba(22,163,74,.25)":"rgba(200,16,46,.25)"}`}}>{rstMsg.msg}</span>}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}