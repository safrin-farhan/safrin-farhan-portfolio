import Image from "next/image"
import { ArrowUpRight, ChevronDown, Check } from "lucide-react"
import content from "@/lib/content.json"
import { SectionHeading } from "./about-skills"

export function Projects() {
  return <section id="projects" className="portfolio-section"><SectionHeading label="SELECTED WORK" title="Ideas, out in the real world." description="Thoughtful technology. Real problems. A reason to build." />
    <div className="project-list">{content.projects.map(project => <article key={project.name} className="project"><div className="project-overview"><div className="project-copy"><p className="eyebrow">{project.category}</p><h3>{project.name}<span className="project-mark">↗</span></h3><h4>{project.tagline}</h4><p>{project.description}</p><ul className="project-tags">{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>{project.url && <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-link">Explore project <ArrowUpRight size={17} /></a>}{project.repository && <a href={project.repository} target="_blank" rel="noopener noreferrer" className="text-link">View source <ArrowUpRight size={17} /></a>}</div><figure className="project-visual"><Image src={project.image} alt={project.imageAlt} width={1024} height={768} sizes="(max-width: 767px) 100vw, 55vw" /><figcaption>{project.imageCaption}</figcaption></figure></div><details className="project-details"><summary>Explore the project <ChevronDown size={18} /></summary><div><p>{project.details}</p><ul>{project.features.map(feature => <li key={feature}><Check size={16} />{feature}</li>)}</ul></div></details></article>)}</div>
  </section>
}
