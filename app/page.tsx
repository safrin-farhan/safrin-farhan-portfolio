import { Navigation } from "@/components/portfolio/navigation"
import { Hero } from "@/components/portfolio/hero"
import { About, Skills } from "@/components/portfolio/about-skills"
import { Certifications } from "@/components/portfolio/certifications"
import { Projects } from "@/components/portfolio/projects"
import { Experience, Education, Resume } from "@/components/portfolio/experience-resume"
import { Contact } from "@/components/portfolio/contact"
import { JourneyController } from "@/components/portfolio/journey"
import { Terminal } from "lucide-react"

export default function Page() {
  return <><a className="skip-link" href="#about">Skip animation and go to content</a><Navigation /><JourneyController /><main><Hero /><div id="workspace" className="dark workspace"><div className="workspace-status"><div className="page-width workspace-status-inner"><span><Terminal size={15} />safrin / workspace</span><span><i className="status-dot" />YOU’RE IN. MAKE YOURSELF AT HOME.</span><span className="font-mono">portfolio_os</span></div></div><div className="page-width"><About /><Skills /><Certifications /><Projects /><Experience /><Education /><Resume /><Contact /></div></div></main></>
}
