"use client"

import dynamic from "next/dynamic"
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { ArrowDown, ArrowDownRight, ArrowUpRight, Cloud, MapPin, Terminal } from "lucide-react"
import content from "@/lib/content.json"
import { cn } from "@/lib/utils"
import { QuickLookButton } from "./journey"

const MacBookScene = dynamic(() => import("./macbook-scene"), { ssr: false })

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? null : this.props.children }
}

function StaticLaptop() {
  return <div className="static-laptop" aria-hidden="true"><div className="static-screen"><div className="screen-toolbar"><span>● ● ●</span><span>safrin / workspace</span><Terminal size={12} /></div><div className="screen-body"><Cloud size={32} strokeWidth={1.25} /><span>{content.hero.screenTitle}<br /><span className="screen-muted">{content.hero.screenSubtitle}</span></span><p>{content.hero.screenStatus}</p></div><div className="screen-terminal"><span>~</span> {content.hero.screenCommand}<span className="screen-cursor" /></div></div><div className="static-base"><div className="static-keyboard">{Array.from({ length: 60 }, (_, i) => <i key={i} />)}</div><div className="static-trackpad" /></div><div className="static-lip" /></div>
}

export function Hero() {
  const section = useRef<HTMLElement>(null)
  const [mode, setMode] = useState<"static" | "3d">("static")
  const [ready, setReady] = useState(false)
  const [progress, setProgress] = useState(0)
  const onReady = useCallback(() => setReady(true), [])
  const onFailure = useCallback(() => { setMode("static"); setReady(false) }, [])
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce), (max-width: 767px)")
    const check = () => {
      const connection = (navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number })
      const lowPower = connection.connection?.saveData || (connection.deviceMemory !== undefined && connection.deviceMemory < 4)
      if (query.matches || lowPower) { setMode("static"); return }
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("webgl2")
      setMode(context ? "3d" : "static")
      context?.getExtension("WEBGL_lose_context")?.loseContext()
    }
    check()
    query.addEventListener("change", check)
    return () => query.removeEventListener("change", check)
  }, [])
  useEffect(() => {
    if (mode !== "3d") { setProgress(0); return }
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!section.current) return
        const rect = section.current.getBoundingClientRect()
        setProgress(Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight))))
      })
    }
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    update()
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); cancelAnimationFrame(frame) }
  }, [mode])
  // Copy is fully gone by progress 0.12, just before the laptop starts its reveal at 0.1 — so the two never share the frame.
  const fade = Math.max(0, 1 - progress / 0.12)
  return (
    <section ref={section} id="home" className={cn("hero-sequence", mode === "3d" && "cinematic")} aria-label="Introduction">
      <div className="hero-sticky">
        <div className="page-width hero-copy" style={{ opacity: fade, visibility: fade === 0 ? "hidden" : "visible", transform: `translateY(${-progress * 80}px)` }}>
          <div className="hero-heading"><div className="eyebrow"><span className="small-cross">+</span>{content.hero.eyebrow}</div><h1>{content.name.split(" ")[0]}<span>{content.name.split(" ").slice(1).join(" ")}<span className="name-period">.</span></span></h1></div>
          <div className="hero-intro"><div className="availability"><span className="status-dot" />{content.availability}</div><h2>Aspiring Cloud Engineer<span>RAG & AI Systems</span></h2><p>{content.intro}</p><a href="#projects" className="text-link">Explore my work <ArrowDownRight size={18} /></a></div>
        </div>
        <div className="hero-visual" role="img" aria-label="A silver laptop displaying Safrin’s cloud engineering workspace. Scroll to enter the workspace.">
          <div className={cn("laptop-fallback", ready && mode === "3d" && "is-hidden")}><StaticLaptop /></div>
          {mode === "3d" && <SceneBoundary onFailure={onFailure}><MacBookScene progress={progress} onReady={onReady} /></SceneBoundary>}
        </div>
        <div className="page-width hero-annotations" style={{ opacity: fade }} aria-hidden={fade === 0}>
          <div className="annotation-left"><span className="annotation-line" /><span>IDEAS INTO SYSTEMS.<br />SYSTEMS INTO IMPACT.</span></div>
          <div className="annotation-right"><span className="font-mono">~/safrin/workspace</span><span>A little more than a portfolio.</span></div>
        </div>
        <div className="page-width hero-bottom" style={{ opacity: fade }} inert={fade === 0}>
          <span className="hero-location"><MapPin size={14} />{content.location}</span>
          <div className="hero-cues">
            <a href="#workspace" className="scroll-cue"><span className="scroll-icon"><ArrowDown size={14} /></span>SCROLL TO STEP INSIDE</a>
            <QuickLookButton />
          </div>
          <a href={content.linkedin} target="_blank" rel="noopener noreferrer" className="hero-linkedin">LinkedIn <ArrowUpRight size={15} /></a>
        </div>
        <div className="cinematic-blackout" style={{ opacity: Math.max(0, (progress - 0.79) / 0.21) }} />
      </div>
    </section>
  )
}
