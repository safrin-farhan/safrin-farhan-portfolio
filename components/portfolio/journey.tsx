"use client"

import { useEffect, useSyncExternalStore } from "react"
import { Play, Square } from "lucide-react"
import { beginManualLoopBack, getJourneyState, getServerJourneyState, isAtBottom, startQuickLook, stopJourney, subscribeJourney } from "@/lib/journey"
import { cn } from "@/lib/utils"

function useJourney() {
  return useSyncExternalStore(subscribeJourney, getJourneyState, getServerJourneyState)
}

/** Ghost button in the hero that plays the whole experience once, then hands control back. */
export function QuickLookButton() {
  const { phase } = useJourney()
  const playing = phase !== "idle"
  return (
    <button type="button" className="quick-look" data-journey-control aria-pressed={playing} onClick={startQuickLook}>
      {playing ? <Square size={11} fill="currentColor" /> : <Play size={11} fill="currentColor" />}
      {playing ? "STOP" : "QUICK LOOK"}
    </button>
  )
}

/**
 * Global journey chrome: watches for the manual scroll-to-bottom loop, keeps a Stop control
 * reachable while the hero copy is hidden, and renders the fade veil used under reduced motion.
 */
export function JourneyController() {
  const { phase, source, veil } = useJourney()
  useEffect(() => {
    let armed = !isAtBottom()
    // Fires once per arrival at the bottom; leaving the bottom (including during the return trip) re-arms it.
    const onScroll = () => {
      if (!isAtBottom()) { armed = true; return }
      if (armed && getJourneyState().phase === "idle") { armed = false; beginManualLoopBack() }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => { window.removeEventListener("scroll", onScroll); stopJourney() }
  }, [])
  const label = phase === "pause" ? "Pausing before the loop-back" : phase === "return" ? "Returning to the start" : "Quick Look is playing"
  return (
    <>
      <div className={cn("journey-veil", veil && "is-visible")} aria-hidden="true" />
      <div className={cn("journey-status", phase !== "idle" && "is-visible")} role="status" aria-live="polite">
        {phase !== "idle" && (
          <>
            <span className="journey-status-dot" />
            <span>{source === "quick-look" ? "QUICK LOOK" : "LOOPING BACK"}<span className="sr-only">. {label}.</span></span>
            <button type="button" data-journey-control onClick={stopJourney} aria-label="Stop and hand control back">
              <Square size={10} fill="currentColor" />STOP
            </button>
          </>
        )}
      </div>
    </>
  )
}
