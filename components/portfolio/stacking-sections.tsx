"use client"

import { useLayoutEffect, useRef, type ReactNode } from "react"
import { clamp, SECTION_STACKS, STACK_PACING, stackPose } from "@/lib/portfolio-motion"

export function StackingSections({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!root.current) return
    const container = root.current
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const items = Object.entries(SECTION_STACKS).flatMap(([id, rules]) => {
      const section = container.querySelector(`#${id}`)
      return rules.flatMap(rule => Array.from(section?.querySelectorAll<HTMLElement>(rule.selector) ?? []).map((element, index) => ({
        element, rule, index, start: 0, end: 1, last: -1,
        original: element.getAttribute("style"),
      })))
    })
    let frame = 0
    let needsMeasure = true
    const layoutTop = (element: HTMLElement) => {
      let top = 0
      let node: HTMLElement | null = element
      while (node) { top += node.offsetTop; node = node.offsetParent as HTMLElement | null }
      return top
    }
    const render = () => {
      frame = 0
      if (needsMeasure) {
        const height = window.innerHeight
        const maxScroll = document.documentElement.scrollHeight - height
        for (const item of items) {
          // offsetTop ignores our translations, so reversing never feeds animated bounds back into the timeline.
          const top = layoutTop(item.element)
          const delay = Math.min(STACK_PACING.maxDelay, (item.rule.order ?? 0) * 0.025 + item.index * (item.rule.stagger ?? STACK_PACING.stagger)) * height
          item.end = Math.max(1, Math.min(top - height * STACK_PACING.settleAt + delay, maxScroll))
          item.start = Math.max(0, Math.min(top - height * STACK_PACING.enterAt + delay, item.end - height * 0.2))
          item.last = -1
        }
        needsMeasure = false
      }
      for (const item of items) {
        const focused = item.element.contains(document.activeElement)
        const progress = focused ? 1 : clamp((window.scrollY - item.start) / Math.max(1, item.end - item.start))
        if (progress === item.last) continue
        item.last = progress
        const direction = item.rule.directions[item.index % item.rule.directions.length]
        const distance = window.innerWidth < 768 ? STACK_PACING.mobileDistance : item.rule.distance ?? STACK_PACING.distance
        const pose = stackPose(progress, direction, distance, item.rule.tilt, item.rule.scale, motion.matches)
        const style = item.element.style
        // Individual transform properties leave existing hover transforms intact.
        style.translate = `${pose.x}px ${pose.y}px`
        style.rotate = `${pose.rotate}deg`
        style.scale = String(pose.scale)
        style.opacity = String(pose.opacity)
        style.setProperty("--stack-progress", String(pose.progress))
        item.element.dataset.stackDirection = direction
        item.element.dataset.stackProgress = progress.toFixed(4)
        if (item.rule.powerOn) item.element.dataset.stackPower = "true"
      }
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render) }
    const measure = () => { needsMeasure = true; schedule() }
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", measure)
    container.addEventListener("load", measure, true)
    container.addEventListener("toggle", measure, true)
    container.addEventListener("focusin", measure)
    container.addEventListener("focusout", measure)
    motion.addEventListener("change", measure)
    render()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", measure)
      container.removeEventListener("load", measure, true)
      container.removeEventListener("toggle", measure, true)
      container.removeEventListener("focusin", measure)
      container.removeEventListener("focusout", measure)
      motion.removeEventListener("change", measure)
      for (const { element, original } of items) {
        if (original === null) element.removeAttribute("style")
        else element.setAttribute("style", original)
        delete element.dataset.stackDirection
        delete element.dataset.stackProgress
        delete element.dataset.stackPower
      }
    }
  }, [])
  return <div ref={root} className="page-width stacking-sections">{children}</div>
}
