import { Routes, Route, Navigate } from 'react-router'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import { sections } from './siteSections.js'

// Single scrolling page at "/". The old routed URLs (/about, /join, ...) redirect
// to their anchor section so existing links and bookmarks still land correctly.
function App() {
  return (
    <Routes>
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
