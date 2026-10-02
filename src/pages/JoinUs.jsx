import JoinUsContent from "../sections/joinus/JoinUsContent";

// One section of the single-page layout. The id matches siteSections.js;
// tabIndex={-1} lets scrollToSection() move keyboard focus here.
export default function JoinUs() {
  return (
    <section id="join" tabIndex={-1} className="join-us">
      <JoinUsContent />
    </section>
  );
}