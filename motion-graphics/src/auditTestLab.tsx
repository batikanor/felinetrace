import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Badge, Headline, Icon, Scene, SourceCard, Window} from './primitives';
import {C, mono} from './design';
import {clamp, draw, enter, fade, rise} from './animation';
import {coverage} from './data';

const steps = [
  ['INGEST', '35 files', 'file'],
  ['RECONCILE', '3 controls', 'link'],
  ['RUN TESTS', '4 rules', 'search'],
  ['COUNTERCHECK', '2 searches', 'shield'],
  ['CITE', '14 passages', 'check'],
] as const;

export const LabPipeline = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const line = draw(frame, 30, 112);
  return <Scene solution="Audit Test Lab" kicker="Solution 2-2">
    <div style={{position: 'absolute', left: 105, top: 190}}><Headline eyebrow="A DETERMINISTIC TEST METHOD" sub="From raw dossier to cited result." width={640}>Run the<br/><span style={{color: C.green}}>method.</span></Headline></div>
    <div style={{position: 'absolute', left: 730, right: 75, top: 265, height: 420}}><svg style={{position: 'absolute', left: 88, right: 88, top: 90, width: 'calc(100% - 176px)', height: 50}} viewBox="0 0 950 50"><path d="M0 25H950" stroke={C.plum} strokeWidth="3" strokeDasharray="8 8" strokeDashoffset={(1-line)*180}/></svg>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 15}}>{steps.map(([label,detail,icon],i) => {const p=enter(frame,fps,15+i*18); return <div key={label} style={{height: 220, padding: '27px 19px', borderRadius: 16, border: `1px solid ${C.line}`, background: '#fff', textAlign: 'center', boxShadow: '0 15px 35px rgba(23,39,31,.08)', ...rise(p,36)}}><div style={{width: 54, height: 54, margin: '0 auto', borderRadius: '50%', background: i===4?'#e7f2ea':C.plumSoft, color: i===4?C.green2:C.plum, display: 'grid', placeItems: 'center'}}><Icon name={icon} size={27}/></div><div style={{font: `700 11px ${mono}`, color: C.plum, marginTop: 22}}>{label}</div><b style={{display: 'block', fontSize: 20, marginTop: 9}}>{detail}</b></div>})}</div>
      <div style={{margin: '46px auto 0', width: 620, padding: '22px 26px', borderRadius: 14, background: C.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: fade(frame, 112)}}><span style={{fontSize: 19}}>Four sourced findings</span><Badge tone="green"><Icon name="shield" size={16}/> REVIEW READY</Badge></div>
    </div>
  </Scene>;
};

export const CoverageMatrix = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig();
  return <Scene solution="Audit Test Lab" kicker="Solution 2-2" dark>
    <div style={{position: 'absolute', left: 105, top: 185}}><Headline light eyebrow="COVERAGE BEFORE CONFIDENCE" sub="Inputs, rule, challenge, trace." width={650}>See every<br/><span style={{color: '#d9ccac'}}>test surface.</span></Headline></div>
    <div style={{position: 'absolute', left: 790, top: 145, width: 980}}><div style={{display: 'grid', gridTemplateColumns: '1.1fr 1.35fr 1.45fr 1.5fr .55fr', padding: '0 19px 14px', font: `10px ${mono}`, color: '#9fa8a2'}}><span>TEST</span><span>INPUTS</span><span>RULE</span><span>COUNTERCHECK</span><span>TRACE</span></div>
      <div style={{display: 'grid', gap: 12}}>{coverage.map((row,i) => {const p=enter(frame,fps,18+i*17); return <div key={row.name} style={{height: 115, display: 'grid', gridTemplateColumns: '1.1fr 1.35fr 1.45fr 1.5fr .55fr', alignItems: 'center', padding: '0 19px', border: '1px solid rgba(255,255,255,.14)', borderRadius: 13, background: 'rgba(255,255,255,.055)', ...rise(p,35)}}><b style={{fontSize: 17}}>{row.name}</b><span style={{fontSize: 13, color: '#b7beba'}}>{row.inputs}</span><span style={{fontSize: 13}}>{row.rule}</span><span style={{fontSize: 13, color: '#c8bbdb'}}>{row.counter}</span><b style={{font: `700 12px ${mono}`, color: '#c8bbdb'}}>{row.trace}</b></div>})}</div>
    </div>
  </Scene>;
};

export const Counterevidence = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const left=enter(frame,fps,20); const right=enter(frame,fps,55); const verdict=enter(frame,fps,100);
  return <Scene solution="Audit Test Lab" kicker="Solution 2-2">
    <div style={{position:'absolute',left:102,top:195}}><Headline eyebrow="CHALLENGE THE ALERT" sub="Suspicion is not enough." width={650}>Search for<br/><span style={{color:C.plum}}>the honest twin.</span></Headline></div>
    <div style={{position:'absolute',left:790,top:170,width:930,display:'grid',gridTemplateColumns:'1fr 1fr',gap:22}}>
      <div style={{padding:'30px',borderRadius:17,background:'#fff',border:`1px solid ${C.red}`,boxShadow:'0 18px 45px rgba(160,79,75,.1)',...rise(left,38)}}><div style={{display:'flex',justifyContent:'space-between'}}><Badge tone="red">F-01 · FLAG</Badge><b style={{font:`11px ${mono}`,color:C.muted}}>209101</b></div><h3 style={{fontSize:27,margin:'24px 0 20px'}}>Ratio Consulting</h3>{[['Creator / approver','MV-U05 / MV-U05'],['Conflicting rights','3'],['Goods receipts','0'],['Paid','€295,120']].map(x=><div key={x[0]} style={{display:'flex',justifyContent:'space-between',padding:'13px 0',borderTop:`1px solid ${C.line}`,fontSize:15}}><span style={{color:C.muted}}>{x[0]}</span><b>{x[1]}</b></div>)}</div>
      <div style={{padding:'30px',borderRadius:17,background:'#fff',border:`1px solid ${C.green2}`,boxShadow:'0 18px 45px rgba(47,114,83,.1)',...rise(right,38)}}><div style={{display:'flex',justifyContent:'space-between'}}><Badge tone="green">D3 · CLEAR</Badge><b style={{font:`11px ${mono}`,color:C.muted}}>209112</b></div><h3 style={{fontSize:27,margin:'24px 0 20px'}}>Vega Werkstoffe</h3>{[['Creator / approver','MV-U03 / MV-U02'],['Four-eyes','Yes'],['Goods receipts','4'],['Deliveries','Matched']].map(x=><div key={x[0]} style={{display:'flex',justifyContent:'space-between',padding:'13px 0',borderTop:`1px solid ${C.line}`,fontSize:15}}><span style={{color:C.muted}}>{x[0]}</span><b>{x[1]}</b></div>)}</div>
      <div style={{gridColumn:'1 / -1',display:'flex',justifyContent:'center',opacity:verdict}}><Badge tone="green"><Icon name="check" size={17}/> FLAG THE SCHEME · CLEAR THE DECOY</Badge></div>
    </div>
  </Scene>;
};

export const AddLinkedCase = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const dialog=enter(frame,fps,18); const sources=enter(frame,fps,58); const saved=enter(frame,fps,118);
  return <Scene solution="Audit Test Lab" kicker="Solution 2-2" dark>
    <div style={{position:'absolute',left:105,top:185}}><Headline light eyebrow="HUMAN REVIEW STAYS SOURCED" sub="Add judgment without losing provenance." width={650}>Add a case.<br/><span style={{color:'#d9ccac'}}>Link the proof.</span></Headline></div>
    <Window title="Review queue · Add case" style={{position:'absolute',left:790,top:140,width:950,height:760,opacity:dialog,transform:`translateY(${(1-dialog)*45}px)`}}>
      <div style={{padding:'32px 38px',color:C.ink}}><div style={{display:'grid',gridTemplateColumns:'1.4fr .8fr',gap:14}}><div><label style={{font:`10px ${mono}`,color:C.muted}}>TITLE</label><div style={{marginTop:8,padding:'14px 16px',border:`1px solid ${C.line}`,borderRadius:8,fontSize:17}}>Verify Ratio bank ownership</div></div><div><label style={{font:`10px ${mono}`,color:C.muted}}>CATEGORY</label><div style={{marginTop:8,padding:'14px 16px',border:`1px solid ${C.line}`,borderRadius:8,fontSize:17}}>Fraud risk</div></div></div>
        <div style={{font:`700 11px ${mono}`,color:C.plum,margin:'28px 0 12px'}}>LINK EVIDENCE · 3 SELECTED</div><div style={{display:'grid',gap:10,opacity:sources}}>{[
          ['[1]','Master data','MV-U05 → MV-U05'],['[2]','Permissions','3 conflicting rights'],['[3]','General ledger','€295,120 paid']
        ].map((x,i)=><div key={x[0]} style={{height:86,padding:'12px 15px',border:`1px solid ${C.plum}`,borderRadius:10,background:'#f7f3fb',display:'grid',gridTemplateColumns:'42px 1fr 30px',alignItems:'center'}}><b style={{font:`12px ${mono}`,color:C.plum}}>{x[0]}</b><div><b style={{fontSize:16}}>{x[1]}</b><span style={{display:'block',marginTop:6,font:`11px ${mono}`,color:C.muted}}>{x[2]}</span></div><div style={{width:25,height:25,borderRadius:'50%',background:C.plum,color:'#fff',display:'grid',placeItems:'center'}}><Icon name="check" size={15}/></div></div>)}</div>
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:24}}><div style={{padding:'12px 20px',borderRadius:8,background:C.green,color:'#fff',fontWeight:650,transform:`scale(${.94+.06*saved})`}}>Save linked case</div></div>
      </div>
    </Window>
    {saved>.8&&<div style={{position:'absolute',right:75,bottom:78,opacity:saved}}><Badge tone="green"><Icon name="check" size={17}/> CASE ADDED</Badge></div>}
  </Scene>;
};

export const PrecisionControls = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const score=interpolate(frame,[25,105],[0,3],clamp);
  return <Scene solution="Audit Test Lab" kicker="Solution 2-2">
    <div style={{position:'absolute',left:105,top:195}}><Headline eyebrow="FALSE-POSITIVE CONTROL" sub="Show what passed, not only what failed." width={650}>Precision<br/><span style={{color:C.green}}>is visible.</span></Headline></div>
    <div style={{position:'absolute',left:850,top:170,width:780}}><div style={{display:'flex',alignItems:'baseline',gap:17,marginBottom:28}}><span style={{fontSize:108,fontWeight:650,letterSpacing:-7,color:C.green}}>{Math.floor(score)}</span><span style={{fontSize:26,color:C.muted}}>controls cleared</span></div><div style={{display:'grid',gap:14}}>{[
      ['GDPdU export','8 / 8 hashes','Export protocol'],['Subledgers ↔ GL','€0 difference','Reconciliation'],['Invoices ↔ dispatches','2,040 / 2,040','Sales journal']
    ].map((x,i)=>{const p=enter(frame,fps,38+i*18);return <div key={x[0]} style={{height:116,padding:'20px 24px',display:'grid',gridTemplateColumns:'56px 1fr auto',alignItems:'center',gap:18,background:'#fff',border:`1px solid ${C.line}`,borderRadius:14,boxShadow:'0 10px 26px rgba(23,39,31,.06)',...rise(p,30)}}><div style={{width:48,height:48,borderRadius:'50%',background:'#e9f3ec',display:'grid',placeItems:'center',color:C.green2}}><Icon name="check"/></div><div><b style={{fontSize:20}}>{x[0]}</b><div style={{fontSize:15,color:C.muted,marginTop:7}}>{x[2]}</div></div><span style={{font:`700 12px ${mono}`,color:C.green2}}>{x[1]}</span></div>})}</div></div>
  </Scene>;
};
