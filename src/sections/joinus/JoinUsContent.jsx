import "./JoinUsContent.css";
// import character from "../../assets/join-us-character.png"; // add this later

// external: true opens the link in a new tab
const actions = [
  { id: "speak",     color: "var(--join-green, #aecc9d)",  tag: "Speaker",         title: "Want to share knowledge?", cta: "Speak",            external: true,
    href: "https://docs.google.com/forms/d/e/1FAIpQLScMcvEDfeZCSzKJTxmcTrmfma8S3_ZTlU4xbeuak4CzfG0VTA/viewform" },
  // No volunteer link yet.
  { id: "volunteer", color: "var(--join-coral, #fa7b6b)",  tag: "Volunteer",       title: "Want to contribute?",           cta: "Volunteer",        href: "#join" },
  { id: "sponsor",   color: "var(--join-yellow, #f2bf5a)", tag: "Sponsor",         title: "Want to help us grow?",         cta: "Sponsor",          external: true,
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=keerthana.shebuilds@gmail.com&su=Sponsorship%20Inquiry%20-%20SheBuilds&body=Hello%20SheBuilds%20Team,%0A%0AI%20am%20interested%20in%20exploring%20a%20sponsorship%20or%20partnership%20opportunity%20with%20SheBuilds.%0A%0APlease%20share%20more%20details%20about%20the%20available%20options.%0A%0ABest%20regards,%0A" },
  { id: "chapter",   color: "var(--join-teal, #4fc4c0)",   tag: "Chapter Builder", title: "Want to build?",                cta: "Create a chapter", external: true,
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=keerthana.shebuilds@gmail.com&su=Start%20a%20SheBuilds%20Chapter&body=Hello%20SheBuilds%20Team,%0A%0AI%20would%20love%20to%20start%20a%20SheBuilds%20chapter%20in%20%5Byour%20city/college%5D.%0A%0ALet%20me%20know%20how%20to%20get%20started!%0A%0ABest%20regards,%0A" },
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
              <a
                className="join-card__button"
                href={a.href}
                {...(a.external && { target: "_blank", rel: "noopener noreferrer" })}
              >
                {a.cta} <span className="join-card__arrow" aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </div>

        {/* Character slot: the wrapper has a fixed size, so the image can't shift the layout */}
        <div className="join-us-character">
          <img
            data-reveal
            src="/character/podium-720.webp"
            alt="Illustration of a woman speaking at a podium"
            loading="lazy"
            className="h-full w-full object-contain object-bottom"
          />
        </div>
      </div>
    </section>
  );
}