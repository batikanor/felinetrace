import type {CSSProperties, ReactNode} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, mono, sans, shadow} from './design';
import {clamp, enter, rise} from './animation';

export const Icon = ({name, size = 28, color = 'currentColor', strokeWidth = 1.8}: {name: 'file' | 'sheet' | 'link' | 'check' | 'search' | 'comment' | 'arrow' | 'shield'; size?: number; color?: string; strokeWidth?: number}) => {
  const paths: Record<string, ReactNode> = {
    file: <><path d="M7 2.5h7l4 4V21.5H7z"/><path d="M14 2.5v4h4M10 11h5M10 15h5"/></>,
    sheet: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M10 9v12M4 15h16"/></>,
    link: <><path d="M9.4 14.6l5.2-5.2"/><path d="M7.2 16.8l-1.4 1.4a3 3 0 004.2 4.2l3.7-3.7a3 3 0 000-4.2" transform="translate(0 -2)"/><path d="M16.8 7.2l1.4-1.4A3 3 0 0020 1.5a3 3 0 00-2.1.9l-3.7 3.7a3 3 0 000 4.2" transform="translate(0 2)"/></>,
    check: <path d="M5 12.5l4.2 4.2L19 7"/>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="M16 16l5 5"/></>,
    comment: <><path d="M4 4.5h16v12H9l-5 4z"/><path d="M8 9h8M8 12.5h5"/></>,
    arrow: <><path d="M4 12h15M14 7l5 5-5 5"/></>,
    shield: <><path d="M12 2.5l8 3v5.8c0 5.1-3.2 8.5-8 10.2-4.8-1.7-8-5.1-8-10.2V5.5z"/><path d="M8.5 12l2.4 2.4 4.8-5"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
};

export const Scene = ({children, solution, kicker, dark = false}: {children: ReactNode; solution: string; kicker: string; dark?: boolean}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: dark ? C.ink : C.cream, color: dark ? C.paper : C.ink, fontFamily: sans, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, backgroundImage: dark
      ? 'radial-gradient(circle at 17% 10%, rgba(115,95,161,.22), transparent 35%), radial-gradient(circle at 85% 90%, rgba(47,114,83,.2), transparent 38%)'
      : 'radial-gradient(circle at 12% 5%, rgba(255,255,255,.9), transparent 38%), radial-gradient(circle at 90% 90%, rgba(115,95,161,.08), transparent 38%)'}} />
    <div style={{position: 'absolute', left: 70, right: 70, top: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: interpolate(frame, [0, 12], [0, 1], clamp)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 15}}>
        <div style={{width: 36, height: 36, border: `2px solid ${dark ? '#d9ccac' : C.green}`, borderRadius: '50%', display: 'grid', placeItems: 'center', font: `italic 700 23px ${serif}`, color: dark ? '#d9ccac' : C.green}}>t</div>
        <div style={{fontSize: 25, fontWeight: 650, letterSpacing: -0.7}}>trace</div>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, color: dark ? '#c4c8c5' : C.muted, fontSize: 16}}>
        <span style={{fontFamily: mono, fontSize: 13, letterSpacing: 1.2}}>{solution.toUpperCase()}</span>
        <span style={{width: 5, height: 5, borderRadius: 9, background: C.plum}} />
        <span>{kicker}</span>
      </div>
    </div>
    {children}
    <div style={{position: 'absolute', left: 70, bottom: 44, display: 'flex', alignItems: 'center', gap: 11, color: dark ? '#98a19b' : C.muted, font: `12px ${mono}`, letterSpacing: 1.1}}>
      <span style={{width: 24, height: 1, background: dark ? '#67716a' : '#afb6b0'}} /> NO NUMBER WITHOUT A SOURCE
    </div>
  </AbsoluteFill>;
};

export const Headline = ({eyebrow, children, sub, width = 720, delay = 8, light = false}: {eyebrow: string; children: ReactNode; sub?: string; width?: number; delay?: number; light?: boolean}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = enter(frame, fps, delay);
  return <div style={{width, ...rise(p, 55)}}>
    <div style={{font: `700 14px ${mono}`, color: light ? '#c7b9e2' : C.plum, letterSpacing: 1.8, marginBottom: 20}}>{eyebrow}</div>
    <div style={{fontSize: 76, lineHeight: 0.98, letterSpacing: -4.1, fontWeight: 620}}>{children}</div>
    {sub && <div style={{fontSize: 22, lineHeight: 1.45, color: light ? '#b9c1bc' : C.muted, marginTop: 24, maxWidth: 620}}>{sub}</div>}
  </div>;
};

export const Window = ({children, title = 'Muster Verpackungen · FY 2025', style}: {children: ReactNode; title?: string; style?: CSSProperties}) =>
  <div style={{color: C.ink, background: C.paper, border: `1px solid ${C.line}`, borderRadius: 18, boxShadow: shadow, overflow: 'hidden', ...style}}>
    <div style={{height: 58, padding: '0 20px', display: 'flex', alignItems: 'center', borderBottom: `1px solid ${C.line}`, background: '#fff'}}>
      <div style={{display: 'flex', gap: 7, marginRight: 22}}><i style={{width: 10, height: 10, borderRadius: 10, background: '#e7c1ad'}}/><i style={{width: 10, height: 10, borderRadius: 10, background: '#e4d482'}}/><i style={{width: 10, height: 10, borderRadius: 10, background: '#91c2a4'}}/></div>
      <div style={{fontSize: 13, fontWeight: 650}}>{title}</div>
      <div style={{marginLeft: 'auto', font: `11px ${mono}`, color: C.green2}}>● LIVE</div>
    </div>
    {children}
  </div>;

export const FileChip = ({name, detail, type = 'file', active = false, delay = 0}: {name: string; detail: string; type?: 'file' | 'sheet'; active?: boolean; delay?: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = enter(frame, fps, delay);
  return <div style={{minWidth: 222, height: 88, border: `1px solid ${active ? '#ad9bc9' : C.line}`, background: active ? '#f6f2fb' : '#fff', borderRadius: 10, padding: 12, display: 'flex', alignItems: 'center', gap: 12, boxShadow: active ? '0 8px 20px rgba(115,95,161,.11)' : 'none', ...rise(p, 22)}}>
    <div style={{width: 48, height: 56, borderRadius: 7, background: type === 'sheet' ? '#e8f1eb' : '#f2eee5', color: type === 'sheet' ? C.green2 : '#78634d', display: 'grid', placeItems: 'center'}}><Icon name={type} size={25}/></div>
    <div><b style={{display: 'block', fontSize: 14, marginBottom: 7}}>{name}</b><span style={{display: 'block', font: `11px ${mono}`, color: C.muted}}>{detail}</span></div>
  </div>;
};

export const Badge = ({children, tone = 'plum'}: {children: ReactNode; tone?: 'plum' | 'green' | 'red' | 'amber'}) => {
  const color = tone === 'green' ? C.green2 : tone === 'red' ? C.red : tone === 'amber' ? '#816c18' : C.plum;
  const bg = tone === 'green' ? '#eaf3ed' : tone === 'red' ? C.redSoft : tone === 'amber' ? C.amberSoft : C.plumSoft;
  return <span style={{display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 12px', borderRadius: 999, background: bg, color, font: `700 12px ${mono}`, letterSpacing: .5}}>{children}</span>;
};

export const SourceCard = ({number, value, file, location, active = false, delay = 0}: {number?: string; value: string; file: string; location: string; active?: boolean; delay?: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = enter(frame, fps, delay);
  return <div style={{height: 92, padding: '14px 16px', color: C.ink, background: active ? '#f7f3fb' : '#fff', border: `1px solid ${active ? '#a998c5' : C.line}`, borderRadius: 11, display: 'grid', gridTemplateColumns: number ? '34px 1fr' : '1fr', alignItems: 'center', boxShadow: active ? '0 10px 24px rgba(82,62,115,.11)' : 'none', ...rise(p, 24)}}>
    {number && <div style={{font: `700 13px ${mono}`, color: C.plum}}>{number}</div>}
    <div><b style={{fontSize: 18, letterSpacing: -.3}}>{value}</b><div style={{marginTop: 7, font: `11px ${mono}`, color: C.muted}}>{file} · {location}</div></div>
  </div>;
};

const {serif} = {serif: 'Georgia, "Times New Roman", serif'};
