"use client"

import { useEffect, useRef, useState } from "react"
import content from "@/lib/content.json"
import { StaticLaptop } from "./hero"

type Phase = "idle" | "white" | "build" | "out"

const AUTO_SCROLL_SPEED = 0.9 // px per ms — attract-mode cinematic pace
const BOTTOM_PAUSE = 2200 // hold at the bottom before looping back
const WHITE_MS = 470 // dark workspace → white hero
const BUILD_MS = 780 // MacBook rises + text slides in
const OUT_MS = 520 // overlay lifts to reveal the live hero

export function LoopController() {
  const [phase, setPhase] = useState<Phase>("idle")
  const busy = useRef(false)
  const autoOk = useRef(false)
  const rafId = useRef(0)
  const lastTs = useRef(0)
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const seqTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const blockAutoplay = window.matchMedia(
      "(prefers-reduced-motion: reduce), (max-width: 767px), (pointer: coarse)",
    )

    const setScrollAuto = (on: boolean) => {
      document.documentElement.style.scrollBehavior = on ? "auto" : ""
    }
    const atBottom = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4

    const stopAutoScroll = () => {
      cancelAnimationFrame(rafId.current)
      rafId.current = 0
      lastTs.current = 0
      setScrollAuto(false)
    }
    const startAutoScroll = () => {
      if (!autoOk.current || busy.current) return
      cancelAnimationFrame(rafId.current)
      lastTs.current = 0
      setScrollAuto(true)
      const step = (ts: number) => {
        if (busy.current) return
        if (!lastTs.current) lastTs.current = ts
        const dt = ts - lastTs.current
        lastTs.current = ts
        if (atBottom()) {
          stopAutoScroll()
          return
        }
        window.scrollBy(0, dt * AUTO_SCROLL_SPEED)
        rafId.current = requestAnimationFrame(step)
      }
      rafId.current = requestAnimationFrame(step)
    }

    const clearPause = () => {
      if (pauseTimer.current) {
        clearTimeout(pauseTimer.current)
        pauseTimer.current = null
      }
    }
    const isTyping = () => {
      const el = document.activeElement
      return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")
    }

    const runLoopBack = () => {
      if (busy.current) return
      busy.current = true
      stopAutoScroll()
      clearPause()
      setScrollAuto(true)
      setPhase("white")
      const push = (fn: () => void, delay: number) =>
        seqTimers.current.push(setTimeout(fn, delay))
      push(() => {
        window.scrollTo(0, 0)
        setPhase("build")
      }, WHITE_MS)
      push(() => setPhase("out"), WHITE_MS + BUILD_MS)
      push(() => {
        setPhase("idle")
        setScrollAuto(false)
        busy.current = false
        startAutoScroll()
      }, WHITE_MS + BUILD_MS + OUT_MS)
    }

    const schedulePause = () => {
      if (busy.current || pauseTimer.current) return
      pauseTimer.current = setTimeout(() => {
        pauseTimer.current = null
        if (isTyping()) {
          schedulePause() // wait until the visitor is done typing
          return
        }
        runLoopBack()
      }, BOTTOM_PAUSE)
    }

    const onScroll = () => {
      if (busy.current) return
      if (atBottom()) schedulePause()
      else clearPause()
    }
    const onUserInput = () => {
      if (busy.current) return
      stopAutoScroll()
    }

    const evaluate = () => {
      autoOk.current = !blockAutoplay.matches
      if (autoOk.current) startAutoScroll()
      else stopAutoScroll()
    }

    const kickoff = setTimeout(evaluate, 700) // let the 3D hero settle first
    blockAutoplay.addEventListener("change", evaluate)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("wheel", onUserInput, { passive: true })
    window.addEventListener("touchstart", onUserInput, { passive: true })
    window.addEventListener("pointerdown", onUserInput, { passive: true })
    window.addEventListener("keydown", onUserInput)

    return () => {
      clearTimeout(kickoff)
      clearPause()
      seqTimers.current.forEach(clearTimeout)
      seqTimers.current = []
      stopAutoScroll()
      blockAutoplay.removeEventListener("change", evaluate)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("wheel", onUserInput)
      window.removeEventListener("touchstart", onUserInput)
      window.removeEventListener("pointerdown", onUserInput)
      window.removeEventListener("keydown", onUserInput)
    }
  }, [])

  const [first, ...rest] = content.name.split(" ")
  return (
    <div className="loop-overlay" data-phase={phase} aria-hidden="true">
      <div className="loop-laptop">
        <StaticLaptop />
      </div>
      <div className="page-width loop-copy">
        <h1 className="loop-name">
          {first}
          <span>
            {rest.join(" ")}
            <span className="name-period">.</span>
          </span>
        </h1>
        <div className="loop-role">
          <span className="status-dot" />
          Aspiring Cloud Engineer
        </div>
      </div>
    </div>
  )
}
