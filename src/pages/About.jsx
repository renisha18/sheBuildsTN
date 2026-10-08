import Journey from '../sections/about/Journey.jsx'
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

        {/* Character slot: fixed width + aspect ratio, so the image can't shift the layout */}
        <div className="about__character">
          <img
            src="/character/teach-720.webp"
            alt="Illustration of a woman teaching with a pointer"
            loading="lazy"
            className="h-full w-full object-contain object-bottom"
          />
        </div>
      </section>

      <Journey />
      {/* Later, when the character is ready:
          <Journey character={<img src={characterImg} alt="" />} /> */}
    </div>
  )
}
