import Stats from '../sections/about/Stats.jsx'
import Journey from '../sections/about/Journey.jsx'
import Gallery from '../sections/about/Gallery.jsx'
import CharacterLoop from '../components/CharacterLoop.jsx'
import '../components/CharacterArt.css'
import './About.css'

export default function About() {
  // Layout.jsx already renders the page inside <main>, so this is a plain div.
  return (
    <div className="about">
      {/* about__top (About only) adds the two-column layout; about__intro is shared with Join us and Blogs */}
      <section className="about__intro about__top" aria-labelledby="about-heading">
        <div className="about__text">
          <h2 id="about-heading" className="about__heading" data-reveal>About us</h2>
          <p data-reveal>
SheBuilds is a community-driven initiative that gives women in tech a place to collaborate, learn, and build real-world skills. We believe talent is everywhere, but access is not, so we bridge the gap between skilled women and real opportunities through hackathons, webinars, and mentorship.
          </p>
          <p data-reveal>
             Whether you are just starting out or ready for your next big leap, SheBuilds is where ambition meets opportunity.
          </p>
          <Stats/>          
        </div>

        {/* character-art keeps the slot's size and spacing; CharacterLoop fills it */}
        <div className="character-art character-art--compact">
          <CharacterLoop
            still="/character/mentor-1100.webp"
            video="/character/mentor-loop.webm"
            alt="Illustration of a young woman presenting growth charts on a SheBuilds board"
          />
        </div>
      </section>

      <Journey />
      {/* Later, when the character is ready:
          <Journey character={<img src={characterImg} alt="" />} /> */}
      <Gallery />
    </div>
  )
}
