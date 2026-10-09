import "./JoinUsContent.css";
import CharacterArt from "../../components/CharacterArt.jsx";
// import character from "../../assets/join-us-character.png"; // add this later

// Change `href` to real routes when those pages exist.
const actions = [
  { id: "speak",     color: "var(--join-green, #aecc9d)",  tag: "Speaker",         title: "Want to share knowledge?", cta: "Speak",            href: "#join" },
  { id: "volunteer", color: "var(--join-coral, #fa7b6b)",  tag: "Volunteer",       title: "Want to contribute?",           cta: "Volunteer",        href: "#join" },
  { id: "sponsor",   color: "var(--join-yellow, #f2bf5a)", tag: "Sponsor",         title: "Want to help us grow?",         cta: "Sponsor",          href: "#join" },
  { id: "chapter",   color: "var(--join-teal, #4fc4c0)",   tag: "Chapter Builder", title: "Want to build?",                cta: "Create a chapter", href: "#join" },
];

export default function JoinUsContent() {
  return (
    <section className="about__intro" aria-labelledby="join-us-heading">
      <h2 id="join-us-heading" className="about__heading">
        Join Us
      </h2>

      <div className="join-us__layout">
        <div className="join-us__cards">
          {actions.map((a) => (
            <article
              key={a.id}
              className="join-card"
              style={{ "--card-color": a.color }}
            >
              <span className="join-card__tag">{a.tag}</span>
              <h3 className="join-card__title">{a.title}</h3>
              <a className="join-card__button" href={a.href}>
                {a.cta} <span className="join-card__arrow" aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </div>

        <CharacterArt
          data-reveal
          src="/character/speaker-1100.webp"
          alt="Illustration of a young woman waving beside a SheBuilds podium"
        />
      </div>
    </section>
  );
}