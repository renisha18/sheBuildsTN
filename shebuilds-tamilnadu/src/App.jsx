import { Routes, Route } from 'react-router'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import ComingSoon from './pages/ComingSoon.jsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        {/* Join us / Events / Blogs don't have pages yet */}
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  )
}

export default App
