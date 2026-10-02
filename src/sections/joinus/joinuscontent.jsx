import "./JoinUsContent.css";
// import character from "../../assets/join-us-character.png"; // add this later

// "\n" is a line break (CSS: white-space: pre-line). Change `href` to your real routes,
// or swap <a> for React Router's <Link to=...> if you use it.
const actions = [
  { id: "speak",     color: "var(--join-green, #aecc9d)",  title: "WANT TO SHARE\nYOUR KNOWLEDGE?", cta: "SPEAK",             href: "#speak" },
  { id: "volunteer", color: "var(--join-coral, #fa7b6b)",  title: "WANT TO\nCONTRIBUTE?",           cta: "VOLUNTEER",         href: "#volunteer" },
  { id: "sponsor",   color: "var(--join-yellow, #f2bf5a)", title: "WANT TO HELP US\nGROW?",         cta: "SPONSOR",           href: "#sponsor" },
  { id: "chapter",   color: "var(--join-teal, #4fc4c0)",   title: "WANT TO BUILD?",                 cta: "CREATE A\nCHAPTER", href: "#chapter" },
];

export default function JoinUsContent() {
  return (
    <section className="join-us__inner" aria-labelledby="join-us-heading">
      <h1 id="join-us-heading" className="join-us__heading">
        HOW DO YOU WANT TO BUILD?
      </h1>

      <div className="join-us__layout">
        {actions.map((a) => (
          <article
            key={a.id}
            className={`join-card join-card--${a.id}`}
            style={{ "--card-color": a.color }}
          >
            <h2 className="join-card__title">{a.title}</h2>
            <a className="join-card__button" href={a.href}>
              {a.cta} <span aria-hidden="true">→</span>
            </a>
          </article>
        ))}

        {/* Reserved space for the character.
            To add it: replace the placeholder <div> with
            <img src={character} alt="" />  (keep the wrapper) */}
        <div className="join-us-character" aria-hidden="true">
          <div className="join-us-character__placeholder">Character goes here</div>
        </div>
      </div>
    </section>
  );
}