"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { RoundedBox } from "@react-three/drei"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import content from "@/lib/content.json"

const palette = { silver: "#d9dde3", light: "#fafbfc", ink: "#101114", gray: "#8c919b", blue: "#3979ed" }
const ease = (t: number) => { const x = THREE.MathUtils.clamp(t, 0, 1); return x * x * (3 - 2 * x) }
const mix = (a: number, b: number, u: number) => a + (b - a) * u

/**
 * Tunable timings for the auto-playing intro loop (seconds).
 * riseDuration: rise-from-bottom entrance into the rest pose.
 * loopPauseDuration: how long the laptop holds at rest before looping back.
 * resetDuration: the smooth loop-back descent that returns to the entrance pose.
 */
const LOOP = { riseDuration: 1.5, loopPauseDuration: 1.0, resetDuration: 1.1 }
const CYCLE = LOOP.riseDuration + LOOP.loopPauseDuration + LOOP.resetDuration

type LaptopPose = { scale: number; position: [number, number, number]; rotation: [number, number, number]; lid: number }

/**
 * Single shared reference for the hero's "at rest, scroll 0" state.
 * Both the initial page load and the end of every loop-back settle into this
 * exact pose, so the cycle always hands off from the identical frame the page
 * opened on — no pop, no snap.
 */
const REST: LaptopPose = { scale: 0.62, position: [0, -2.55, 0], rotation: [0, -0.13, -0.03], lid: -0.05 }

/** Off-screen entrance pose: below the frame with a subtle tilt so the rise reads as motion, not a cut. */
const ENTER: LaptopPose = { scale: 0.52, position: [0, -6.4, 0.6], rotation: [0.06, -0.24, -0.05], lid: -0.14 }

// World-space center of the lid screen at the REST pose (lid base + screen offsets,
// scaled by REST.scale). Derived from REST so the scroll dive always aims at the
// actual screen even when the rest pose is retuned.
const SCREEN_CENTER = {
  y: REST.position[1] + REST.scale * (0.08 + 1.49),
  z: REST.position[2] + REST.scale * (-1.35 + 0.073),
}

const CAMERA = {
  rest: { position: [0, 3.45, 9.1] as const, target: [0, 0.2, 0] as const },
  screen: { position: [0, SCREEN_CENTER.y + 0.06, SCREEN_CENTER.z + 0.82] as const, target: [0, SCREEN_CENTER.y, SCREEN_CENTER.z - 1.3] as const },
}

function mixPose(a: LaptopPose, b: LaptopPose, u: number): LaptopPose {
  return {
    scale: mix(a.scale, b.scale, u),
    position: [mix(a.position[0], b.position[0], u), mix(a.position[1], b.position[1], u), mix(a.position[2], b.position[2], u)],
    rotation: [mix(a.rotation[0], b.rotation[0], u), mix(a.rotation[1], b.rotation[1], u), mix(a.rotation[2], b.rotation[2], u)],
    lid: mix(a.lid, b.lid, u),
  }
}

function createScreen() {
  const canvas = document.createElement("canvas")
  canvas.width = 1600
  canvas.height = 1000
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = palette.ink
  ctx.fillRect(0, 0, 1600, 1000)
  ctx.fillStyle = "#191b20"
  ctx.fillRect(0, 0, 1600, 65)
  ;[palette.gray, palette.gray, palette.gray].forEach((color, i) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(34 + i * 28, 33, 8, 0, Math.PI * 2); ctx.fill() })
  ctx.fillStyle = palette.gray
  ctx.font = "22px monospace"
  ctx.textAlign = "center"
  ctx.fillText("safrin / workspace", 800, 41)
  ctx.textAlign = "left"
  ctx.fillStyle = palette.blue
  ctx.font = "32px monospace"
  ctx.fillText("< / >", 110, 246)
  ctx.fillStyle = palette.light
  ctx.font = "500 98px Arial, sans-serif"
  ctx.fillText(content.hero.screenTitle, 108, 398)
  ctx.fillStyle = palette.gray
  ctx.fillText(content.hero.screenSubtitle, 108, 510)
  ctx.fillStyle = palette.gray
  ctx.font = "27px Arial, sans-serif"
  ctx.fillText(content.hero.screenStatus, 112, 599)
  ctx.strokeStyle = "#303238"
  ctx.strokeRect(110, 704, 1380, 116)
  ctx.fillStyle = palette.blue
  ctx.font = "24px monospace"
  ctx.fillText("~", 145, 772)
  ctx.fillStyle = palette.gray
  ctx.fillText(content.hero.screenCommand, 180, 772)
  ctx.fillStyle = palette.blue
  ctx.fillRect(904, 750, 12, 29)
  ctx.fillStyle = palette.gray
  ctx.font = "19px monospace"
  ctx.fillText("PORTFOLIO_OS  /  READY TO EXPLORE", 112, 942)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function createKeyboard() {
  const canvas = document.createElement("canvas")
  canvas.width = 1300
  canvas.height = 500
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = palette.ink
  ctx.fillRect(0, 0, 1300, 500)
  const rows = ["esc 1 2 3 4 5 6 7 8 9 0 - del", "tab Q W E R T Y U I O P [ ]", "caps A S D F G H J K L ; ' enter", "shift Z X C V B N M , . / ↑ shift", "fn ctrl opt cmd · · · · · cmd ← ↓ →"]
  rows.forEach((row, y) => row.split(" ").forEach((label, x) => {
    ctx.fillStyle = "#303238"
    ctx.beginPath()
    ctx.roundRect(x * 100 + 5, y * 100 + 6, 87, 83, 10)
    ctx.fill()
    ctx.fillStyle = palette.silver
    ctx.font = label.length > 1 ? "15px Arial" : "24px Arial"
    ctx.textAlign = "center"
    ctx.fillText(label === "·" ? "" : label, x * 100 + 48, y * 100 + 55)
  }))
  ctx.fillStyle = "#303238"
  ctx.beginPath()
  ctx.roundRect(405, 406, 487, 83, 10)
  ctx.fill()
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function Laptop({ progress, onReady }: { progress: number; onReady: () => void }) {
  const group = useRef<THREE.Group>(null)
  const lid = useRef<THREE.Group>(null)
  const { invalidate } = useThree()
  const texture = useMemo(createScreen, [])
  const keyboard = useMemo(createKeyboard, [])
  const elapsed = useRef(0)
  useEffect(() => { onReady(); return () => { texture.dispose(); keyboard.dispose() } }, [texture, keyboard, onReady])
  useEffect(() => { invalidate() }, [progress, invalidate])
  useFrame(({ camera }, delta) => {
    if (!group.current || !lid.current) return

    let pose: LaptopPose
    if (progress <= 0.0001) {
      // At the top of the page: play the self-running intro loop.
      elapsed.current = (elapsed.current + delta) % CYCLE
      const t = elapsed.current
      if (t < LOOP.riseDuration) {
        // Real animated rise-from-bottom transition into the shared rest state.
        pose = mixPose(ENTER, REST, ease(t / LOOP.riseDuration))
      } else if (t < LOOP.riseDuration + LOOP.loopPauseDuration) {
        // Hold at the exact rest reference.
        pose = REST
      } else {
        // Loop-back descent, ending precisely on ENTER so the next rise is seamless.
        pose = mixPose(REST, ENTER, ease((t - LOOP.riseDuration - LOOP.loopPauseDuration) / LOOP.resetDuration))
      }
      invalidate() // keep frames flowing while the demand-rendered loop is active
    } else {
      // Once scrolling begins, the laptop is pinned to the shared rest state
      // and the camera dives into the screen — driven entirely by scroll.
      pose = REST
      elapsed.current = 0
    }

    group.current.scale.setScalar(pose.scale)
    group.current.position.set(pose.position[0], pose.position[1], pose.position[2])
    group.current.rotation.set(pose.rotation[0], pose.rotation[1], pose.rotation[2])
    lid.current.rotation.x = pose.lid

    const zoom = ease(progress / 0.8)
    camera.position.set(
      mix(CAMERA.rest.position[0], CAMERA.screen.position[0], zoom),
      mix(CAMERA.rest.position[1], CAMERA.screen.position[1], zoom),
      mix(CAMERA.rest.position[2], CAMERA.screen.position[2], zoom),
    )
    camera.lookAt(
      mix(CAMERA.rest.target[0], CAMERA.screen.target[0], zoom),
      mix(CAMERA.rest.target[1], CAMERA.screen.target[1], zoom),
      mix(CAMERA.rest.target[2], CAMERA.screen.target[2], zoom),
    )
    camera.updateProjectionMatrix()
  })
  return <group ref={group}>
    <RoundedBox args={[4.55, 0.14, 3.03]} radius={0.08} smoothness={3} position={[0, 0, 0.08]}><meshStandardMaterial color={palette.silver} metalness={0.65} roughness={0.3} /></RoundedBox>
    <RoundedBox args={[3.68, 0.025, 1.27]} radius={0.008} smoothness={2} position={[0, 0.079, -0.25]}><meshStandardMaterial color={palette.ink} roughness={0.65} /></RoundedBox>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, -0.25]}><planeGeometry args={[3.6, 1.2]} /><meshBasicMaterial map={keyboard} toneMapped={false} /></mesh>
    <RoundedBox args={[1.45, 0.012, 0.7]} radius={0.004} smoothness={2} position={[0, 0.078, 0.96]}><meshStandardMaterial color={palette.gray} metalness={0.5} roughness={0.45} /></RoundedBox>
    <mesh position={[0, 0.085, -1.35]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.07, 0.07, 4.05, 16]} /><meshStandardMaterial color={palette.ink} metalness={0.4} roughness={0.3} /></mesh>
    <group ref={lid} position={[0, 0.08, -1.35]}>
      <RoundedBox args={[4.55, 2.98, 0.105]} radius={0.04} smoothness={4} position={[0, 1.47, 0]}><meshStandardMaterial color={palette.silver} metalness={0.7} roughness={0.28} /></RoundedBox>
      <RoundedBox args={[4.42, 2.85, 0.025]} radius={0.01} smoothness={3} position={[0, 1.49, 0.057]}><meshStandardMaterial color={palette.ink} roughness={0.35} /></RoundedBox>
      <mesh position={[0, 1.49, 0.073]}><planeGeometry args={[4.27, 2.67]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
      <mesh position={[0, 2.864, 0.077]}><circleGeometry args={[0.022, 12]} /><meshBasicMaterial color={palette.gray} /></mesh>
    </group>
  </group>
}

export default function MacBookScene({ progress, onReady }: { progress: number; onReady: () => void }) {
  return <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [0, 3.45, 9.1], fov: 35, near: 0.01, far: 40 }} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }} aria-hidden="true">
    <ambientLight intensity={1.6} />
    <directionalLight position={[-4, 7, 5]} intensity={3.8} color={palette.light} />
    <directionalLight position={[5, 2, -3]} intensity={2.4} color={palette.light} />
    <Laptop progress={progress} onReady={onReady} />
  </Canvas>
}
