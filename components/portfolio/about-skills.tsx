import { ArrowUpRight, Cloud, Code2, Database, Layers, Network, Terminal } from "lucide-react"
import content from "@/lib/content.json"

export function SectionHeading({ label, title, description }: { label: string; title: string; description?: string }) {
  return <div className="section-heading"><p className="eyebrow"><span className="section-dot" />{label}</p><h2 className="text-balance">{title}</h2>{description && <p className="section-description">{description}</p>}</div>
}

export function About() {
  return <section id="about" className="portfolio-section about-section">
    <div><SectionHeading label="A LITTLE ABOUT ME" title={content.about.title} /><div className="about-location"><span className="status-dot" />Based in {content.location}</div></div>
    <div className="about-copy">{content.about.paragraphs.map((paragraph, i) => <p key={paragraph} className={i === 0 ? "about-lead" : ""}>{paragraph}</p>)}<div className="focus-note"><Terminal size={20} /><p>{content.about.focus}</p></div><a className="text-link" href="#experience">A little more about my journey <ArrowUpRight size={17} /></a></div>
  </section>
}

const groupIcons = [Cloud, Terminal, Code2, Layers]
const conceptIcons: Record<string, typeof Cloud> = { "CI/CD": Network, Networking: Network, SQL: Database, RAG: Layers, Embeddings: Code2, "Vector databases": Database, ChromaDB: Database, APIs: Code2 }

export function Skills() {
  return <section id="skills" className="portfolio-section">
    <SectionHeading label="MY TOOLKIT" title="The tools behind the thinking." description="A growing stack across cloud, systems, and intelligent applications." />
    <div className="skills-grid">{content.skills.map((group, index) => { const Icon = groupIcons[index % groupIcons.length]; return <div className="skill-group" key={group.group}><div className="skill-group-heading"><Icon size={21} strokeWidth={1.5} /><h3>{group.group}</h3></div><p>{group.description}</p><ul className="skill-items">{group.items.map(skill => { const Glyph = conceptIcons[skill.name] || Code2; return <li key={skill.name}>{skill.logo ? <img src={`https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/${skill.logo}.svg`} alt="" width={23} height={23} loading="lazy" className="tool-logo" /> : <Glyph size={22} strokeWidth={1.5} />}<span>{skill.name}</span></li> })}</ul></div> })}</div>
  </section>
}
