"use client"

import { useEffect, useState } from "react"
import { ArrowUpRight, Menu, X } from "lucide-react"
import content from "@/lib/content.json"
import { cn } from "@/lib/utils"

const links = [{ label: "About", id: "about" }, { label: "Skills", id: "skills" }, { label: "Certifications", id: "certifications" }, { label: "Projects", id: "projects" }]

export function Navigation() {
  const [dark, setDark] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState("")
  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const interior = document.getElementById("workspace")
        const hero = document.querySelector(".hero-sequence.cinematic")
        const heroRect = hero?.getBoundingClientRect()
        const enteringScreen = heroRect && -heroRect.top / (heroRect.height - window.innerHeight) > 0.78
        setDark(!!enteringScreen || (!!interior && interior.getBoundingClientRect().top < 180))
        if (interior && interior.getBoundingClientRect().top > window.innerHeight) setActive("")
      })
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id) })
    }, { rootMargin: "-15% 0px -65% 0px" })
    links.forEach(link => { const el = document.getElementById(link.id); if (el) observer.observe(el) })
    window.addEventListener("scroll", update, { passive: true })
    update()
    return () => { window.removeEventListener("scroll", update); cancelAnimationFrame(frame); observer.disconnect() }
  }, [])
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false) }
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [open])
  return (
    <header className={cn("site-header", dark && "dark")}>
      <nav className="page-width nav-inner" aria-label="Main navigation">
        <a href="#home" className="brand" aria-label="Safrin Farhan — home" onClick={() => setOpen(false)}>{content.initials}<span className="brand-slash">/</span><span className="brand-caption">ENGINEERING WITH INTENT</span></a>
        <div className="desktop-links">
          {links.map(link => <a key={link.id} href={`#${link.id}`} aria-current={active === link.id ? "location" : undefined}>{link.label}</a>)}
        </div>
        <a className="nav-contact" href="#contact">Let&apos;s talk <ArrowUpRight size={16} /></a>
        <button className="mobile-menu" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
      </nav>
      {open && <div id="mobile-navigation" className="mobile-links">{[...links, { label: "Experience", id: "experience" }, { label: "Contact", id: "contact" }].map(link => <a key={link.id} href={`#${link.id}`} onClick={() => setOpen(false)}>{link.label}<ArrowUpRight size={18} /></a>)}</div>}
    </header>
  )
}
