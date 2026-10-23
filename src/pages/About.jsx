import Journey from '../sections/about/Journey.jsx'
import Gallery from '../sections/about/Gallery.jsx'
import CharacterLoop from '../components/CharacterLoop.jsx'
import '../components/CharacterArt.css'
import './About.css'
// import characterImg from '../assets/character.png' // add this later

export default function About() {
  // Layout.jsx already renders the page inside <main>, so this is a plain div.
  return (
    <div className="about">
      {/* about__top (About only) adds the two-column layout; about__intro is shared with Join us and Blogs */}
      <section className="about__intro about__top" aria-labelledby="about-heading">
        <div className="about__text">
          <h2 id="about-heading" className="about__heading" data-reveal>About us</h2>
          <p data-reveal>
            SheBuilds Chennai started as a small WhatsApp group of five women who
            wanted a space to talk code, career, and life without the noise.
            Today we&apos;re 300+ engineers, designers, founders, and students — every
            stage, every stack — who show up for each other online and off.
          </p>
          <p data-reveal>
            We run workshops, host speaker nights, organise hackathons, and keep
            online groups where questions never go unanswered.
          </p>
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
