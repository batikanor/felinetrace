import type {ReactNode} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, draw, enter, fade, rise} from './animation';
import {C, mono, sans, serif} from './design';
import {detectors, findings, ratioSources, splitPayments} from './data';
import {Icon} from './primitives';

const AltFrame = ({children, bg, color, label, index, accent}: {children: ReactNode; bg: string; color: string; label: string; index: string; accent: string}) => {
  const frame=useCurrentFrame();
  return <AbsoluteFill style={{background:bg,color,fontFamily:sans,overflow:'hidden'}}>
    <div style={{position:'absolute',left:58,top:48,display:'flex',alignItems:'center',gap:13,opacity:fade(frame,0,12)}}><div style={{width:29,height:29,border:`2px solid ${accent}`,borderRadius:'50%',display:'grid',placeItems:'center',font:`italic 700 18px ${serif}`,color:accent}}>t</div><b style={{fontSize:20}}>trace</b></div>
    <div style={{position:'absolute',right:58,top:54,font:`11px ${mono}`,letterSpacing:1.3,opacity:.72}}>{index} · {label.toUpperCase()}</div>
    {children}
  </AbsoluteFill>;
};

const TinySource = ({number,value,file,delay=0,dark=false}: {number:string;value:string;file:string;delay?:number;dark?:boolean}) => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const p=enter(frame,fps,delay);
  return <div style={{height:86,padding:'13px 16px',border:`1px solid ${dark?'rgba(255,255,255,.18)':'#c9c9c0'}`,background:dark?'rgba(255,255,255,.055)':'#fff',display:'grid',gridTemplateColumns:'38px 1fr',alignItems:'center',...rise(p,22)}}><b style={{font:`700 11px ${mono}`,opacity:.65}}>{number}</b><div><b style={{fontSize:17}}>{value}</b><span style={{display:'block',font:`10px ${mono}`,opacity:.62,marginTop:6}}>{file}</span></div></div>;
};

// ——— Cited memo: four intentionally different visual languages ———

export const EditorialRedline = () => {
  const frame=useCurrentFrame(); const red='#ef3b2d'; const underline=draw(frame,42,92); const note=enter(frame,useVideoConfig().fps,82);
  return <AltFrame bg="#eee8dc" color="#121212" accent={red} index="A1" label="Editorial redline">
    <div style={{position:'absolute',left:92,top:155,width:520}}><div style={{font:`700 12px ${mono}`,color:red,letterSpacing:2}}>CASE NOTE / F-01</div><h1 style={{font:`500 76px/.93 ${serif}`,letterSpacing:-3,margin:'22px 0'}}>The same hand<br/>made the vendor<br/><i>and</i> paid it.</h1></div>
    <div style={{position:'absolute',left:735,top:155,width:1050,height:690,borderTop:'5px solid #111',borderBottom:'1px solid #111',paddingTop:30}}><div style={{display:'flex',justifyContent:'space-between',font:`11px ${mono}`}}><span>RATIO CONSULTING GMBH · 209101</span><span>12 MAY — 20 DEC 2025</span></div><div style={{font:`38px/1.45 ${serif}`,marginTop:62,maxWidth:960}}>MV-U05 <span style={{position:'relative'}}>created and approved<span style={{position:'absolute',left:0,right:0,bottom:-8,height:5,background:red,transformOrigin:'left',transform:`scaleX(${underline})`}}/></span> the vendor, held conflicting rights, and moved <b>€295,120</b>.</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:55}}><TinySource number="01" value="MV-U05 → MV-U05" file="MASTER DATA · ROW 8" delay={28}/><TinySource number="03" value="€295,120 paid" file="GENERAL LEDGER" delay={42}/><TinySource number="02" value="3 conflicting rights" file="PERMISSIONS" delay={56}/><TinySource number="04" value="0 receipts" file="GOODS RECEIPTS" delay={70}/></div><div style={{position:'absolute',right:0,bottom:27,font:`italic 28px ${serif}`,color:red,...rise(note,18)}}>not an alert — a chain of proof.</div></div>
  </AltFrame>;
};

export const EvidenceConstellation = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const core=enter(frame,fps,18); const lines=draw(frame,30,95); const neon='#78f4ba';
  const nodes=[['01','SAME USER',170,95],['02','3 RIGHTS',700,65],['03','€295,120',760,450],['04','0 RECEIPTS',140,475]];
  return <AltFrame bg="#07110e" color="#e9fff3" accent={neon} index="A2" label="Evidence constellation">
    <div style={{position:'absolute',left:80,top:150}}><div style={{font:`11px ${mono}`,color:neon,letterSpacing:2}}>FORENSIC GRAPH</div><h1 style={{fontSize:62,lineHeight:.98,letterSpacing:-3,margin:'18px 0'}}>Four weak signals.<br/>One strong case.</h1></div>
    <div style={{position:'absolute',left:760,top:135,width:1000,height:760}}><svg style={{position:'absolute',inset:0,width:'100%',height:'100%'}} viewBox="0 0 1000 760"><g stroke={neon} strokeWidth="2" opacity={.7} strokeDasharray="7 9" strokeDashoffset={(1-lines)*120}><path d="M500 360L260 155"/><path d="M500 360L770 125"/><path d="M500 360L830 510"/><path d="M500 360L210 535"/></g><circle cx="500" cy="360" r={120*core} fill="rgba(120,244,186,.06)" stroke={neon} strokeWidth="3"/></svg><div style={{position:'absolute',left:380,top:240,width:240,height:240,borderRadius:'50%',display:'grid',placeItems:'center',textAlign:'center',transform:`scale(${core})`}}><div><div style={{font:`11px ${mono}`,color:neon}}>F-01</div><b style={{fontSize:34,display:'block',marginTop:8}}>RATIO</b><span style={{font:`11px ${mono}`,opacity:.65}}>VENDOR 209101</span></div></div>{nodes.map(([n,v,x,y],i)=>{const p=enter(frame,fps,38+i*13);return <div key={n} style={{position:'absolute',left:Number(x),top:Number(y),width:190,height:96,border:`1px solid rgba(120,244,186,.45)`,background:'rgba(120,244,186,.055)',padding:'17px',...rise(p,26)}}><span style={{font:`10px ${mono}`,color:neon}}>[{n}]</span><b style={{fontSize:18,display:'block',marginTop:9}}>{v}</b></div>})}</div>
    <div style={{position:'absolute',left:80,bottom:78,font:`12px ${mono}`,color:neon}}>CONTROL → PERMISSION → PAYMENT → ABSENCE</div>
  </AltFrame>;
};

export const CutoffTimeline = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const blue='#1746ff'; const path=draw(frame,18,105); const alert=enter(frame,fps,98);
  const events=[['19–26 DEC','8 RECEIPTS','Goods in'],['31 DEC','YEAR END','No accrual'],['03–15 JAN','8 INVOICES','€192K posted']];
  return <AltFrame bg="#f8f9fb" color="#10131a" accent={blue} index="A3" label="Swiss timeline">
    <div style={{position:'absolute',left:80,top:150,width:760}}><div style={{font:`700 12px ${mono}`,color:blue}}>CUT-OFF / F-03</div><h1 style={{fontSize:76,lineHeight:.93,letterSpacing:-5,margin:'22px 0'}}>December work.<br/><span style={{color:blue}}>January books.</span></h1></div>
    <div style={{position:'absolute',left:790,right:80,top:250,height:460}}><div style={{position:'absolute',left:60,right:60,top:125,height:7,background:'#dde2ee'}}><div style={{width:`${path*100}%`,height:'100%',background:blue}}/></div><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:40}}>{events.map((e,i)=>{const p=enter(frame,fps,28+i*24);return <div key={e[0]} style={{position:'relative',paddingTop:180,...rise(p,28)}}><div style={{position:'absolute',top:104,left:0,width:48,height:48,borderRadius:'50%',background:i===1?'#ff5b4a':blue,border:'10px solid #f8f9fb'}}/><div style={{font:`700 12px ${mono}`,color:i===1?'#d52d20':blue}}>{e[0]}</div><b style={{fontSize:27,display:'block',marginTop:12}}>{e[1]}</b><span style={{fontSize:17,color:'#6d7480',display:'block',marginTop:8}}>{e[2]}</span></div>})}</div><div style={{marginTop:48,padding:'23px 26px',background:'#10131a',color:'#fff',display:'flex',justifyContent:'space-between',alignItems:'center',...rise(alert,30)}}><b style={{fontSize:23}}>Missing 2025 posting</b><span style={{font:`700 12px ${mono}`,color:'#ff7568'}}>€192,000</span></div></div>
  </AltFrame>;
};

export const RepairStack = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const yellow='#ffd83d'; const labels=[['REPAIR LINE 2',28000],['HYDRAULICS',34000],['CONVEYOR',15500],['OVERHAUL',41000],['COOLING',12800],['DRIVE CONTROL',19500]];
  return <AltFrame bg="#111" color="#fff" accent={yellow} index="A4" label="Brutalist stack">
    <div style={{position:'absolute',left:72,top:145}}><div style={{display:'inline-block',padding:'8px 11px',background:yellow,color:'#111',font:`800 11px ${mono}`}}>F-02 · CLASSIFICATION</div><h1 style={{fontSize:77,lineHeight:.9,letterSpacing:-5,margin:'24px 0'}}>Repairs<br/>dressed<br/>as assets.</h1><div style={{font:`13px ${mono}`,color:yellow,marginTop:30}}>6 ADDITIONS · €150,800</div></div>
    <div style={{position:'absolute',left:710,right:60,top:150,bottom:120,display:'flex',flexDirection:'column-reverse',gap:7}}>{labels.map((x,i)=>{const p=enter(frame,fps,18+i*13);return <div key={x[0]} style={{height:75,padding:'0 22px',background:i%2?yellow:'#fff',color:'#111',display:'flex',alignItems:'center',justifyContent:'space-between',transformOrigin:'left',transform:`scaleX(${p})`}}><b style={{font:`800 16px ${mono}`}}>{x[0]}</b><strong style={{fontSize:25}}>€{Number(x[1]).toLocaleString('en-US')}</strong></div>})}</div><div style={{position:'absolute',left:710,right:60,bottom:65,borderTop:`2px solid ${yellow}`,paddingTop:16,display:'flex',justifyContent:'space-between',font:`12px ${mono}`,color:yellow}}><span>BOOKED TO 040000 / 060000</span><span>NOT EXPENSE 670000</span></div>
  </AltFrame>;
};

// ——— Audit Test Lab: terminal, funnel, card system, balance ———

export const TerminalTestRun = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const green='#79ff9b'; const logs=[['00:01','INGEST','35 files / 27,190 rows'],['00:02','RECONCILE','3 controls passed'],['00:03','RUN','4 deterministic tests'],['00:04','CHALLENGE','7 decoys / 0 accused'],['00:05','CITE','14 exact passages']];
  return <AltFrame bg="#050706" color="#dfffe8" accent={green} index="B1" label="Forensic terminal">
    <div style={{position:'absolute',left:72,top:145,width:530}}><div style={{font:`12px ${mono}`,color:green}}>&gt; trace audit --dossier FY2025</div><h1 style={{font:`700 66px/.95 ${mono}`,letterSpacing:-4,margin:'28px 0'}}>A test run<br/>you can<br/>read.</h1></div>
    <div style={{position:'absolute',left:690,top:135,right:70,bottom:90,border:`1px solid #1e5630`,background:'#07100a',boxShadow:'0 0 80px rgba(121,255,155,.06)',padding:'34px 38px'}}><div style={{display:'flex',gap:8,marginBottom:38}}><i style={{width:10,height:10,borderRadius:10,background:'#ff665c'}}/><i style={{width:10,height:10,borderRadius:10,background:'#ffd65c'}}/><i style={{width:10,height:10,borderRadius:10,background:green}}/></div>{logs.map((l,i)=>{const p=enter(frame,fps,15+i*20);return <div key={l[1]} style={{display:'grid',gridTemplateColumns:'80px 170px 1fr',height:82,alignItems:'center',borderTop:'1px solid #15351f',font:`15px ${mono}`,opacity:p}}><span style={{color:'#557c60'}}>{l[0]}</span><b style={{color:green}}>{l[1]}</b><span>{l[2]}</span></div>})}<div style={{marginTop:28,font:`18px ${mono}`,color:green,opacity:fade(frame,112)}}>✓ 4 findings written with sources<span style={{animation:'none'}}>&nbsp;█</span></div></div>
  </AltFrame>;
};

export const EvidenceFunnel = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const cobalt='#3138ff';
  const files=Array.from({length:18});
  return <AltFrame bg="#f4f0ff" color="#15122b" accent={cobalt} index="B2" label="Evidence funnel">
    <div style={{position:'absolute',left:75,top:145}}><div style={{font:`700 12px ${mono}`,color:cobalt}}>REDUCE WITHOUT LOSING TRACE</div><h1 style={{fontSize:70,lineHeight:.94,letterSpacing:-4,margin:'23px 0'}}>From dossier<br/>to decision.</h1></div>
    <div style={{position:'absolute',left:690,right:80,top:140,bottom:100}}><div style={{display:'flex',flexWrap:'wrap',gap:10,width:620}}>{files.map((_,i)=>{const p=enter(frame,fps,8+i*3);return <div key={i} style={{width:58,height:70,border:`1px solid ${cobalt}`,background:'#fff',display:'grid',placeItems:'center',font:`10px ${mono}`,color:cobalt,...rise(p,20)}}>{String(i+1).padStart(2,'0')}</div>})}</div><svg style={{position:'absolute',left:560,top:40,width:350,height:520}} viewBox="0 0 350 520"><path d="M0 0H350L220 260V430L130 500V260Z" fill={cobalt}/><text x="175" y="170" textAnchor="middle" fill="white" style={{font:`700 18px ${mono}`}}>4 TESTS</text><text x="175" y="210" textAnchor="middle" fill="#c6c8ff" style={{font:`12px ${mono}`}}>+ COUNTERCHECKS</text></svg><div style={{position:'absolute',right:0,bottom:0,width:330,padding:'26px 28px',background:'#ff5f4b',color:'#fff',transform:`scale(${enter(frame,fps,105)})`}}><div style={{font:`11px ${mono}`}}>OUTPUT</div><b style={{fontSize:52,display:'block',marginTop:8}}>4</b><span style={{fontSize:19}}>sourced findings</span></div></div>
  </AltFrame>;
};

export const RuleCardDeck = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const colors=['#ff654f','#3757ff','#ffd640','#20b87a']; const cards=[['VENDOR CHAIN','same owner + fast pay'],['CAPEX','repair terms → assets'],['CUT-OFF','Dec service ≠ 2025 post'],['SPLITTING','same day + below €10K']];
  return <AltFrame bg="#f3f2eb" color="#111" accent="#3757ff" index="B3" label="Rule card deck">
    <div style={{position:'absolute',left:74,top:145,width:500}}><div style={{font:`700 12px ${mono}`,color:'#3757ff'}}>FOUR DETERMINISTIC RULES</div><h1 style={{fontSize:72,lineHeight:.92,letterSpacing:-5,margin:'22px 0'}}>Show the<br/>logic,<br/>not magic.</h1></div>
    <div style={{position:'absolute',left:690,top:155,width:1050,height:680}}>{cards.map((c,i)=>{const p=enter(frame,fps,18+i*18);return <div key={c[0]} style={{position:'absolute',left:i*92,top:i*92,width:650,height:255,padding:'34px 38px',background:colors[i],color:i===2?'#111':'#fff',boxShadow:'15px 18px 0 rgba(0,0,0,.12)',transform:`translate(${(1-p)*150}px,${(1-p)*35}px) rotate(${(i-1.5)*2}deg)`,opacity:p}}><div style={{display:'flex',justifyContent:'space-between',font:`11px ${mono}`}}><span>RULE {String(i+1).padStart(2,'0')}</span><span>TRACE [{i===0?'1–4':i===1?'5–7':i===2?'8–11':'12–14'}]</span></div><b style={{fontSize:39,display:'block',marginTop:54}}>{c[0]}</b><span style={{font:`16px ${mono}`,display:'block',marginTop:15}}>{c[1]}</span></div>})}</div>
  </AltFrame>;
};

export const CountercheckBalance = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const swing=interpolate(enter(frame,fps,45),[0,1],[-8,4]); const coral='#ff6958'; const blue='#2748da';
  return <AltFrame bg="#fffaf2" color="#171717" accent={blue} index="B4" label="Countercheck balance">
    <div style={{position:'absolute',left:74,top:145}}><div style={{font:`700 12px ${mono}`,color:blue}}>SKEPTIC PASS</div><h1 style={{fontSize:70,lineHeight:.94,letterSpacing:-4,margin:'22px 0'}}>New vendor<br/>does not mean<br/>fraud.</h1></div>
    <div style={{position:'absolute',left:690,top:160,width:1080,height:690}}><div style={{position:'absolute',left:520,top:240,width:20,height:340,background:'#171717'}}/><div style={{position:'absolute',left:440,top:560,width:180,height:22,background:'#171717'}}/><div style={{position:'absolute',left:90,top:220,width:900,height:12,background:'#171717',transform:`rotate(${swing}deg)`,transformOrigin:'center'}}><div style={{position:'absolute',left:65,top:0,width:3,height:170,background:'#171717'}}/><div style={{position:'absolute',right:65,top:0,width:3,height:170,background:'#171717'}}/></div><div style={{position:'absolute',left:10,top:360,width:370,padding:'28px',border:`3px solid ${coral}`,background:'#fff'}}><span style={{font:`11px ${mono}`,color:coral}}>FLAG · 209101</span><b style={{fontSize:28,display:'block',marginTop:14}}>Ratio Consulting</b><div style={{marginTop:22,font:`14px/1.8 ${mono}`}}>same approver<br/>0 receipts<br/>€295,120 paid</div></div><div style={{position:'absolute',right:10,top:360,width:370,padding:'28px',border:`3px solid ${blue}`,background:'#fff',...rise(enter(frame,fps,62),28)}}><span style={{font:`11px ${mono}`,color:blue}}>CLEAR · 209112</span><b style={{fontSize:28,display:'block',marginTop:14}}>Vega Werkstoffe</b><div style={{marginTop:22,font:`14px/1.8 ${mono}`}}>four-eyes<br/>4 receipts<br/>deliveries matched</div></div></div>
  </AltFrame>;
};

// ——— Benchmark Studio: radar, confusion grid, method race, proof collage ———

export const DetectorRadar = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const p=enter(frame,fps,22); const cyan='#4de3ff'; const center=[470,360]; const axes=[[470,70],[780,360],[470,650],[160,360]]; const pts=axes.map(([x,y])=>[center[0]+(x-center[0])*.86*p,center[1]+(y-center[1])*.86*p]);
  return <AltFrame bg="#071321" color="#e9f8ff" accent={cyan} index="C1" label="Detector radar">
    <div style={{position:'absolute',left:72,top:145}}><div style={{font:`12px ${mono}`,color:cyan}}>MULTI-METHOD SIGNAL</div><h1 style={{fontSize:69,lineHeight:.94,letterSpacing:-4,margin:'22px 0'}}>One case.<br/>Four angles.</h1><div style={{marginTop:36,font:`13px/2 ${mono}`,color:'#9fc0cc'}}>RULES · 4<br/>GRAPH · 4<br/>SEQUENCE · 4<br/>SKEPTIC · 4</div></div>
    <svg style={{position:'absolute',left:760,top:110,width:940,height:760}} viewBox="0 0 940 720"><g transform="translate(0 0)">{[1,.75,.5,.25].map(v=><polygon key={v} points={axes.map(([x,y])=>`${center[0]+(x-center[0])*v},${center[1]+(y-center[1])*v}`).join(' ')} fill="none" stroke="rgba(77,227,255,.18)" strokeWidth="2"/>)}{axes.map(([x,y],i)=><line key={i} x1={center[0]} y1={center[1]} x2={x} y2={y} stroke="rgba(77,227,255,.22)"/>)}<polygon points={pts.map(x=>x.join(',')).join(' ')} fill="rgba(77,227,255,.17)" stroke={cyan} strokeWidth="4"/>{pts.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="8" fill={cyan}/>)}</g><text x="470" y="45" textAnchor="middle" fill={cyan} style={{font:`700 13px ${mono}`}}>RULES</text><text x="820" y="365" fill={cyan} style={{font:`700 13px ${mono}`}}>GRAPH</text><text x="470" y="700" textAnchor="middle" fill={cyan} style={{font:`700 13px ${mono}`}}>SEQUENCE</text><text x="55" y="365" fill={cyan} style={{font:`700 13px ${mono}`}}>SKEPTIC</text><text x="470" y="352" textAnchor="middle" fill="white" style={{font:`700 24px ${sans}`}}>F-01</text><text x="470" y="380" textAnchor="middle" fill="#9fc0cc" style={{font:`11px ${mono}`}}>CONSENSUS</text></svg>
  </AltFrame>;
};

export const ConfusionGrid = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const red='#ff4f45'; const green='#22b36a'; const cells=[...findings.map(x=>[x.id,'SCHEME',red]),...Array.from({length:7},(_,i)=>[`D${i+1}`,'DECOY',green])];
  return <AltFrame bg="#f6f4ed" color="#131313" accent={red} index="C2" label="Confusion grid">
    <div style={{position:'absolute',left:72,top:145,width:520}}><div style={{font:`700 12px ${mono}`,color:red}}>BENCHMARK / 11 SEEDED CASES</div><h1 style={{fontSize:72,lineHeight:.92,letterSpacing:-5,margin:'22px 0'}}>Find four.<br/>Accuse<br/>zero clean.</h1></div>
    <div style={{position:'absolute',left:700,top:155,width:1050,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>{cells.map((c,i)=>{const p=enter(frame,fps,12+i*9);return <div key={c[0]} style={{height:175,padding:'22px',background:c[2],color:'#fff',...rise(p,30)}}><span style={{font:`11px ${mono}`,opacity:.8}}>{c[1]}</span><b style={{fontSize:44,display:'block',marginTop:38}}>{c[0]}</b><span style={{font:`11px ${mono}`,display:'block',marginTop:12}}>{c[1]==='SCHEME'?'FOUND':'CLEARED'}</span></div>})}<div style={{height:175,padding:'22px',border:'2px solid #111',display:'grid',placeItems:'center',textAlign:'center',opacity:fade(frame,110)}}><div><b style={{fontSize:38}}>100%</b><span style={{display:'block',font:`11px ${mono}`,marginTop:10}}>SAMPLE PRECISION</span></div></div></div>
  </AltFrame>;
};

export const MethodRace = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const colors=['#7a65ff','#f45c4c','#ffcf35','#33bd86'];
  return <AltFrame bg="#111" color="#fff" accent="#ffcf35" index="C3" label="Kinetic method race">
    <div style={{position:'absolute',left:70,top:140}}><div style={{font:`12px ${mono}`,color:'#ffcf35'}}>DETECTOR COVERAGE</div><h1 style={{fontSize:68,lineHeight:.93,letterSpacing:-4,margin:'22px 0'}}>Different<br/>methods.<br/>Different hits.</h1></div>
    <div style={{position:'absolute',left:690,top:160,right:80}}>{detectors.map((d,i)=>{const p=enter(frame,fps,18+i*20);const width=d.count/4*100;return <div key={d.name} style={{marginBottom:30}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'end',marginBottom:11}}><div><b style={{fontSize:25}}>{d.name}</b><span style={{font:`11px ${mono}`,color:'#aaa',marginLeft:16}}>{d.detail}</span></div><b style={{fontSize:35,color:colors[i]}}>{d.count}/4</b></div><div style={{height:78,background:'#242424'}}><div style={{width:`${width*p}%`,height:'100%',background:colors[i],display:'flex',alignItems:'center',justifyContent:'flex-end',paddingRight:18}}>{Array.from({length:d.count}).map((_,j)=><span key={j} style={{width:25,height:25,marginLeft:7,borderRadius:'50%',background:'rgba(255,255,255,.85)',color:'#111',display:'grid',placeItems:'center',font:`700 9px ${mono}`}}>{j+1}</span>)}</div></div></div>})}</div>
  </AltFrame>;
};

export const ProofCollage = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const acid='#d7ff3f';
  const cards=[['MASTER DATA','MV-U05 → MV-U05','-4deg'],['PERMISSIONS','3 conflicting rights','3deg'],['LEDGER','€295,120 paid','-1deg'],['RECEIPTS','0 found','4deg']];
  return <AltFrame bg="#dfd9cc" color="#111" accent="#111" index="C4" label="Evidence collage">
    <div style={{position:'absolute',left:70,top:145}}><div style={{font:`700 12px ${mono}`}}>SOURCED VERDICT / F-01</div><h1 style={{font:`700 73px/.9 ${serif}`,letterSpacing:-4,margin:'22px 0'}}>Consensus<br/>is not<br/>the source.</h1></div>
    <div style={{position:'absolute',left:650,top:130,width:1100,height:740}}>{cards.map((c,i)=>{const p=enter(frame,fps,15+i*17);return <div key={c[0]} style={{position:'absolute',left:(i%2)*360+i*28,top:Math.floor(i/2)*230+i*18,width:430,height:210,padding:'28px',background:i===3?acid:'#fff',border:'2px solid #111',boxShadow:'10px 12px 0 rgba(0,0,0,.18)',transform:`rotate(${c[2]}) scale(${p})`}}><span style={{font:`11px ${mono}`}}>[{i+1}] · {c[0]}</span><b style={{fontSize:31,display:'block',marginTop:54}}>{c[1]}</b></div>})}<div style={{position:'absolute',left:210,right:40,bottom:10,padding:'25px 30px',background:'#111',color:'#fff',display:'flex',justifyContent:'space-between',alignItems:'center',...rise(enter(frame,fps,105),32)}}><div><span style={{font:`11px ${mono}`,color:acid}}>VERDICT</span><b style={{fontSize:28,display:'block',marginTop:6}}>Escalate vendor 209101</b></div><strong style={{fontSize:34,color:acid}}>€295,120</strong></div></div>
  </AltFrame>;
};
