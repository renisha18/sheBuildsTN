import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import { sections } from './siteSections.js'

// Dev-only frame tester. In production builds import.meta.env.DEV is false, so this import and
// the route below are dropped from the bundle.
const CharacterLab = import.meta.env.DEV ? lazy(() => import('./pages/CharacterLab.jsx')) : null

// Single scrolling page at "/". The old routed URLs (/about, /join, ...) redirect
// to their anchor section so existing links and bookmarks still land correctly.
function App() {
  return (
    <Routes>
      {import.meta.env.DEV && (
        <Route
          path="character-lab"
          element={
            <Suspense fallback={null}>
              <CharacterLab />
            </Suspense>
          }
        />
      )}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        {sections
          .filter((s) => s.id !== 'home')
          .map((s) => (
            <Route key={s.id} path={s.id} element={<Navigate to={{ pathname: '/', hash: `#${s.id}` }} replace />} />
          ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
