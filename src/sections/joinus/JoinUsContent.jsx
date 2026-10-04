import "./JoinUsContent.css";
// import character from "../../assets/join-us-character.png"; // add this later

// Change `href` to real routes when those pages exist.
const actions = [
  { id: "speak",     color: "var(--join-green, #aecc9d)",  tag: "SPEAKER",         title: "WANT TO SHARE YOUR KNOWLEDGE?", cta: "SPEAK",            href: "#join" },
  { id: "volunteer", color: "var(--join-coral, #fa7b6b)",  tag: "VOLUNTEER",       title: "WANT TO CONTRIBUTE?",           cta: "VOLUNTEER",        href: "#join" },
  { id: "sponsor",   color: "var(--join-yellow, #f2bf5a)", tag: "SPONSOR",         title: "WANT TO HELP US GROW?",         cta: "SPONSOR",          href: "#join" },
  { id: "chapter",   color: "var(--join-teal, #4fc4c0)",   tag: "CHAPTER BUILDER", title: "WANT TO BUILD?",                cta: "CREATE A CHAPTER", href: "#join" },
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

        {/* Character slot: the wrapper has a fixed size, so the image can't shift the layout.
            To add it: replace the placeholder <div> with
            <img src={character} alt="" />  (keep the wrapper) */}
        <div className="join-us-character" aria-hidden="true">
          <div className="join-us-character__placeholder">Character image (placeholder)</div>
        </div>
      </div>
    </section>
  );
}