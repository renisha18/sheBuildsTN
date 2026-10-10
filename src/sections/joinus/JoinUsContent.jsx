import "./JoinUsContent.css";
import JoinPuzzle from "./JoinPuzzle.jsx";
import CharacterArt from "../../components/CharacterArt.jsx";

// The four Join us actions, shown as interlocking puzzle pieces (the first two are the top row).
// Wording, links and colours are unchanged from the earlier cards. `external` marks the links
// that used to open in a new tab; JoinPuzzle doesn't support that yet, so it isn't passed on.
const actions = [
  { id: "speak",     color: "var(--join-green, #aecc9d)",  tag: "Speaker",         question: "Want to share knowledge?", cta: "Speak",            external: true,
    href: "https://docs.google.com/forms/d/e/1FAIpQLScMcvEDfeZCSzKJTxmcTrmfma8S3_ZTlU4xbeuak4CzfG0VTA/viewform" },
  // No volunteer link yet.
  { id: "volunteer", color: "var(--join-coral, #fa7b6b)",  tag: "Volunteer",       question: "Want to contribute?",      cta: "Volunteer",        href: "#join" },
  { id: "sponsor",   color: "var(--join-yellow, #f2bf5a)", tag: "Sponsor",         question: "Want to help us grow?",    cta: "Sponsor",          external: true,
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=keerthana.shebuilds@gmail.com&su=Sponsorship%20Inquiry%20-%20SheBuilds&body=Hello%20SheBuilds%20Team,%0A%0AI%20am%20interested%20in%20exploring%20a%20sponsorship%20or%20partnership%20opportunity%20with%20SheBuilds.%0A%0APlease%20share%20more%20details%20about%20the%20available%20options.%0A%0ABest%20regards,%0A" },
  { id: "chapter",   color: "var(--join-teal, #4fc4c0)",   tag: "Chapter Builder", question: "Want to build?",           cta: "Create a chapter", external: true,
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=keerthana.shebuilds@gmail.com&su=Start%20a%20SheBuilds%20Chapter&body=Hello%20SheBuilds%20Team,%0A%0AI%20would%20love%20to%20start%20a%20SheBuilds%20chapter%20in%20%5Byour%20city/college%5D.%0A%0ALet%20me%20know%20how%20to%20get%20started!%0A%0ABest%20regards,%0A" },
];

const cards = actions.map(({ id, tag, question, cta, href, color }) => ({ id, tag, question, cta, href, color }));

export default function JoinUsContent() {
  return (
    <section className="about__intro" aria-labelledby="join-us-heading">
      <h2 id="join-us-heading" className="about__heading">
        Join Us
      </h2>

      {/* Puzzle and character side by side from lg; stacked below (see JoinUsContent.css) */}
      <div className="join-us__layout">
        <div className="join-us__puzzle">
          <JoinPuzzle cards={cards} />
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
