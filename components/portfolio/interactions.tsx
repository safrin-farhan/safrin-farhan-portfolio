"use client"

import { useEffect } from "react"

// Desktop-only, motion-safe cursor-aware tilt/glow for [data-tilt] elements.
// Values are written as CSS custom properties so the styling stays in globals.css.
export function Interactions() {
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce), (max-width: 1024px), (pointer: coarse)")
    if (query.matches) return

    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-tilt]"))
    const cleanups = elements.map((el) => {
      let raf = 0
      const onMove = (event: PointerEvent) => {
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect()
          const px = (event.clientX - rect.left) / rect.width - 0.5
          const py = (event.clientY - rect.top) / rect.height - 0.5
          el.style.setProperty("--rx", `${(-py * 5).toFixed(2)}deg`)
          el.style.setProperty("--ry", `${(px * 5).toFixed(2)}deg`)
          el.style.setProperty("--gx", `${((px + 0.5) * 100).toFixed(1)}%`)
          el.style.setProperty("--gy", `${((py + 0.5) * 100).toFixed(1)}%`)
        })
      }
      const onLeave = () => {
        cancelAnimationFrame(raf)
        el.style.setProperty("--rx", "0deg")
        el.style.setProperty("--ry", "0deg")
      }
      el.addEventListener("pointermove", onMove)
      el.addEventListener("pointerleave", onLeave)
      return () => { cancelAnimationFrame(raf); el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave) }
    })
    return () => cleanups.forEach((fn) => fn())
  }, [])

  return null
}
