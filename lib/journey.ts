export const journeyConfig = {
  /** How long to hold at the bottom of the page before the loop-back plays. */
  loopPauseMs: 1600,
  /** Duration of the smooth return from the bottom to the hero's starting frame. */
  loopBackMs: 2200,
  /** Quick Look pacing — independent from manual scroll, in viewport-heights per second. */
  quickLookViewportsPerSecond: 0.55,
  /** Never let Quick Look finish the descent faster than this, even on short pages. */
  quickLookMinMs: 9000,
  /** Reduced motion: dwell time on each section before jumping to the next. */
  reducedStepMs: 1800,
  /** Reduced motion: duration of the fade veil that masks each jump. */
  reducedVeilMs: 350,
  sections: ["home", "workspace", "about", "skills", "certifications", "projects", "experience", "education", "resume", "contact"],
}

export type JourneyPhase = "idle" | "quick-look" | "pause" | "return"

type State = { phase: JourneyPhase; source: "manual" | "quick-look"; veil: boolean }

let state: State = { phase: "idle", source: "manual", veil: false }
const listeners = new Set<() => void>()
let frame = 0
let timer: ReturnType<typeof setTimeout> | undefined
let detachInput: (() => void) | undefined

const cancelEvents = ["wheel", "touchstart", "keydown", "pointerdown"] as const
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2

function emit(next: Partial<State>) {
  state = { ...state, ...next }
  listeners.forEach(listener => listener())
}

export function subscribeJourney(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export const getJourneyState = () => state
const serverState: State = { phase: "idle", source: "manual", veil: false }
export const getServerJourneyState = () => serverState

const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight
export const isAtBottom = () => window.scrollY >= maxScroll() - 2
export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

function lockScrollBehavior(lock: boolean) {
  document.documentElement.style.scrollBehavior = lock ? "auto" : ""
}

function animateScroll(to: number, duration: number, easing: (t: number) => number, done: () => void) {
  const from = window.scrollY
  if (duration <= 0 || from === to) { window.scrollTo(0, to); done(); return }
  const start = performance.now()
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration)
    window.scrollTo(0, from + (to - from) * easing(t))
    if (t < 1) frame = requestAnimationFrame(tick)
    else done()
  }
  frame = requestAnimationFrame(tick)
}

function watchForInterrupt() {
  detachInput?.()
  // The Quick Look / Stop toggle handles its own state; every other user input cancels playback.
  const cancel = (event: Event) => { if (!(event.target instanceof Element && event.target.closest("[data-journey-control]"))) stopJourney() }
  cancelEvents.forEach(event => window.addEventListener(event, cancel, { passive: true }))
  detachInput = () => cancelEvents.forEach(event => window.removeEventListener(event, cancel))
}

/** Stops any running playback and hands control back to the user immediately. */
export function stopJourney() {
  cancelAnimationFrame(frame)
  clearTimeout(timer)
  detachInput?.()
  detachInput = undefined
  lockScrollBehavior(false)
  emit({ phase: "idle", veil: false })
}

function returnToStart(reduced: boolean) {
  emit({ phase: "return" })
  const finish = () => { window.scrollTo(0, 0); stopJourney() }
  if (reduced) {
    emit({ veil: true })
    timer = setTimeout(() => { window.scrollTo(0, 0); emit({ veil: false }); timer = setTimeout(finish, journeyConfig.reducedVeilMs) }, journeyConfig.reducedVeilMs)
    return
  }
  animateScroll(0, journeyConfig.loopBackMs, easeInOutCubic, finish)
}

function holdThenReturn(reduced: boolean) {
  emit({ phase: "pause" })
  timer = setTimeout(() => returnToStart(reduced), journeyConfig.loopPauseMs)
}

/** Called by the bottom watcher when the user has manually scrolled to the very end. */
export function beginManualLoopBack() {
  const typing = document.activeElement instanceof HTMLElement && document.activeElement.matches("input, textarea, select, [contenteditable]")
  if (state.phase !== "idle" || typing || prefersReducedMotion()) return
  emit({ source: "manual" })
  lockScrollBehavior(true)
  watchForInterrupt()
  holdThenReturn(false)
}

function stepThroughSections(index: number) {
  const ids = journeyConfig.sections
  if (index >= ids.length) { holdThenReturn(true); return }
  const target = document.getElementById(ids[index])
  const top = index === ids.length - 1 ? maxScroll() : target ? target.getBoundingClientRect().top + window.scrollY : maxScroll()
  emit({ veil: true })
  timer = setTimeout(() => {
    window.scrollTo(0, Math.min(top, maxScroll()))
    emit({ veil: false })
    timer = setTimeout(() => stepThroughSections(index + 1), journeyConfig.reducedStepMs)
  }, journeyConfig.reducedVeilMs)
}

/** Plays the whole site once — descent, bottom pause, loop-back — then stops at the starting frame. */
export function startQuickLook() {
  if (state.phase !== "idle") { stopJourney(); return }
  const reduced = prefersReducedMotion()
  emit({ phase: "quick-look", source: "quick-look" })
  lockScrollBehavior(true)
  watchForInterrupt()
  if (reduced) { window.scrollTo(0, 0); stepThroughSections(1); return }
  const distance = maxScroll() - window.scrollY
  const duration = Math.max(journeyConfig.quickLookMinMs, (distance / window.innerHeight / journeyConfig.quickLookViewportsPerSecond) * 1000)
  animateScroll(maxScroll(), duration, easeInOutSine, () => holdThenReturn(false))
}
