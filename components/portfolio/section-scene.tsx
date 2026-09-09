"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { RoundedBox } from "@react-three/drei"
import { useEffect, useMemo, useRef, useState, type RefObject } from "react"
import * as THREE from "three"

const palette = { silver: "#d9dde3", gray: "#8c919b", blue: "#3979ed" }
const COLOR = { blue: palette.blue, silver: palette.silver, gray: palette.gray }

type Variant = "field" | "card" | "lines"
type FormGeo = "ico" | "octa" | "dodeca" | "torus"
type FormSpec = { geo: FormGeo; size: number; pos: [number, number, number]; speed: number }
type SceneConfig = {
  variant: Variant
  accent: keyof typeof COLOR
  count?: number
  spread?: [number, number, number]
  opacity?: number
  forms?: FormSpec[]
}

// Config-driven per section — same visual language, tuned arrangement per section.
const SCENE_CONFIG: Record<string, SceneConfig> = {
  about: { variant: "field", accent: "blue", count: 340, spread: [9, 6, 4], opacity: 0.5, forms: [ { geo: "ico", size: 1.7, pos: [3.2, 0.4, -1], speed: 0.12 }, { geo: "octa", size: 0.9, pos: [-3.6, -0.8, 0], speed: -0.18 } ] },
  skills: { variant: "field", accent: "silver", count: 260, spread: [10, 5, 4], opacity: 0.42, forms: [ { geo: "dodeca", size: 1.3, pos: [-3.8, 0.6, -1], speed: 0.14 } ] },
  certifications: { variant: "field", accent: "blue", count: 220, spread: [10, 6, 4], opacity: 0.44, forms: [ { geo: "octa", size: 1.5, pos: [3.6, 0.2, -1], speed: 0.16 }, { geo: "octa", size: 0.8, pos: [-3.4, 1, -0.5], speed: -0.2 } ] },
  projects: { variant: "field", accent: "silver", count: 300, spread: [11, 6, 5], opacity: 0.36, forms: [ { geo: "torus", size: 1.3, pos: [3.9, -0.4, -1], speed: 0.1 } ] },
  experience: { variant: "lines", accent: "blue", count: 26, spread: [9, 5, 3], opacity: 0.4 },
  education: { variant: "field", accent: "gray", count: 180, spread: [9, 4, 3], opacity: 0.4, forms: [ { geo: "ico", size: 1.1, pos: [3.4, 0, -0.5], speed: 0.15 } ] },
  resume: { variant: "card", accent: "silver", opacity: 0.5 },
  contact: { variant: "lines", accent: "blue", count: 30, spread: [10, 6, 4], opacity: 0.46 },
}

type SceneItem = { id: string; el: HTMLElement; config: SceneConfig }
type Pointer = RefObject<{ x: number; y: number }>

const clamp = THREE.MathUtils.clamp
const lerp = THREE.MathUtils.lerp

function buildPoints(count: number, spread: [number, number, number]) {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread[0]
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread[1]
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread[2]
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  return geometry
}

function buildForm(geo: FormGeo, size: number) {
  if (geo === "ico") return new THREE.IcosahedronGeometry(size, 0)
  if (geo === "octa") return new THREE.OctahedronGeometry(size, 0)
  if (geo === "dodeca") return new THREE.DodecahedronGeometry(size, 0)
  return new THREE.TorusGeometry(size, size * 0.32, 8, 22)
}

function buildNetwork(count: number, spread: [number, number, number]) {
  const nodes: THREE.Vector3[] = []
  for (let i = 0; i < count; i++) nodes.push(new THREE.Vector3((Math.random() - 0.5) * spread[0], (Math.random() - 0.5) * spread[1], (Math.random() - 0.5) * spread[2]))
  const segments: number[] = []
  for (let i = 0; i < count; i++) for (let j = i + 1; j < count; j++) if (nodes[i].distanceTo(nodes[j]) < 2.5) segments.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z)
  const lines = new THREE.BufferGeometry()
  lines.setAttribute("position", new THREE.Float32BufferAttribute(segments, 3))
  const points = new THREE.BufferGeometry()
  points.setAttribute("position", new THREE.Float32BufferAttribute(nodes.flatMap((n) => [n.x, n.y, n.z]), 3))
  return { lines, points }
}

function Motif({ item, pointer }: { item: SceneItem; pointer: Pointer }) {
  const cfg = item.config
  const color = COLOR[cfg.accent]
  const outer = useRef<THREE.Group>(null)
  const spinner = useRef<THREE.Group>(null)
  const formRefs = useRef<(THREE.Mesh | null)[]>([])

  const points = useMemo(() => (cfg.variant === "field" ? buildPoints(cfg.count ?? 200, cfg.spread ?? [9, 5, 4]) : null), [cfg])
  const forms = useMemo(() => (cfg.variant === "field" && cfg.forms ? cfg.forms.map((f) => buildForm(f.geo, f.size)) : []), [cfg])
  const network = useMemo(() => (cfg.variant === "lines" ? buildNetwork(cfg.count ?? 26, cfg.spread ?? [9, 5, 3]) : null), [cfg])

  useEffect(() => () => { points?.dispose(); forms.forEach((g) => g.dispose()); network?.lines.dispose(); network?.points.dispose() }, [points, forms, network])

  useFrame((state, delta) => {
    const group = outer.current
    const spin = spinner.current
    if (!group || !spin) return
    const rect = item.el.getBoundingClientRect()
    const vh = window.innerHeight
    const center = rect.top + rect.height / 2
    const fade = clamp(1 - Math.abs(center - vh / 2) / (vh * 0.72), 0, 1)
    if (fade <= 0.01) { group.visible = false; return }
    group.visible = true

    // scroll-scrubbed progress through the viewport (0 entering bottom → 1 leaving top)
    const progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1)
    const p = pointer.current ?? { x: 0, y: 0 }

    if (cfg.variant === "card") {
      group.position.y = lerp(-0.35, 0.35, progress)
      group.rotation.x = lerp(group.rotation.x, lerp(0.42, -0.22, progress) - p.y * 0.16, 0.08)
      group.rotation.y = lerp(group.rotation.y, p.x * 0.22, 0.08)
      spin.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05
    } else {
      group.position.y = (0.5 - progress) * 1.7
      group.rotation.x = lerp(group.rotation.x, -p.y * 0.16, 0.06)
      group.rotation.y = lerp(group.rotation.y, p.x * 0.22, 0.06)
      spin.rotation.y += delta * (cfg.variant === "lines" ? 0.04 : 0.06)
      spin.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.05
      cfg.forms?.forEach((f, i) => { const mesh = formRefs.current[i]; if (mesh) { mesh.rotation.x += delta * f.speed; mesh.rotation.y += delta * f.speed * 0.8 } })
    }

    const target = (cfg.opacity ?? 0.4) * fade
    group.traverse((obj) => { const m = (obj as THREE.Mesh).material as THREE.Material & { opacity: number }; if (m) { m.transparent = true; m.opacity = target } })
  })

  return (
    <group ref={outer} visible={false}>
      <group ref={spinner}>
        {cfg.variant === "field" && points && (
          <>
            <points geometry={points}><pointsMaterial color={color} size={0.045} sizeAttenuation transparent depthWrite={false} /></points>
            {forms.map((geometry, i) => (
              <mesh key={i} ref={(el) => { formRefs.current[i] = el }} geometry={geometry} position={cfg.forms![i].pos}>
                <meshBasicMaterial color={color} wireframe transparent depthWrite={false} />
              </mesh>
            ))}
          </>
        )}
        {cfg.variant === "lines" && network && (
          <>
            <lineSegments geometry={network.lines}><lineBasicMaterial color={color} transparent depthWrite={false} /></lineSegments>
            <points geometry={network.points}><pointsMaterial color={color} size={0.09} sizeAttenuation transparent depthWrite={false} /></points>
          </>
        )}
        {cfg.variant === "card" && (
          <>
            <RoundedBox args={[2.3, 3, 0.08]} radius={0.05} smoothness={2}><meshStandardMaterial color={palette.silver} metalness={0.15} roughness={0.6} transparent depthWrite={false} /></RoundedBox>
            <mesh position={[0, 1.15, 0.05]}><boxGeometry args={[1.7, 0.18, 0.02]} /><meshBasicMaterial color={palette.blue} transparent depthWrite={false} /></mesh>
            {[0.6, 0.25, -0.1, -0.45, -0.8].map((y, i) => (
              <mesh key={i} position={[-0.12, y, 0.05]}><boxGeometry args={[i % 2 ? 1.5 : 1.9, 0.08, 0.02]} /><meshBasicMaterial color={palette.gray} transparent depthWrite={false} /></mesh>
            ))}
          </>
        )}
      </group>
    </group>
  )
}

export function SectionScene() {
  const [items, setItems] = useState<SceneItem[]>([])
  const [enabled, setEnabled] = useState(false)
  const [loop, setLoop] = useState<"always" | "never">("always")
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce), (max-width: 767px), (pointer: coarse)")
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
    const lowPower = nav.connection?.saveData || (nav.deviceMemory !== undefined && nav.deviceMemory < 4)
    const probe = document.createElement("canvas")
    const hasWebGL = !!probe.getContext("webgl2")
    probe.getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext()
    if (query.matches || lowPower || !hasWebGL) { setEnabled(false); return }

    const found = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"))
      .map((el) => ({ id: el.dataset.scene as string, el, config: SCENE_CONFIG[el.dataset.scene as string] }))
      .filter((item): item is SceneItem => Boolean(item.config))
    setItems(found)
    setEnabled(true)

    const onMove = (e: PointerEvent) => { pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2; pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2 }
    const onVisibility = () => setLoop(document.hidden ? "never" : "always")
    window.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("visibilitychange", onVisibility)
    return () => { window.removeEventListener("pointermove", onMove); document.removeEventListener("visibilitychange", onVisibility) }
  }, [])

  if (!enabled || items.length === 0) return null

  return (
    <Canvas className="section-scene-canvas" frameloop={loop} dpr={[1, 1.5]} camera={{ position: [0, 0, 8], fov: 38, near: 0.1, far: 30 }} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }} aria-hidden="true">
      <ambientLight intensity={1.3} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      {items.map((item) => <Motif key={item.id} item={item} pointer={pointer} />)}
    </Canvas>
  )
}
