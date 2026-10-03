import { useEffect } from 'react'
import PageSection from '../components/PageSection.jsx'
import Hero from '../sections/home/Hero.jsx'
import About from './About.jsx'
import PlaceholderSection from '../sections/PlaceholderSection.jsx'
import { sections, scrollToSection } from '../siteSections.js'
import JoinUs from './JoinUs.jsx'

// The whole site: one scrolling page, sections in nav order.
function Home() {
  // Deep links (/#events, or /events redirected here) land on their section
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (sections.some((s) => s.id === id)) scrollToSection(id, { instant: true, focus: false })
  }, [])

  return (
    <>
      <PageSection id="home" revealOn="load">
        <Hero />
      </PageSection>
      <PageSection id="about">
        <About />
      </PageSection>
      <PageSection id="join">
        <JoinUs/>
      </PageSection>
      <PageSection id="events">
        <PlaceholderSection id="events" title="Events" text="Upcoming workshops, meetups and hackathons will be listed here." />
      </PageSection>
      <PageSection id="blogs">
        <PlaceholderSection id="blogs" title="Blogs" text="Stories and write-ups from the community will appear here." />
      </PageSection>
    </>
  )
}

export default Home
