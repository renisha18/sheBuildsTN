import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import './ThemedSelect.css'

/**
 * A dropdown that matches the site's theme. The browser's own <select> menu is drawn
 * by the operating system and can't be styled, so this draws its own.
 *
 * It follows the "select-only combobox" pattern, so keyboards and screen readers work:
 *   Down/Up open it and move, Home/End jump, Enter/Space choose, Esc closes,
 *   typing a letter jumps to the matching option, Tab leaves.
 *
 * label     small text shown in the button before the value, for example "City"
 * value     the selected option's value ("" is usually the "All ..." choice)
 * onChange  called with the new value
 * options   [{ value, label, hint? }]   hint is small muted text on the right
 */
export default function ThemedSelect({ label, value, onChange, options, disabled = false, className = '' }) {
  const uid = useId()
  const buttonId = `${uid}-button`
  const prefixId = `${uid}-prefix`
  const listId = `${uid}-list`
  const optionId = (i) => `${uid}-option-${i}`

  const rootRef = useRef(null)
  const listRef = useRef(null)
  const buttonRef = useRef(null)
  const typed = useRef({ text: '', timer: 0 })
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [placement, setPlacement] = useState('bottom')

  const found = options.findIndex((o) => o.value === value)
  const selectedIndex = found < 0 ? 0 : found
  const selected = options[selectedIndex]
  const last = options.length - 1

  function openMenu(index = selectedIndex) {
    if (disabled) return
    setActive(index)
    setOpen(true)
  }

  function closeMenu() {
    setOpen(false)
  }

  function choose(index) {
    const option = options[index]
    if (option && option.value !== value) onChange(option.value)
    setOpen(false)
    buttonRef.current?.focus()
  }

  // Open upwards when there is no room below.
  useLayoutEffect(() => {
    if (!open || !listRef.current || !rootRef.current) return
    const list = listRef.current.getBoundingClientRect()
    const root = rootRef.current.getBoundingClientRect()
    const below = window.innerHeight - root.bottom
    const above = root.top
    setPlacement(below < list.height + 16 && above > below ? 'top' : 'bottom')
  }, [open, options.length])

  // Keep the highlighted option in view.
  useEffect(() => {
    if (!open || !listRef.current) return
    listRef.current.children[active]?.scrollIntoView?.({ block: 'nearest' })
  }, [open, active])

  // Close when you click anywhere else, or when focus leaves.
  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => () => window.clearTimeout(typed.current.timer), [])

  function onKeyDown(event) {
    const { key } = event
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault()
      if (!open) return openMenu()
      setActive((i) => Math.min(last, Math.max(0, i + (key === 'ArrowDown' ? 1 : -1))))
    } else if (key === 'Home' || key === 'End') {
      event.preventDefault()
      if (!open) openMenu(key === 'Home' ? 0 : last)
      else setActive(key === 'Home' ? 0 : last)
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault()
      if (!open) openMenu()
      else choose(active)
    } else if (key === 'Escape') {
      if (open) {
        event.preventDefault()
        closeMenu()
      }
    } else if (key === 'Tab') {
      closeMenu()
    } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // type-ahead: "co" jumps to the first option starting with "co"
      window.clearTimeout(typed.current.timer)
      typed.current.text += key.toLowerCase()
      typed.current.timer = window.setTimeout(() => { typed.current.text = '' }, 700)
      const from = open ? active : selectedIndex
      const order = [...options.keys()].map((n) => (n + (typed.current.text.length > 1 ? from : from + 1)) % options.length)
      const match = order.find((i) => options[i].label.toLowerCase().startsWith(typed.current.text))
      if (match !== undefined) {
        if (open) setActive(match)
        else openMenu(match)
      }
    }
  }

  return (
    <div
      ref={rootRef}
      className={`tsel ${className}`.trim()}
      data-open={open}
      data-placement={placement}
    >
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        role="combobox"
        className="tsel__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${prefixId} ${buttonId}`}
        aria-activedescendant={open ? optionId(active) : undefined}
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={onKeyDown}
      >
        <span id={prefixId} className="tsel__prefix">{label}</span>
        <span className="tsel__value">{selected?.label}</span>
        <svg className="tsel__chevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul ref={listRef} id={listId} role="listbox" aria-label={label} className="tsel__list">
          {options.map((option, i) => (
            <li
              key={option.value || '__all'}
              id={optionId(i)}
              role="option"
              aria-selected={option.value === value}
              data-active={i === active}
              className="tsel__option"
              onMouseEnter={() => setActive(i)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(i)}
            >
              <span className="tsel__check" aria-hidden="true">
                {option.value === value && (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                )}
              </span>
              <span className="tsel__text">{option.label}</span>
              {option.hint && <span className="tsel__hint">{option.hint}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
