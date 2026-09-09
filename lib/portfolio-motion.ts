export type LaptopPose = { scale: number; position: [number, number, number]; rotation: [number, number, number]; lid: number }

export const HERO_START = {
  laptop: { scale: 0.62, position: [0, -2.55, 0], rotation: [0, -0.13, -0.03], lid: -0.05 } as LaptopPose,
  camera: { position: [0, 3.45, 9.1] as [number, number, number], target: [0, 0.2, 0] as [number, number, number] },
  text: { y: 0, opacity: 1 },
  background: "var(--paper)",
  blackout: 0,
  progress: 0,
}

export const HERO_ENTRANCE: LaptopPose = { scale: 0.52, position: [0, -6.4, 0.6], rotation: [0.06, -0.24, -0.05], lid: -0.14 }
export const HERO_LOOP = { restDuration: 1, resetDuration: 1.1, loopPauseDuration: 0.8, riseDuration: 1.5, handoffDuration: 0.4, scrollDamping: 16 }
export const HERO_CYCLE = HERO_LOOP.restDuration + HERO_LOOP.resetDuration + HERO_LOOP.loopPauseDuration + HERO_LOOP.riseDuration
export const clamp = (value: number) => Math.max(0, Math.min(1, value))
export const ease = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t) }
export const mix = (a: number, b: number, t: number) => a + (b - a) * t

// Zero is always the complete pre-scroll frame, never the below-screen entrance.
export function heroLoopOffset(seconds: number) {
  const t = ((seconds % HERO_CYCLE) + HERO_CYCLE) % HERO_CYCLE
  if (t <= HERO_LOOP.restDuration) return 0
  const descentEnd = HERO_LOOP.restDuration + HERO_LOOP.resetDuration
  if (t < descentEnd) return ease((t - HERO_LOOP.restDuration) / HERO_LOOP.resetDuration)
  const riseStart = descentEnd + HERO_LOOP.loopPauseDuration
  if (t <= riseStart) return 1
  return 1 - ease((t - riseStart) / HERO_LOOP.riseDuration)
}

export function heroPose(offset: number): LaptopPose {
  if (offset === 0) return HERO_START.laptop
  const a = HERO_START.laptop
  const b = HERO_ENTRANCE
  return {
    scale: mix(a.scale, b.scale, offset),
    position: a.position.map((v, i) => mix(v, b.position[i], offset)) as LaptopPose["position"],
    rotation: a.rotation.map((v, i) => mix(v, b.rotation[i], offset)) as LaptopPose["rotation"],
    lid: mix(a.lid, b.lid, offset),
  }
}

type Direction = "left" | "right" | "top" | "bottom"
type StackRule = { selector: string; directions: Direction[]; order?: number; stagger?: number; distance?: number; tilt?: number; scale?: number; powerOn?: boolean }
export const STACK_PACING = { enterAt: 0.96, settleAt: 0.62, distance: 90, mobileDistance: 36, stagger: 0.018, maxDelay: 0.12 }
const heading: StackRule = { selector: ".section-heading > *", directions: ["top", "top", "left"], distance: 52, stagger: 0.025 }

export const SECTION_STACKS: Record<string, StackRule[]> = {
  about: [heading, { selector: ".about-location", directions: ["bottom"] }, { selector: ".about-copy > *", directions: ["left", "right", "bottom", "left"], stagger: 0.03 }],
  skills: [heading, { selector: ".skill-group-heading, .skill-group > p", directions: ["left", "top", "right", "top"] }, { selector: ".skill-items li", directions: ["right", "bottom", "left", "bottom"], tilt: 3, scale: 0.94, powerOn: true }],
  certifications: [heading, { selector: ".certification", directions: ["left", "right"], order: 1, tilt: 2, scale: 0.96 }, { selector: ".earlier-certifications", directions: ["bottom"] }],
  projects: [heading, { selector: ".project-copy > *", directions: ["top", "left", "left", "right", "bottom", "bottom"], distance: 64 }, { selector: ".project-visual", directions: ["right"], scale: 0.96 }, { selector: ".project-details", directions: ["bottom"] }],
  experience: [heading, { selector: ".experience > *", directions: ["right", "left", "bottom"], stagger: 0.025 }],
  education: [{ selector: ".education-label", directions: ["top"] }, { selector: ".education-content > *", directions: ["left", "right", "bottom"] }, { selector: ".education-grade", directions: ["right"], tilt: 2 }],
  resume: [{ selector: ".resume-icon", directions: ["left"], tilt: -4 }, { selector: ".resume-copy > *", directions: ["top", "left", "bottom"] }, { selector: ".resume-action", directions: ["right"], order: 2 }],
  contact: [heading, { selector: ".contact-linkedin, .contact-availability", directions: ["left", "bottom"] }, { selector: ".contact-form [data-slot='field'], .contact-form button, .contact-delivery-note", directions: ["right", "left", "bottom", "right"], stagger: 0.025 }],
}

export function stackPose(progress: number, direction: Direction, distance: number, tilt = 0, scale = 1, reduced = false) {
  const p = ease(progress)
  const remaining = 1 - p
  const sign = direction === "left" || direction === "top" ? -1 : 1
  return {
    x: reduced || direction === "top" || direction === "bottom" ? 0 : sign * distance * remaining,
    y: reduced || direction === "left" || direction === "right" ? 0 : sign * distance * remaining,
    rotate: reduced ? 0 : sign * tilt * remaining,
    scale: reduced ? 1 : mix(scale, 1, p),
    opacity: reduced ? mix(0.25, 1, p) : mix(0.15, 1, p),
    progress: reduced ? 1 : p,
  }
}
