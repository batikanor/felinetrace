import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Badge, Headline, Icon, Scene, SourceCard} from './primitives';
import {C, mono} from './design';
import {clamp, draw, enter, fade, rise} from './animation';
import {detectorHits, detectors, findings} from './data';

const detectorIcons = ['search','link','arrow','shield'] as const;

export const FourDetectors = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const route=draw(frame,22,100);
  return <Scene solution="Benchmark Studio" kicker="Solution 2-5" dark>
    <div style={{position:'absolute',left:102,top:185}}><Headline light eyebrow="AN ENSEMBLE, NOT A BLACK BOX" sub="Four different ways to be suspicious." width={680}>Run four.<br/><span style={{color:'#d9ccac'}}>Agree once.</span></Headline></div>
    <div style={{position:'absolute',left:780,top:160,width:1010,height:650}}><div style={{font:`11px ${mono}`,color:'#c6b8dd',marginBottom:16}}>PARSE ONCE · RUN IN PARALLEL</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:17}}>{detectors.map((d,i)=>{const p=enter(frame,fps,15+i*15);return <div key={d.name} style={{height:180,padding:'26px',border:'1px solid rgba(255,255,255,.14)',borderRadius:16,background:'rgba(255,255,255,.055)',display:'grid',gridTemplateColumns:'56px 1fr auto',alignItems:'center',gap:18,...rise(p,36)}}><div style={{width:54,height:54,borderRadius:14,background:'rgba(199,185,221,.14)',color:'#cbbde1',display:'grid',placeItems:'center'}}><Icon name={detectorIcons[i]} size={28}/></div><div><b style={{fontSize:24}}>{d.name}</b><span style={{display:'block',fontSize:14,color:'#aeb6b1',marginTop:8}}>{d.detail}</span></div><b style={{fontSize:42,color:'#d9ccac'}}>{d.count}</b></div>})}</div>
      <svg style={{width:'100%',height:110}} viewBox="0 0 1010 110"><path d="M250 0C250 55 505 34 505 100M760 0C760 55 505 34 505 100" fill="none" stroke="#bdaed6" strokeWidth="2.5" strokeDasharray="8 8" strokeDashoffset={(1-route)*130}/></svg><div style={{width:520,margin:'-10px auto 0',padding:'23px 28px',borderRadius:14,background:'#fff',color:C.ink,display:'flex',justifyContent:'space-between',alignItems:'center',opacity:fade(frame,102)}}><b style={{fontSize:21}}>One sourced verdict</b><Badge tone="green"><Icon name="check" size={16}/> CONSENSUS</Badge></div>
    </div>
  </Scene>;
};

export const ConsensusMatrix = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  return <Scene solution="Benchmark Studio" kicker="Solution 2-5">
    <div style={{position:'absolute',left:102,top:190}}><Headline eyebrow="DISAGREEMENT IS USEFUL" sub="Every hit shows its method." width={660}>See who<br/><span style={{color:C.plum}}>found what.</span></Headline></div>
    <div style={{position:'absolute',left:760,top:150,width:1010}}><div style={{display:'grid',gridTemplateColumns:'1.7fr repeat(4,.65fr)',padding:'0 18px 14px',font:`10px ${mono}`,color:C.muted}}><span>CONSENSUS</span>{detectors.map(d=><b key={d.name}>{d.name.toUpperCase()}</b>)}</div><div style={{display:'grid',gap:12}}>{findings.map((finding,i)=>{const p=enter(frame,fps,18+i*16);const row=detectorHits[i];return <div key={finding.id} style={{height:115,display:'grid',gridTemplateColumns:'1.7fr repeat(4,.65fr)',alignItems:'center',padding:'0 18px',border:`1px solid ${C.line}`,borderRadius:13,background:'#fff',boxShadow:'0 12px 28px rgba(23,39,31,.06)',...rise(p,34)}}><div><span style={{font:`10px ${mono}`,color:C.plum}}>{finding.id} · {finding.category}</span><b style={{display:'block',fontSize:17,marginTop:7}}>{finding.title}</b></div>{row.hits.map((hit,j)=><div key={j} style={{display:'grid',placeItems:'center'}}><div style={{width:34,height:34,borderRadius:'50%',background:hit?'#e8f2eb':'#f1f1ee',color:hit?C.green2:'#aab0ac',display:'grid',placeItems:'center'}}>{hit?<Icon name="check" size={18}/>:<span>—</span>}</div></div>)}</div>})}</div></div>
  </Scene>;
};

export const BenchmarkScore = () => {
  const frame=useCurrentFrame(); const schemes=interpolate(frame,[20,85],[0,4],clamp); const decoys=interpolate(frame,[40,105],[7,0],clamp); const amounts=interpolate(frame,[60,125],[0,4],clamp);
  return <Scene solution="Benchmark Studio" kicker="Solution 2-5" dark>
    <div style={{position:'absolute',left:104,top:190}}><Headline light eyebrow="MEASURE THE WHOLE BEHAVIOR" sub="Detection without precision is not enough." width={680}>Recall.<br/><span style={{color:'#d9ccac'}}>Precision. Proof.</span></Headline></div>
    <div style={{position:'absolute',left:790,top:225,width:930,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18}}>{[
      [Math.floor(schemes),' / 4','schemes found',C.plum], [Math.floor(decoys),' / 7','decoys flagged',C.green2], [Math.floor(amounts),' / 4','amounts sourced',C.amber]
    ].map((x,i)=><div key={String(x[2])} style={{height:330,padding:'36px 28px',border:'1px solid rgba(255,255,255,.14)',borderRadius:18,background:'rgba(255,255,255,.055)',textAlign:'center'}}><div style={{width:70,height:6,borderRadius:10,background:x[3] as string,margin:'0 auto 48px'}}/><div style={{fontSize:92,fontWeight:650,letterSpacing:-6}}>{x[0]}<span style={{fontSize:35,color:'#aeb6b1',letterSpacing:-2}}>{x[1]}</span></div><div style={{font:`700 12px ${mono}`,color:'#c8cfca',marginTop:25,textTransform:'uppercase'}}>{x[2]}</div></div>)}</div>
    <div style={{position:'absolute',left:990,top:640,opacity:fade(frame,120)}}><Badge tone="green"><Icon name="shield" size={17}/> SAMPLE BENCHMARK PASSED</Badge></div>
  </Scene>;
};

export const DecoyPrecision = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  const decoys=['D1 · €480K machine','D2 · similar vendor names','D3 · new vendor','D4 · volume bonuses','D5 · group charge','D6 · asset disposal','D7 · invoice correction'];
  return <Scene solution="Benchmark Studio" kicker="Solution 2-5">
    <div style={{position:'absolute',left:102,top:190}}><Headline eyebrow="SUSPICIOUS IS NOT WRONG" sub="Seven traps. Seven clean outcomes." width={670}>Clear the<br/><span style={{color:C.green}}>decoys.</span></Headline></div>
    <div style={{position:'absolute',left:760,top:160,width:1010}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}><div><div style={{font:`11px ${mono}`,color:C.plum}}>SKEPTIC PASS</div><h2 style={{fontSize:34,margin:'9px 0 0'}}>Counterevidence found</h2></div><Badge tone="green">0 / 7 FLAGGED</Badge></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:13}}>{decoys.map((d,i)=>{const p=enter(frame,fps,20+i*12);return <div key={d} style={{height:100,padding:'0 20px',border:`1px solid ${C.line}`,borderRadius:12,background:'#fff',display:'grid',gridTemplateColumns:'45px 1fr auto',alignItems:'center',gap:12,boxShadow:'0 10px 24px rgba(23,39,31,.05)',...rise(p,28)}}><div style={{width:38,height:38,borderRadius:'50%',background:'#e8f2eb',color:C.green2,display:'grid',placeItems:'center'}}><Icon name="check" size={20}/></div><b style={{fontSize:15}}>{d}</b><span style={{font:`10px ${mono}`,color:C.green2}}>CLEAR</span></div>})}</div></div>
  </Scene>;
};

export const SourcedVerdict = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig(); const evidence=enter(frame,fps,62); const verdict=enter(frame,fps,108);
  return <Scene solution="Benchmark Studio" kicker="Solution 2-5" dark>
    <div style={{position:'absolute',left:104,top:190}}><Headline light eyebrow="CONSENSUS STILL NEEDS EVIDENCE" sub="The score never replaces the source." width={680}>Agree.<br/><span style={{color:'#d9ccac'}}>Then prove it.</span></Headline></div>
    <div style={{position:'absolute',left:800,top:170,width:870}}><div style={{padding:'28px 30px',border:'1px solid rgba(255,255,255,.15)',borderRadius:16,background:'rgba(255,255,255,.055)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><span style={{font:`11px ${mono}`,color:'#c8bade'}}>F-01 · FOUR DETECTORS</span><h2 style={{fontSize:29,margin:'10px 0 0'}}>Ratio payment chain</h2></div><div style={{display:'flex',gap:7}}>{detectors.map(d=><span key={d.name} style={{width:33,height:33,borderRadius:'50%',background:C.green2,display:'grid',placeItems:'center'}}><Icon name="check" color="#fff" size={17}/></span>)}</div></div></div>
      <div style={{height:58,marginLeft:80,borderLeft:'2px dashed #bcaed4',opacity:evidence}}/><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,...rise(evidence,30)}}><SourceCard active number="[1]" value="MV-U05 → MV-U05" file="Master data" location="row 8"/><SourceCard active number="[4]" value="0 receipts" file="Goods receipts" location="858 rows"/></div>
      <div style={{height:58,marginLeft:390,borderLeft:'2px dashed #bcaed4',opacity:verdict}}/><div style={{margin:'0 auto',width:610,padding:'25px 28px',borderRadius:15,background:'#fff',color:C.ink,display:'flex',justifyContent:'space-between',alignItems:'center',...rise(verdict,30)}}><div><span style={{font:`10px ${mono}`,color:C.plum}}>SOURCED VERDICT</span><b style={{display:'block',fontSize:23,marginTop:7}}>Escalate vendor 209101</b></div><Badge tone="red">€295,120</Badge></div>
    </div>
  </Scene>;
};
