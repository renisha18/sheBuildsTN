import './CharacterArt.css'

// One character still (square, 1100x1100 source). Sizing and placement live in CharacterArt.css:
// below lg it sits under the text at min(100%, 340px); from lg up it takes its clamp() size and the
// section's grid places it. The stills carry ~8% empty margin, so no padding is added here.
//
// size: 'large' (Home, Join us) or 'compact' (About)
// priority: the above-the-fold image (Home) loads eagerly with high fetch priority
// Any other props (e.g. data-reveal) go straight on the <img>.
export default function CharacterArt({ src, alt, priority = false, size = 'large', ...rest }) {
  return (
    <img
      src={src}
      alt={alt}
      width={1100}
      height={1100}
      decoding="async"
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      className={`character-art${size === 'compact' ? ' character-art--compact' : ''}`}
      {...rest}
    />
  )
}
