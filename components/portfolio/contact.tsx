"use client"

import { useState, type FormEvent } from "react"
import { ArrowUpRight, Check, Copy, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import content from "@/lib/content.json"
import { SectionHeading } from "./about-skills"

export function Contact() {
  const [status, setStatus] = useState("")
  const [draft, setDraft] = useState("")
  const [copied, setCopied] = useState(false)
  async function prepareMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get("name") || "").trim()
    const email = String(form.get("email") || "").trim()
    const message = String(form.get("message") || "").trim()
    if (!name || !email || !message) { setStatus("Please complete all fields, without blank spaces."); setCopied(false); return }
    const text = `Hi Safrin,\n\n${message}\n\n${name}\n${email}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setDraft("")
      setStatus("Message copied — paste it into a LinkedIn message to Safrin. Nothing has been sent yet.")
    } catch {
      setDraft(text)
      setStatus("Copy the prepared message below, then send it on LinkedIn. Nothing has been sent yet.")
    }
  }
  return <><section id="contact" className="portfolio-section contact-section"><div><SectionHeading label="LET’S CONNECT" title={content.contact.title} description={content.contact.description} /><a href={content.linkedin} target="_blank" rel="noopener noreferrer" className="contact-linkedin">Connect on LinkedIn <ArrowUpRight size={19} /></a><div className="contact-availability"><span className="status-dot" />{content.availability}</div></div><form onSubmit={prepareMessage} className="contact-form" onChange={() => { setCopied(false); setStatus(""); setDraft("") }}><FieldGroup><div className="contact-input-row"><Field><FieldLabel htmlFor="contact-name">Your name</FieldLabel><Input id="contact-name" name="name" autoComplete="name" placeholder="Alex Morgan" required maxLength={100} /></Field><Field><FieldLabel htmlFor="contact-email">Email address</FieldLabel><Input id="contact-email" type="email" name="email" autoComplete="email" placeholder="alex@company.com" required maxLength={254} /></Field></div><Field><FieldLabel htmlFor="contact-message">What do you have in mind?</FieldLabel><Textarea id="contact-message" name="message" placeholder="An opportunity, an idea, or just a hello…" required minLength={10} maxLength={5000} rows={5} /></Field><Button type="submit" size="lg">{copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}{copied ? "Message copied" : "Copy message for LinkedIn"}</Button><p className="contact-delivery-note">{content.contact.deliveryNote}</p><p className="contact-status" role="status" aria-live="polite">{status}</p>{draft && <Field><FieldLabel htmlFor="prepared-message">Your prepared message</FieldLabel><Textarea id="prepared-message" value={draft} readOnly rows={7} onFocus={event => event.currentTarget.select()} /></Field>}</FieldGroup></form></section><footer className="portfolio-footer"><a className="brand" href="#home" aria-label="Back to home">{content.initials}</a><p>Thoughtfully built. Always evolving.<span>© {new Date().getFullYear()} {content.name}</span></p><a className="back-to-top" href="#home">Back to top <ArrowUp size={16} /></a></footer></>
}
