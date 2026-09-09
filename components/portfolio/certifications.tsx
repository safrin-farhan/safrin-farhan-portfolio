import { ArrowUpRight, Award, ChevronDown } from "lucide-react"
import content from "@/lib/content.json"
import { SectionHeading } from "./about-skills"

export function Certifications() {
  return <section id="certifications" data-scene="certifications" className="portfolio-section">
    <SectionHeading label="LEARNING, WITH INTENT" title="Building a stronger foundation." description="Cloud and AI knowledge, backed by structured learning." />
    <div className="certification-grid">{content.certifications.map(cert => <article className="certification" data-tilt key={cert.name}>
      <div className="certification-top"><div className="aws-badge"><img src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/amazon-web-services/light.svg" alt="AWS" width={52} height={32} loading="lazy" /><Award size={35} strokeWidth={1.2} /><span>{cert.level}</span></div><span className="cert-code font-mono">{cert.code}</span></div>
      <div className="certification-copy"><h3>{cert.name}</h3><p>{cert.description}</p></div>
      {cert.verifyUrl ? <a className="text-link" href={cert.verifyUrl} target="_blank" rel="noopener noreferrer">Verify credential <ArrowUpRight size={16} /></a> : <span className="credential-pending">Verification details to be added</span>}
      <details className="credential-details"><summary>Credential details <ChevronDown size={15} /></summary><dl><div><dt>Credential ID</dt><dd>{cert.credentialId || "Not provided yet"}</dd></div><div><dt>Issue date</dt><dd>{cert.issueDate || "Not provided yet"}</dd></div><div><dt>Verification URL</dt><dd>{cert.verifyUrl || "Not provided yet"}</dd></div></dl></details>
    </article>)}</div>
    <details className="earlier-certifications"><summary><span>More along the learning journey</span><span className="supporting-count">{content.supportingCertifications.length} certificates <ChevronDown size={17} /></span></summary><ul>{content.supportingCertifications.map(cert => <li key={cert.name}><span>{cert.name}</span><span>{cert.issuer}</span></li>)}</ul></details>
  </section>
}
