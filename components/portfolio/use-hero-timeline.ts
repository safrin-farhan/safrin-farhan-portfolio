"use client"

import { useEffect, useState, type RefObject } from "react"
import { clamp, ease, HERO_CYCLE, HERO_LOOP, HERO_START, heroLoopOffset } from "@/lib/portfolio-motion"

export function useHeroTimeline(section: RefObject<HTMLElement | null>, enabled: boolean) {
  const [state, setState] = useState({ progress: HERO_START.progress, offset: 0 })
  useEffect(() => {
    if (!enabled) { setState({ progress: HERO_START.progress, offset: 0 }); return }
    let frame = 0
    let previous = 0
    let elapsed = 0
    let raw = 0
    let progress = HERO_START.progress
    let offset = 0
    let handoff: { from: number; elapsed: number } | null = null
    const measure = () => {
      if (!section.current) return
      const rect = section.current.getBoundingClientRect()
      raw = clamp(-rect.top / Math.max(1, rect.height - window.innerHeight))
      if (!frame && !document.hidden) { previous = 0; frame = requestAnimationFrame(tick) }
    }
    const tick = (now: number) => {
      frame = 0
      const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0
      previous = now
      if (raw > 0 || progress > 0) {
        if (offset > 0 && !handoff) handoff = { from: offset, elapsed: 0 }
        if (handoff) {
          // Finish the rise before the camera/text begin scrolling; never replace a moving pose with REST in one frame.
          handoff.elapsed += dt
          offset = handoff.from * (1 - ease(handoff.elapsed / HERO_LOOP.handoffDuration))
          if (handoff.elapsed >= HERO_LOOP.handoffDuration) { offset = 0; handoff = null }
        } else {
          progress += (raw - progress) * (1 - Math.exp(-HERO_LOOP.scrollDamping * dt))
          if (Math.abs(raw - progress) < 0.00001) progress = raw
        }
        elapsed = 0
      } else {
        elapsed = (elapsed + dt) % HERO_CYCLE
        offset = heroLoopOffset(elapsed)
      }
      setState(current => current.progress === progress && current.offset === offset ? current : { progress, offset })
      if (!document.hidden && (raw === 0 || progress !== raw || offset > 0)) frame = requestAnimationFrame(tick)
    }
    const visibility = () => {
      cancelAnimationFrame(frame)
      frame = 0
      previous = 0
      if (!document.hidden) measure()
    }
    window.addEventListener("scroll", measure, { passive: true })
    window.addEventListener("resize", measure)
    document.addEventListener("visibilitychange", visibility)
    measure()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", measure)
      window.removeEventListener("resize", measure)
      document.removeEventListener("visibilitychange", visibility)
    }
  }, [enabled, section])
  return state
}
