import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Badge, Headline, Icon, Scene, SourceCard, Window} from './primitives';
import {C, mono, serif} from './design';
import {clamp, draw, enter, fade, rise} from './animation';
import {findings, ratioSources, splitPayments} from './data';

const Citation = ({n, active = false}: {n: number; active?: boolean}) => <span style={{display: 'inline-grid', placeItems: 'center', verticalAlign: 'super', margin: '0 3px', width: 28, height: 24, borderRadius: 6, background: active ? C.plum : C.plumSoft, color: active ? '#fff' : C.plum, font: `700 12px ${mono}`, boxShadow: active ? '0 5px 12px rgba(91,70,130,.25)' : 'none'}}>[{n}]</span>;

export const InlineCitations = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const paper = enter(frame, fps, 18); const active = frame > 82;
  return <Scene solution="Cited memo" kicker="Solution 2 · 2-3 · 2-4">
    <div style={{position: 'absolute', left: 105, top: 200}}><Headline eyebrow="PROOF, IN THE SENTENCE" sub="Four passages. One reviewable claim." width={650}>Evidence<br/><span style={{color: C.plum}}>in line.</span></Headline></div>
    <Window style={{position: 'absolute', left: 790, top: 140, width: 940, height: 750, opacity: paper, transform: `translateY(${(1-paper)*55}px)`}}>
      <div style={{padding: '58px 72px'}}><div style={{font: `700 11px ${mono}`, color: C.plum}}>FRAUD RISK · F-01</div><h2 style={{fontSize: 40, letterSpacing: -1.8, margin: '15px 0 8px'}}>Ratio Consulting payment chain</h2><div style={{fontSize: 14, color: C.muted, paddingBottom: 22, borderBottom: `1px solid ${C.line}`}}>Muster Verpackungen · FY 2025</div>
        <p style={{font: `21px/1.72 ${serif}`, marginTop: 34, color: '#334038'}}>MV-U05 created and approved vendor 209101<Citation n={1}/> and held all three conflicting rights<Citation n={2}/>. The same user paid <b>€295,120</b><Citation n={3}/> while the dossier contains <b>zero receipts</b><Citation n={4} active={active}/>.</p>
        <div style={{marginTop: 28, padding: '22px 24px', borderRadius: 12, background: '#f5f2f9', borderLeft: `4px solid ${C.plum}`}}><div style={{font: `10px ${mono}`, color: C.plum}}>PAYMENT CHAIN</div><div style={{fontSize: 29, fontWeight: 650, marginTop: 9}}>€248,000 fees + €47,120 VAT</div></div>
        <div style={{display: 'flex', gap: 10, marginTop: 24}}><Badge tone="red">CRITICAL</Badge><Badge>4 SOURCES</Badge></div>
      </div>
    </Window>
    {active && <div style={{position: 'absolute', right: 52, top: 575, width: 450, opacity: fade(frame, 84)}}><SourceCard active number="[4]" value="0 receipts" file="Wareneingangsliste_2025.csv" location="858 rows · vendor 209101"/></div>}
  </Scene>;
};

export const SourceLadder = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig();
  return <Scene solution="Cited memo" kicker="Solution 2 · 2-3 · 2-4" dark>
    <div style={{position: 'absolute', left: 105, top: 190}}><Headline light eyebrow="A COMPLETE SOURCE CHAIN" sub="Control, permission, payment, absence." width={665}>One finding.<br/><span style={{color: '#d9ccac'}}>Four proofs.</span></Headline></div>
    <div style={{position: 'absolute', left: 850, top: 150, width: 790}}><div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22}}><div><div style={{font: `11px ${mono}`, color: '#c5b7dc'}}>SOURCES · F-01</div><h2 style={{fontSize: 37, margin: '10px 0 0'}}>Ratio evidence register</h2></div><Badge tone="green"><Icon name="shield" size={17}/> 4 VERIFIED</Badge></div>
      <div style={{display: 'grid', gap: 12}}>{ratioSources.map((x, i) => {const p = enter(frame, fps, 18+i*13); return <div key={x.number} style={{height: 106, padding: '14px 18px', display: 'grid', gridTemplateColumns: '54px 1fr 295px 22px', alignItems: 'center', gap: 14, border: '1px solid rgba(255,255,255,.13)', borderRadius: 13, background: 'rgba(255,255,255,.055)', ...rise(p, 34)}}><span style={{font: `700 13px ${mono}`, color: '#c5b7dc'}}>{x.number}</span><b style={{fontSize: 20}}>{x.value}</b><div><b style={{display: 'block', fontSize: 13}}>{x.file}</b><span style={{font: `10px ${mono}`, color: '#9fa8a2', marginTop: 6, display: 'block'}}>{x.location}</span></div><Icon name="arrow" color="#a99abc" size={19}/></div>})}</div>
    </div>
  </Scene>;
};

export const ExactAnchor = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const passage = enter(frame, fps, 48); const lineP = draw(frame, 26, 72);
  return <Scene solution="Cited memo" kicker="Solution 2 · 2-3 · 2-4">
    <div style={{position: 'absolute', left: 108, top: 205}}><Headline eyebrow="FROM CLAIM TO RECORD" sub="Not merely the file. Row eight." width={650}>Open the<br/><span style={{color: C.green}}>proof.</span></Headline></div>
    <div style={{position: 'absolute', left: 760, top: 165, width: 1020, height: 680}}>
      <div style={{position: 'absolute', left: 0, top: 75, width: 430, padding: '32px 34px', background: '#fff', border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: '0 18px 42px rgba(23,39,31,.09)'}}><div style={{font: `11px ${mono}`, color: C.red}}>CLAIM · F-01</div><div style={{fontSize: 27, fontWeight: 650, lineHeight: 1.25, marginTop: 15}}>One user controlled the full vendor chain.</div><div style={{marginTop: 23}}><Badge>[1] MASTER DATA</Badge></div></div>
      <svg style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} viewBox="0 0 1020 680"><path d="M430 192 C540 192 520 290 635 290" fill="none" stroke={C.plum} strokeWidth="3" strokeDasharray="9 8" strokeDashoffset={(1-lineP)*140}/><circle cx="635" cy="290" r="7" fill={C.plum} opacity={lineP}/></svg>
      <div style={{position: 'absolute', right: 0, top: 0, width: 570, height: 630, background: '#e9ebe7', borderRadius: 16, padding: 28, boxShadow: '0 24px 60px rgba(23,39,31,.15)', ...rise(passage, 45)}}><div style={{height: '100%', background: '#fff', padding: '42px 42px', boxShadow: '0 7px 18px rgba(23,39,31,.1)'}}><div style={{font: `10px ${mono}`, color: C.muted, display: 'flex', justifyContent: 'space-between'}}><span>STAMMDATENÄNDERUNGEN</span><span>ROW 8</span></div><h3 style={{fontSize: 25, margin: '36px 0 24px'}}>Vendor 209101</h3><div style={{display: 'grid', gridTemplateColumns: '150px 1fr', rowGap: 13, fontSize: 15}}><span style={{color: C.muted}}>Entity</span><b>Ratio Consulting GmbH</b><span style={{color: C.muted}}>Created</span><b>12.05.2025</b><span style={{color: C.muted}}>Changed by</span><b>MV-U05</b><span style={{color: C.muted}}>Approved by</span><b>MV-U05</b></div><div style={{marginTop: 28, padding: '18px 20px', background: C.amberSoft, borderLeft: `4px solid ${C.amber}`}}><div style={{font: `10px ${mono}`, color: '#817019'}}>MATCHED PASSAGE</div><div style={{fontSize: 27, fontWeight: 650, marginTop: 9}}>Creator = approver</div></div><div style={{marginTop: 23, font: `11px ${mono}`, color: C.green2}}>EXACT ROW · HASH VERIFIED</div></div></div>
    </div>
  </Scene>;
};

export const ProfitBridge = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const p1 = enter(frame, fps, 32); const p2 = enter(frame, fps, 58); const p3 = enter(frame, fps, 88);
  return <Scene solution="Cited memo" kicker="Solution 2 · 2-3 · 2-4" dark>
    <div style={{position: 'absolute', left: 105, top: 190}}><Headline light eyebrow="THE FINANCIAL EFFECT" sub="Two schemes. One clear bridge." width={640}>From reported<br/><span style={{color: '#d9ccac'}}>to supportable.</span></Headline></div>
    <div style={{position: 'absolute', left: 800, top: 190, width: 900}}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 90px 1fr 90px 1fr', alignItems: 'center'}}>
        <div style={{padding: '32px', border: '1px solid rgba(255,255,255,.14)', borderRadius: 16, background: 'rgba(255,255,255,.06)'}}><div style={{font: `11px ${mono}`, color: '#b8c0bb'}}>REPORTED PROFIT</div><div style={{fontSize: 56, fontWeight: 650, marginTop: 10}}>€2.60m</div></div><div style={{textAlign: 'center', fontSize: 28, color: '#c7b9dd', opacity: p1}}>−</div>
        <div style={{padding: '32px', border: '1px solid rgba(255,255,255,.14)', borderRadius: 16, background: 'rgba(255,255,255,.06)', ...rise(p1, 30)}}><div style={{font: `11px ${mono}`, color: '#c7b9dd'}}>F-02 · REPAIRS</div><div style={{fontSize: 45, fontWeight: 650, marginTop: 10}}>€150.8K</div></div><div style={{textAlign: 'center', fontSize: 28, color: '#c7b9dd', opacity: p2}}>−</div>
        <div style={{padding: '32px', border: '1px solid rgba(255,255,255,.14)', borderRadius: 16, background: 'rgba(255,255,255,.06)', ...rise(p2, 30)}}><div style={{font: `11px ${mono}`, color: '#c7b9dd'}}>F-03 · CUT-OFF</div><div style={{fontSize: 45, fontWeight: 650, marginTop: 10}}>€192K</div></div>
      </div>
      <div style={{height: 84, marginLeft: 50, borderLeft: '2px dashed rgba(199,185,221,.6)', opacity: p3}}/>
      <div style={{marginLeft: 50, width: 760, padding: '30px 34px', borderRadius: 17, background: '#fff', color: C.ink, boxShadow: '0 20px 55px rgba(0,0,0,.25)', ...rise(p3, 38)}}><div style={{font: `11px ${mono}`, color: C.green2}}>ADJUSTED PROFIT · APPROX.</div><div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8}}><b style={{fontSize: 72, letterSpacing: -4}}>€2.26m</b><Badge tone="red">€342.8K OVERSTATED</Badge></div></div>
    </div>
  </Scene>;
};

export const SplitThreshold = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const threshold = draw(frame, 25, 70);
  return <Scene solution="Cited memo" kicker="Solution 2 · 2-3 · 2-4">
    <div style={{position: 'absolute', left: 105, top: 200}}><Headline eyebrow="PATTERNS BEAT SINGLE ENTRIES" sub="Same payee. Same day. Same reference." width={650}>Just below.<br/><span style={{color: C.red}}>Four times.</span></Headline></div>
    <div style={{position: 'absolute', left: 830, top: 180, width: 780, height: 610}}><div style={{position: 'absolute', left: 0, right: 0, top: 85, borderTop: `3px dashed ${C.red}`, opacity: threshold}}><span style={{position: 'absolute', right: 0, top: -28, font: `11px ${mono}`, color: C.red}}>€10,000 · SECOND APPROVAL</span></div>
      <div style={{display: 'flex', gap: 26, alignItems: 'end', height: 440, paddingTop: 120}}>{splitPayments.map((value, i) => {const p = enter(frame, fps, 45+i*13); const h = value/10000*295; return <div key={value} style={{width: 150, textAlign: 'center'}}><div style={{font: `700 12px ${mono}`, marginBottom: 10, color: C.red, opacity: p}}>€{value.toLocaleString('en-US')}</div><div style={{height: h*p, borderRadius: '12px 12px 3px 3px', background: i%2 ? C.plum : C.green, boxShadow: '0 14px 28px rgba(23,39,31,.11)'}}/><div style={{font: `10px ${mono}`, color: C.muted, marginTop: 12}}>14 OCT</div></div>})}</div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, padding: '23px 26px', borderRadius: 14, background: '#fff', border: `1px solid ${C.line}`, boxShadow: '0 14px 34px rgba(23,39,31,.08)', opacity: fade(frame, 100)}}><div><div style={{font: `10px ${mono}`, color: C.plum}}>SAMMEL-200007 · MV-U11</div><b style={{fontSize: 27, display: 'block', marginTop: 7}}>€39,040 total</b></div><Badge tone="red">CONTROL BREACH</Badge></div>
    </div>
  </Scene>;
};
