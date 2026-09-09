"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { RoundedBox } from "@react-three/drei"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import content from "@/lib/content.json"

const palette = { silver: "#d9dde3", light: "#fafbfc", ink: "#101114", gray: "#8c919b", blue: "#3979ed" }
const ease = (t: number) => { const x = THREE.MathUtils.clamp(t, 0, 1); return x * x * (3 - 2 * x) }

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
  useEffect(() => { onReady(); return () => { texture.dispose(); keyboard.dispose() } }, [texture, keyboard, onReady])
  useEffect(() => { invalidate() }, [progress, invalidate])
  useFrame(({ camera }) => {
    if (!group.current || !lid.current) return
    const reveal = ease(progress / 0.35)
    const zoom = ease((progress - 0.25) / 0.75)
    group.current.scale.setScalar(THREE.MathUtils.lerp(0.62, 1, reveal))
    group.current.position.set(0, THREE.MathUtils.lerp(-1.65, -0.78, reveal), 0)
    group.current.rotation.set(0, THREE.MathUtils.lerp(-0.19, 0, reveal), THREE.MathUtils.lerp(-0.035, 0, reveal))
    lid.current.rotation.x = THREE.MathUtils.lerp(-0.13, 0, reveal)
    camera.position.set(0, THREE.MathUtils.lerp(3.45, 0.68, zoom), THREE.MathUtils.lerp(9.1, 0.02, zoom))
    camera.lookAt(0, THREE.MathUtils.lerp(0.2, 0.68, zoom), THREE.MathUtils.lerp(0, -1.05, zoom))
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
