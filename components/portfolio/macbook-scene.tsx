"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { RoundedBox } from "@react-three/drei"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import content from "@/lib/content.json"
import { HERO_START, heroPose, ease, mix } from "@/lib/portfolio-motion"

const palette = { silver: "#d9dde3", light: "#fafbfc", ink: "#101114", gray: "#8c919b", blue: "#3979ed" }
const REST = HERO_START.laptop

// World-space center of the lid screen at the REST pose (lid base + screen offsets,
// scaled by REST.scale). Derived from REST so the scroll dive always aims at the
// actual screen even when the rest pose is retuned.
const SCREEN_CENTER = {
  y: REST.position[1] + REST.scale * (0.08 + 1.49),
  z: REST.position[2] + REST.scale * (-1.35 + 0.073),
}

const CAMERA = {
  rest: HERO_START.camera,
  screen: { position: [0, SCREEN_CENTER.y + 0.06, SCREEN_CENTER.z + 0.82] as const, target: [0, SCREEN_CENTER.y, SCREEN_CENTER.z - 1.3] as const },
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

function Laptop({ progress, offset, onReady }: { progress: number; offset: number; onReady: () => void }) {
  const group = useRef<THREE.Group>(null)
  const lid = useRef<THREE.Group>(null)
  const { invalidate } = useThree()
  const texture = useMemo(createScreen, [])
  const keyboard = useMemo(createKeyboard, [])
  const hasRendered = useRef(false)
  useEffect(() => () => { texture.dispose(); keyboard.dispose() }, [texture, keyboard])
  useEffect(() => { invalidate() }, [progress, offset, invalidate])
  useFrame(({ camera }) => {
    if (!group.current || !lid.current) return
    const pose = heroPose(offset)
    if (!hasRendered.current) { hasRendered.current = true; onReady() }

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
  return <group ref={group} scale={REST.scale} position={REST.position} rotation={REST.rotation}>
    <RoundedBox args={[4.55, 0.14, 3.03]} radius={0.08} smoothness={3} position={[0, 0, 0.08]}><meshStandardMaterial color={palette.silver} metalness={0.65} roughness={0.3} /></RoundedBox>
    <RoundedBox args={[3.68, 0.025, 1.27]} radius={0.008} smoothness={2} position={[0, 0.079, -0.25]}><meshStandardMaterial color={palette.ink} roughness={0.65} /></RoundedBox>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, -0.25]}><planeGeometry args={[3.6, 1.2]} /><meshBasicMaterial map={keyboard} toneMapped={false} /></mesh>
    <RoundedBox args={[1.45, 0.012, 0.7]} radius={0.004} smoothness={2} position={[0, 0.078, 0.96]}><meshStandardMaterial color={palette.gray} metalness={0.5} roughness={0.45} /></RoundedBox>
    <mesh position={[0, 0.085, -1.35]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.07, 0.07, 4.05, 16]} /><meshStandardMaterial color={palette.ink} metalness={0.4} roughness={0.3} /></mesh>
    <group ref={lid} position={[0, 0.08, -1.35]} rotation={[REST.lid, 0, 0]}>
      <RoundedBox args={[4.55, 2.98, 0.105]} radius={0.04} smoothness={4} position={[0, 1.47, 0]}><meshStandardMaterial color={palette.silver} metalness={0.7} roughness={0.28} /></RoundedBox>
      <RoundedBox args={[4.42, 2.85, 0.025]} radius={0.01} smoothness={3} position={[0, 1.49, 0.057]}><meshStandardMaterial color={palette.ink} roughness={0.35} /></RoundedBox>
      <mesh position={[0, 1.49, 0.073]}><planeGeometry args={[4.27, 2.67]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
      <mesh position={[0, 2.864, 0.077]}><circleGeometry args={[0.022, 12]} /><meshBasicMaterial color={palette.gray} /></mesh>
    </group>
  </group>
}

export default function MacBookScene({ progress, offset, onReady }: { progress: number; offset: number; onReady: () => void }) {
  return <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: HERO_START.camera.position, fov: 35, near: 0.01, far: 40 }} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }} aria-hidden="true">
    <ambientLight intensity={1.6} />
    <directionalLight position={[-4, 7, 5]} intensity={3.8} color={palette.light} />
    <directionalLight position={[5, 2, -3]} intensity={2.4} color={palette.light} />
    <Laptop progress={progress} offset={offset} onReady={onReady} />
  </Canvas>
}
