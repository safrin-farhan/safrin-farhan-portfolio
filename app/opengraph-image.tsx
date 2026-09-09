import { ImageResponse } from 'next/og'
import content from '@/lib/content.json'

export const alt = 'Safrin Farhan — Aspiring Cloud Engineer · RAG & AI Systems'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', background: '#fafbfc', color: '#101114', padding: '60px 72px' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24 }}><span style={{ fontWeight: 700, fontSize: 40 }}>sf.</span><span style={{ color: '#3979ed', fontSize: 20, letterSpacing: 3 }}>CURIOSITY. CODE. CLOUD.</span></div><div style={{ display: 'flex', flexDirection: 'column' }}><div style={{ fontSize: 112, letterSpacing: -8, fontWeight: 700, display: 'flex' }}>{content.name}<span style={{ color: '#3979ed' }}>.</span></div><div style={{ display: 'flex', fontSize: 30, color: '#8c919b', marginTop: 20 }}>{content.positioning}</div></div><div style={{ display: 'flex', borderTop: '1px solid #d9dde3', paddingTop: 24, fontSize: 18, justifyContent: 'space-between' }}><span>{content.location}</span><span>Ideas into systems. Systems into impact.</span></div></div>, size)
}
