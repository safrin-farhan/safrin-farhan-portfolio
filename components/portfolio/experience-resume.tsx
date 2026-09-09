import { ArrowUpRight, Download, GraduationCap, FileText } from "lucide-react"
import content from "@/lib/content.json"
import { SectionHeading } from "./about-skills"

export function Experience() {
  return <section id="experience" data-scene="experience" className="portfolio-section experience-section"><SectionHeading label="BEYOND THE CODE" title={"Learning by leading.\nGrowing by doing."} /><div className="experience-list">{content.experience.map(job => <article className="experience" key={job.company}><div className="experience-title"><h3>{job.company}</h3><span>{job.role}</span></div><p>{job.description}</p><ul className="experience-tags">{job.tags.map(tag => <li key={tag}>{tag}</li>)}</ul></article>)}</div></section>
}

export function Education() {
  const education = content.education
  return <section id="education" data-scene="education" className="portfolio-section education-section"><div className="education-label"><GraduationCap size={24} strokeWidth={1.5} /><p className="eyebrow">ALWAYS A STUDENT</p></div><div className="education-content"><h2>{education.institution}</h2><p>{education.degree} · {education.specialization}</p><span>{education.status}</span></div><div className="education-grade"><strong>{education.cgpa}<span>/ 10</span></strong><span className="font-mono">CGPA</span></div></section>
}

export function Resume() {
  return <section id="resume" data-scene="resume" className="portfolio-section resume-section"><div className="resume-icon"><FileText size={29} strokeWidth={1.3} /></div><div className="resume-copy"><p className="eyebrow">THE SHORT VERSION</p><h2>{content.resume.title}</h2><p>{content.resume.description}</p></div><div className="resume-action">{content.resume.pdfUrl ? <><a href={content.resume.pdfUrl} target="_blank" rel="noopener noreferrer" className="action-link">View résumé <ArrowUpRight size={17} /></a><a href={content.resume.pdfUrl} download className="text-link">Download PDF <Download size={16} /></a></> : <><a href={content.linkedin} target="_blank" rel="noopener noreferrer" className="action-link">Request résumé <ArrowUpRight size={17} /></a><span>PDF upload pending</span></>}</div></section>
}
