import type {CSSProperties, ReactNode} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, enter, rise} from './animation';
import {mono, sans, serif} from './design';

type Theme = {bg: string; ink: string; accent: string; accent2: string; line: string; muted: string};

const themes = {
  graph: {bg: '#071b2b', ink: '#eaf7ff', accent: '#44d7ff', accent2: '#ffcb47', line: '#17445d', muted: '#8bb2c5'},
  skeptic: {bg: '#f0e9df', ink: '#17130f', accent: '#d94735', accent2: '#2448d8', line: '#c9bcae', muted: '#71665d'},
  public: {bg: '#edf5ee', ink: '#123326', accent: '#008e62', accent2: '#ff6a45', line: '#b9d4c6', muted: '#668176'},
  memory: {bg: '#160d28', ink: '#f7f0ff', accent: '#bdff4b', accent2: '#9d72ff', line: '#493564', muted: '#b5a3c8'},
  reviewer: {bg: '#f4f2ec', ink: '#111827', accent: '#2459ff', accent2: '#ff4c65', line: '#cfd3db', muted: '#687080'},
  router: {bg: '#101010', ink: '#ffffff', accent: '#ffdb38', accent2: '#51ddb4', line: '#3b3b3b', muted: '#aaa'},
} satisfies Record<string, Theme>;

const Canvas = ({theme, code, label, children, serifLogo = false}: {theme: Theme; code: string; label: string; children: ReactNode; serifLogo?: boolean}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: theme.bg, color: theme.ink, fontFamily: sans, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, opacity: .22, backgroundImage: `linear-gradient(${theme.line} 1px, transparent 1px), linear-gradient(90deg, ${theme.line} 1px, transparent 1px)`, backgroundSize: '80px 80px'}}/>
    <header style={{position: 'absolute', top: 46, left: 58, right: 58, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: interpolate(frame, [0, 14], [0, 1], clamp)}}>
      <div style={{display: 'flex', gap: 12, alignItems: 'center'}}><i style={{width: 30, height: 30, border: `2px solid ${theme.accent}`, borderRadius: '50%', display: 'grid', placeItems: 'center', font: `italic 700 19px ${serif}`}}>t</i><b style={{font: `${serifLogo ? '700 24px' : '700 22px'} ${serifLogo ? serif : sans}`}}>trace</b></div>
      <span style={{font: `12px ${mono}`, letterSpacing: 2, color: theme.muted}}>{code} · {label.toUpperCase()}</span>
    </header>
    {children}
  </AbsoluteFill>;
};

const Intro = ({theme, eyebrow, title, note, style}: {theme: Theme; eyebrow: string; title: ReactNode; note?: string; style?: CSSProperties}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = enter(frame, fps, 8);
  return <div style={{...rise(p, 42), ...style}}>
    <div style={{font: `700 13px ${mono}`, letterSpacing: 1.5, color: theme.accent, marginBottom: 20}}>{eyebrow}</div>
    <div style={{fontSize: 68, lineHeight: .96, letterSpacing: -3.8, fontWeight: 700}}>{title}</div>
    {note && <div style={{fontSize: 19, lineHeight: 1.45, color: theme.muted, marginTop: 22, maxWidth: 510}}>{note}</div>}
  </div>;
};

const Dot = ({x, y, label, sub, theme, delay = 0, danger = false}: {x: number; y: number; label: string; sub?: string; theme: Theme; delay?: number; danger?: boolean}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = enter(frame, fps, delay);
  return <div style={{position: 'absolute', left: x, top: y, width: 160, textAlign: 'center', transform: `translate(-50%,-50%) scale(${.7 + .3 * p})`, opacity: p}}>
    <div style={{margin: 'auto', width: danger ? 72 : 56, height: danger ? 72 : 56, borderRadius: '50%', border: `2px ${danger ? 'dashed' : 'solid'} ${danger ? theme.accent2 : theme.accent}`, background: danger ? theme.bg : `${theme.accent}22`, boxShadow: `0 0 40px ${theme.accent}28`}}/>
    <b style={{display: 'block', marginTop: 10, fontSize: 15}}>{label}</b>{sub && <small style={{font: `11px ${mono}`, color: theme.muted}}>{sub}</small>}
  </div>;
};

const Link = ({x1, y1, x2, y2, theme, dashed = false, delay = 0}: {x1: number; y1: number; x2: number; y2: number; theme: Theme; dashed?: boolean; delay?: number}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 26], [0, 1], clamp);
  const len = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  return <div style={{position: 'absolute', left: x1, top: y1, width: len * p, borderTop: `2px ${dashed ? 'dashed' : 'solid'} ${dashed ? theme.accent2 : theme.accent}`, transform: `rotate(${angle}deg)`, transformOrigin: '0 0', opacity: .8}}/>;
};

// Solution 2-3 · evidence graph / blueprint language
export const GraphPaymentChain = () => {
  const t = themes.graph;
  return <Canvas theme={t} code="S2-3 / A" label="Evidence blueprint"><Intro theme={t} eyebrow="CONNECTED PROOF" title={<>Follow the<br/>payment chain.</>} style={{position: 'absolute', left: 70, top: 175}}/>
    <div style={{position: 'absolute', left: 650, top: 160, width: 1180, height: 700}}>
      <Link x1={80} y1={250} x2={325} y2={250} theme={t} delay={22}/><Link x1={325} y1={250} x2={570} y2={250} theme={t} delay={34}/><Link x1={570} y1={250} x2={815} y2={250} theme={t} delay={46}/><Link x1={325} y1={250} x2={570} y2={480} theme={t} dashed delay={50}/>
      <Dot x={80} y={250} label="MV-U05" sub="3 rights" theme={t} delay={12}/><Dot x={325} y={250} label="Ratio" sub="209101" theme={t} delay={22}/><Dot x={570} y={250} label="5 invoices" sub="€248K + VAT" theme={t} delay={32}/><Dot x={815} y={250} label="€295,120" sub="paid" theme={t} delay={42}/><Dot x={570} y={480} label="0 receipts" sub="missing edge" theme={t} delay={54} danger/>
    </div>
  </Canvas>;
};

export const GraphMissingEdge = () => {
  const t = themes.graph;
  return <Canvas theme={t} code="S2-3 / B" label="Missing edge"><Intro theme={t} eyebrow="GRAPH TEST" title={<>The absent link<br/>is the signal.</>} note="Expected evidence stays visible as an explicit gap." style={{position: 'absolute', left: 70, top: 175}}/>
    <div style={{position: 'absolute', left: 800, top: 190, width: 920, height: 640, border: `1px solid ${t.line}`, background: '#061725', padding: 48}}>
      {[['VENDOR','Ratio Consulting'],['EXPECT','Service evidence'],['RESULT','0 linked receipts']].map(([k,v],i)=><div key={k} style={{height: 150, display: 'grid', gridTemplateColumns: '150px 1fr 70px', alignItems: 'center', borderBottom: `1px solid ${t.line}`}}><span style={{font: `12px ${mono}`, color: t.muted}}>{k}</span><b style={{fontSize: 28}}>{v}</b><span style={{fontSize: 40, color: i===2?t.accent2:t.accent}}>{i===2?'×':'→'}</span></div>)}
      <div style={{marginTop: 38, font: `13px ${mono}`, color: t.accent2}}>MISSING EDGE → REVIEW</div>
    </div>
  </Canvas>;
};

export const GraphCutoffJoin = () => {
  const t = themes.graph;
  return <Canvas theme={t} code="S2-3 / C" label="Exact join"><Intro theme={t} eyebrow="REFERENCE MATCH" title={<>Eight joins.<br/>One gap.</>} style={{position: 'absolute', left: 70, top: 190}}/>
    <div style={{position: 'absolute', left: 710, right: 100, top: 205}}>{['WE400840','WE400841','WE400842','WE400843','WE400844','WE400845','WE400846','WE400847'].map((id,i)=><div key={id} style={{display: 'grid', gridTemplateColumns: '160px 1fr 190px', alignItems: 'center', height: 76, opacity: interpolate(useCurrentFrame(), [i*5+12,i*5+28],[0,1],clamp)}}><span style={{font: `13px ${mono}`}}>{id}</span><i style={{height: 2, background: t.accent}}/><span style={{font: `13px ${mono}`, textAlign: 'right'}}>JAN INVOICE</span></div>)}</div>
    <div style={{position: 'absolute', right: 95, bottom: 75, font: `700 18px ${mono}`, color: t.accent2}}>2025 POSTING · 0 MATCHES</div>
  </Canvas>;
};

// Solution 2-4 · editorial / adversarial language
const EvidenceColumn = ({title, items, t, accent}: {title: string; items: string[]; t: Theme; accent: string}) => <div style={{background: '#fffaf3', color: t.ink, borderTop: `8px solid ${accent}`, padding: 30, minHeight: 410}}><div style={{font: `700 12px ${mono}`, color: accent, marginBottom: 24}}>{title}</div>{items.map((x,i)=><div key={x} style={{padding: '18px 0', borderBottom: `1px solid ${t.line}`, fontSize: 21, fontWeight: 650}}><span style={{font: `12px ${mono}`, marginRight: 14, color: t.muted}}>0{i+1}</span>{x}</div>)}</div>;

export const SkepticCrossExamination = () => {
  const t = themes.skeptic;
  return <Canvas theme={t} code="S2-4 / A" label="Cross-examination" serifLogo><Intro theme={t} eyebrow="DETECTOR × SKEPTIC" title={<>A claim must<br/>survive challenge.</>} style={{position: 'absolute', left: 70, top: 180}}/>
    <div style={{position: 'absolute', left: 715, right: 90, top: 205, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22}}><EvidenceColumn title="EVIDENCE FOR" items={['Same creator + approver','€295,120 paid','3 conflicting rights']} t={t} accent={t.accent}/><EvidenceColumn title="COUNTEREVIDENCE" items={['Contract not found','Receipt not found','Delivery not found']} t={t} accent={t.accent2}/></div>
  </Canvas>;
};

export const SkepticBalanceSheet = () => {
  const t = themes.skeptic;
  return <Canvas theme={t} code="S2-4 / B" label="Burden of proof" serifLogo><Intro theme={t} eyebrow="SKEPTIC PASS" title={<>Suspicious<br/>is not enough.</>} note="A clean comparator can overturn a weak signal." style={{position: 'absolute', left: 70, top: 180}}/>
    <div style={{position: 'absolute', left: 735, right: 100, top: 260}}><div style={{height: 14, background: t.ink, transform: 'rotate(3deg)'}}/><div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 150, marginTop: 60}}><div style={{background: '#fff', border: `3px solid ${t.accent}`, padding: 34}}><small style={{font: `12px ${mono}`, color:t.accent}}>FLAG</small><h2 style={{fontSize:34}}>Ratio</h2><p style={{font: `16px/1.7 ${mono}`}}>0 receipts<br/>same approver<br/>€295,120 paid</p></div><div style={{background: '#fff', border: `3px solid ${t.accent2}`, padding: 34}}><small style={{font: `12px ${mono}`, color:t.accent2}}>CLEAR</small><h2 style={{fontSize:34}}>Vega</h2><p style={{font: `16px/1.7 ${mono}`}}>4 receipts<br/>four-eyes<br/>delivery matched</p></div></div></div>
  </Canvas>;
};

export const SkepticVerdictStamp = () => {
  const t = themes.skeptic;
  const frame = useCurrentFrame();
  const stamp = interpolate(frame,[45,65],[1.8,1],clamp);
  return <Canvas theme={t} code="S2-4 / C" label="Review verdict" serifLogo><Intro theme={t} eyebrow="CLAIM → CHALLENGE → VERDICT" title={<>Keep only what<br/>the record supports.</>} style={{position: 'absolute', left: 70, top: 190}}/>
    <div style={{position:'absolute',left:810,top:200,width:820,height:570,background:'#fffaf3',border:`1px solid ${t.line}`,padding:55,transform:'rotate(-2deg)'}}><div style={{font:`12px ${mono}`,color:t.muted}}>CASE F-02 / CLASSIFICATION</div><div style={{marginTop:70,font:`700 48px ${serif}`}}>Six repair-like additions</div><div style={{marginTop:25,font:`24px ${mono}`}}>€150,800</div><div style={{position:'absolute',right:55,bottom:60,border:`8px double ${t.accent}`,padding:'18px 24px',font:`900 28px ${mono}`,color:t.accent,transform:`rotate(-8deg) scale(${stamp})`,opacity:interpolate(frame,[42,55],[0,1],clamp)}}>KEEP IN REVIEW</div></div>
  </Canvas>;
};

// Solution 2-6 · public-source / cartographic language
export const PublicAuthorityRouter = () => {
  const t = themes.public;
  const routes=[['REGISTER','T1'],['VIES','T1'],['SANCTIONS','T1'],['FILINGS','T1'],['OPEN WEB','T2–3']];
  return <Canvas theme={t} code="S2-6 / A" label="Authority router"><Intro theme={t} eyebrow="OFFICIAL SOURCES FIRST" title={<>Route the<br/>entity check.</>} style={{position:'absolute',left:70,top:180}}/>
    <div style={{position:'absolute',left:720,right:95,top:215}}>{routes.map(([x,tier],i)=><div key={x} style={{height:104,display:'grid',gridTemplateColumns:'90px 1fr 100px',alignItems:'center',borderBottom:`1px solid ${t.line}`,background:i<4?'#f8fff9':'#fff3ed',padding:'0 25px',marginBottom:10}}><span style={{width:42,height:42,borderRadius:'50%',background:t.accent,color:'white',display:'grid',placeItems:'center',font:`700 13px ${mono}`}}>0{i+1}</span><b style={{fontSize:25}}>{x}</b><span style={{font:`700 13px ${mono}`,color:i<4?t.accent:t.accent2}}>{tier}</span></div>)}</div>
  </Canvas>;
};

export const PublicSourceBoundary = () => {
  const t=themes.public;
  return <Canvas theme={t} code="S2-6 / B" label="Evidence boundary"><Intro theme={t} eyebrow="CORROBORATE ≠ PROVE" title={<>Outside context.<br/>Inside proof.</>} note="Public results can support identity—not the dossier claim." style={{position:'absolute',left:70,top:180}}/>
    <div style={{position:'absolute',left:750,top:205,width:950,height:620,borderRadius:'50%',border:`2px dashed ${t.accent}`,display:'grid',placeItems:'center'}}><div style={{width:510,height:330,background:'#fff',border:`3px solid ${t.ink}`,padding:38,boxShadow:'0 24px 60px #183f2c20'}}><small style={{font:`12px ${mono}`,color:t.accent}}>DOSSIER EVIDENCE</small><h2 style={{fontSize:38}}>Exact row or passage</h2><p style={{font:`17px/1.7 ${mono}`}}>vendor 209101<br/>permissions MV-U05<br/>ledger €295,120<br/>receipts 0</p></div><span style={{position:'absolute',top:42,left:90,font:`700 13px ${mono}`,color:t.muted}}>REGISTER</span><span style={{position:'absolute',top:85,right:100,font:`700 13px ${mono}`,color:t.muted}}>VIES</span><span style={{position:'absolute',bottom:62,right:130,font:`700 13px ${mono}`,color:t.muted}}>FILINGS</span></div>
  </Canvas>;
};

export const PublicReplayLedger = () => {
  const t=themes.public;
  const rows=[['REGISTER','REVIEW','0.92'],['VIES','REVIEW','0.90'],['SANCTIONS','NO SAMPLE HIT','0.96'],['OPEN WEB','BELOW GATE','0.54']];
  return <Canvas theme={t} code="S2-6 / C" label="Replay provenance"><Intro theme={t} eyebrow="REPLAY, NOT LIVE" title={<>Every result<br/>keeps its receipt.</>} style={{position:'absolute',left:70,top:180}}/>
    <div style={{position:'absolute',left:690,right:90,top:210,background:'#10392a',color:'#f2fff6',padding:35}}><div style={{display:'grid',gridTemplateColumns:'1.2fr 1fr 100px',font:`12px ${mono}`,color:'#8dc2a9',paddingBottom:18}}>ROUTER <span>STATUS</span><span>SCORE</span></div>{rows.map((r,i)=><div key={r[0]} style={{display:'grid',gridTemplateColumns:'1.2fr 1fr 100px',alignItems:'center',height:105,borderTop:'1px solid #2a5a46',font:`700 19px ${mono}`}}><span>{r[0]}</span><span style={{color:i===3?t.accent2:'#8ff1c2'}}>{r[1]}</span><span>{r[2]}</span></div>)}<div style={{marginTop:28,font:`12px ${mono}`,color:'#8dc2a9'}}>QUERY · AUTHORITY · URL · RETRIEVED AT</div></div>
  </Canvas>;
};

// Solution 2-7 · memory / neural language
export const MemoryPipeline = () => {
  const t=themes.memory; const steps=['DOSSIER','ROWS','MEMORY','RECALL','RESOLVE','REPORT'];
  return <Canvas theme={t} code="S2-7 / A" label="Provenance memory"><Intro theme={t} eyebrow="GRAPH + VECTOR RECALL" title={<>Remember links.<br/>Cite records.</>} style={{position:'absolute',left:70,top:180}}/>
    <div style={{position:'absolute',left:670,right:80,top:350,display:'flex',alignItems:'center'}}>{steps.map((s,i)=><div key={s} style={{display:'flex',alignItems:'center',flex:1}}><div style={{width:120,height:120,borderRadius:'50%',border:`2px solid ${i===4?t.accent:t.accent2}`,display:'grid',placeItems:'center',textAlign:'center',font:`700 13px ${mono}`,boxShadow:i===4?`0 0 50px ${t.accent}55`:'none'}}><span><small style={{display:'block',color:t.muted,marginBottom:8}}>0{i+1}</small>{s}</span></div>{i<steps.length-1&&<i style={{height:2,flex:1,background:t.line}}/>}</div>)}</div>
    <div style={{position:'absolute',left:970,bottom:145,font:`12px ${mono}`,color:t.accent}}>CHUNK → DOCUMENT → EXACT ROW</div>
  </Canvas>;
};

export const MemoryRecallGraph = () => {
  const t=themes.memory;
  return <Canvas theme={t} code="S2-7 / B" label="Scoped recall"><Intro theme={t} eyebrow="DOSSIER-SCOPED QUERY" title={<>Recall the path,<br/>not a paragraph.</>} style={{position:'absolute',left:70,top:180}}/>
    <div style={{position:'absolute',left:700,top:170,width:1050,height:700}}><Link x1={110} y1={280} x2={340} y2={160} theme={t}/><Link x1={340} y1={160} x2={600} y2={290} theme={t}/><Link x1={600} y1={290} x2={860} y2={175} theme={t}/><Link x1={600} y1={290} x2={600} y2={520} theme={t} dashed/><Dot x={110} y={280} label="MV-U05" sub="user" theme={t}/><Dot x={340} y={160} label="Ratio" sub="vendor" theme={t}/><Dot x={600} y={290} label="€295,120" sub="payment" theme={t}/><Dot x={860} y={175} label="F-01" sub="claim" theme={t}/><Dot x={600} y={520} label="0 receipts" sub="gap" theme={t} danger/></div>
  </Canvas>;
};

export const MemoryProvenanceRepair = () => {
  const t=themes.memory;
  return <Canvas theme={t} code="S2-7 / C" label="Provenance repair"><Intro theme={t} eyebrow="MEMORY IS CONTEXT" title={<>Resolve before<br/>you cite.</>} style={{position:'absolute',left:70,top:180}}/>
    <div style={{position:'absolute',left:720,right:90,top:220}}>{[['chunk:f01:04','memory context',false],['Document','Sachkontobuchungen.txt',false],['Exact anchor','rows 442–446',true],['Citation','[3]',true]].map(([a,b,ok],i)=><div key={String(a)} style={{display:'grid',gridTemplateColumns:'170px 1fr 70px',alignItems:'center',height:120,borderBottom:`1px solid ${t.line}`,background:i===2?'#2b1744':'transparent',padding:'0 30px'}}><span style={{font:`12px ${mono}`,color:t.muted}}>0{i+1} · {a}</span><b style={{fontSize:27}}>{b}</b><span style={{fontSize:26,color:ok?t.accent:t.accent2}}>{ok?'✓':'→'}</span></div>)}</div>
  </Canvas>;
};

// Solution 2-8 · local reviewer / structured patch language
export const ReviewerReadOnlyRun = () => {
  const t=themes.reviewer;
  return <Canvas theme={t} code="S2-8 / A" label="Local sidecar"><Intro theme={t} eyebrow="READ-ONLY REVIEW" title={<>Let the reviewer<br/>challenge the draft.</>} style={{position:'absolute',left:70,top:180}}/>
    <div style={{position:'absolute',left:720,right:90,top:190,background:'#101827',color:'#dbe7ff',borderRadius:14,padding:38,boxShadow:'0 28px 70px #1d284738'}}><div style={{font:`12px ${mono}`,color:'#7f9bc8',marginBottom:22}}>TASK T-01 · CHALLENGE AMOUNT</div>{['manifest sealed','read-only sandbox','2 searches inspected','output schema valid'].map((x,i)=><div key={x} style={{height:90,borderTop:'1px solid #283653',display:'grid',gridTemplateColumns:'80px 1fr 90px',alignItems:'center',font:`18px ${mono}`}}><span style={{color:'#6d7e9d'}}>0{i+1}</span><span>{x}</span><span style={{color:'#54e1ad'}}>PASS</span></div>)}<div style={{marginTop:30,font:`700 22px ${mono}`,color:'#54e1ad'}}>€192,000 · SUPPORTED</div></div>
  </Canvas>;
};

export const ReviewerPatchDiff = () => {
  const t=themes.reviewer;
  return <Canvas theme={t} code="S2-8 / B" label="Patch preview"><Intro theme={t} eyebrow="PROPOSE, DON'T OVERWRITE" title={<>The human owns<br/>the final sentence.</>} style={{position:'absolute',left:70,top:180}}/>
    <div style={{position:'absolute',left:740,right:90,top:205,background:'#fff',border:`1px solid ${t.line}`,padding:40}}><div style={{font:`12px ${mono}`,color:t.muted}}>REPORT.SECTION[3]</div><div style={{marginTop:30,padding:24,background:'#fff0f2',color:'#832237',font:`20px/1.55 ${mono}`}}>- December costs may be misstated.</div><div style={{marginTop:12,padding:24,background:'#eafbf3',color:'#146a4b',font:`20px/1.55 ${mono}`}}>+ Eight December receipts tie to eight January invoices: €192,000.</div><div style={{display:'flex',gap:14,marginTop:36,justifyContent:'flex-end'}}><span style={{padding:'15px 28px',border:`2px solid ${t.accent2}`,font:`700 13px ${mono}`,color:t.accent2}}>REJECT</span><span style={{padding:'15px 28px',background:t.accent,color:'white',font:`700 13px ${mono}`}}>ACCEPT PATCH</span></div></div>
  </Canvas>;
};

export const ReviewerApprovalGate = () => {
  const t=themes.reviewer;
  return <Canvas theme={t} code="S2-8 / C" label="Approval gate"><Intro theme={t} eyebrow="STRUCTURED OUTPUT" title={<>No silent edits.<br/>No loose claims.</>} style={{position:'absolute',left:70,top:180}}/>
    <div style={{position:'absolute',left:750,top:195,width:900,background:'#111827',color:'#e7edff',padding:45,font:`18px/1.75 ${mono}`}}><span style={{color:'#8092b8'}}>{'{'}</span><br/>　<span style={{color:'#83d7ff'}}>"task_id"</span>: "T-01",<br/>　<span style={{color:'#83d7ff'}}>"verdict"</span>: "supported",<br/>　<span style={{color:'#83d7ff'}}>"amount_eur"</span>: <span style={{color:'#ffd36a'}}>192000</span>,<br/>　<span style={{color:'#83d7ff'}}>"source_ids"</span>: [<span style={{color:'#8eecb9'}}>"..."</span>],<br/>　<span style={{color:'#83d7ff'}}>"approval"</span>: <b style={{color:'#ff8094'}}>"required"</b><br/><span style={{color:'#8092b8'}}>{'}'}</span></div>
  </Canvas>;
};

// Solution 2-9 · adaptive router / transit language
const lanes=[['RULES','ALWAYS'],['PEERS','ALWAYS'],['MEMORY','LINKED'],['PUBLIC','ENTITY'],['REVIEWER','GATED']];
export const RouterTransitMap = () => {
  const t=themes.router;
  return <Canvas theme={t} code="S2-9 / A" label="Adaptive transit"><Intro theme={t} eyebrow="COST-AWARE ESCALATION" title={<>Use only the<br/>methods needed.</>} style={{position:'absolute',left:70,top:180}}/>
    <div style={{position:'absolute',left:730,right:90,top:205}}>{lanes.map((l,i)=><div key={l[0]} style={{display:'grid',gridTemplateColumns:'90px 1fr 120px',alignItems:'center',height:112}}><span style={{width:44,height:44,borderRadius:'50%',background:i<2?t.accent:t.accent2,color:'#111',display:'grid',placeItems:'center',font:`700 13px ${mono}`}}>{i+1}</span><div style={{borderTop:`7px solid ${i<2?t.accent:t.accent2}`,fontSize:24,fontWeight:700,paddingTop:12}}>{l[0]}</div><span style={{font:`12px ${mono}`,color:t.muted,textAlign:'right'}}>{l[1]}</span></div>)}</div>
  </Canvas>;
};

export const RouterStopRule = () => {
  const t=themes.router;
  return <Canvas theme={t} code="S2-9 / B" label="Stop rule"><Intro theme={t} eyebrow="PRECISION PROFILE" title={<>Two signals,<br/>then report.</>} note="Single-signal anomalies stay held." style={{position:'absolute',left:70,top:180}}/>
    <div style={{position:'absolute',left:760,top:230,width:930}}>{[['RULES','HIT'],['PEER BASELINE','HIT'],['MEMORY','ROUTED'],['PUBLIC','SKIP'],['LOCAL REVIEWER','SKIP']].map((x,i)=><div key={x[0]} style={{height:94,display:'grid',gridTemplateColumns:'1fr 220px',alignItems:'center',borderBottom:`1px solid ${t.line}`}}><b style={{fontSize:23}}>{x[0]}</b><span style={{font:`700 13px ${mono}`,color:i<2?t.accent:t.muted,textAlign:'right'}}>{x[1]}</span></div>)}<div style={{marginTop:35,background:t.accent,color:'#111',padding:'20px 28px',font:`900 20px ${mono}`}}>DECISION · REPORT</div></div>
  </Canvas>;
};

export const RouterFindingRoutes = () => {
  const t=themes.router;
  const routes=[['F-01',[1,1,1,1,1],'REPORT'],['F-02',[1,1,1,0,1],'REPORT'],['F-03',[1,1,1,0,1],'REPORT'],['F-04',[1,1,1,0,0],'REPORT'],['LEAD',[0,1,0,0,0],'HOLD']];
  return <Canvas theme={t} code="S2-9 / C" label="Route matrix"><Intro theme={t} eyebrow="ROUTE TRACE" title={<>Different cases.<br/>Different depth.</>} style={{position:'absolute',left:70,top:180}}/>
    <div style={{position:'absolute',left:710,right:90,top:220}}><div style={{display:'grid',gridTemplateColumns:'130px repeat(5,100px) 1fr',font:`11px ${mono}`,color:t.muted,marginBottom:20}}><span>CASE</span>{lanes.map(l=><span key={l[0]}>{l[0]}</span>)}<span style={{textAlign:'right'}}>DECISION</span></div>{routes.map(r=><div key={r[0] as string} style={{display:'grid',gridTemplateColumns:'130px repeat(5,100px) 1fr',height:92,alignItems:'center',borderTop:`1px solid ${t.line}`}}><b style={{font:`700 18px ${mono}`}}>{r[0] as string}</b>{(r[1] as number[]).map((hit,i)=><i key={i} style={{width:28,height:28,borderRadius:'50%',background:hit?t.accent2:'#292929'}}/>)}<b style={{textAlign:'right',font:`900 18px ${mono}`,color:r[2]==='HOLD'?'#ff746c':t.accent}}>{r[2] as string}</b></div>)}</div>
  </Canvas>;
};
