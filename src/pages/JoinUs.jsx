import JoinUsContent from "../sections/joinus/JoinUsContent";

// One section of the single-page layout. PageSection (Home.jsx) already provides the
// id="join" anchor, focus target and min-height, so this is a plain wrapper.
// "about" reuses the About section's wrapper so Join us lines up with About and Blogs;
// "join-us" carries the card colour variables.
export default function JoinUs() {
  return (
    <div className="about join-us">
      <JoinUsContent />
    </div>
  );
}
