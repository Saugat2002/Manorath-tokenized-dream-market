import { Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import MintDream from './pages/MintDream'
import DreamList from './pages/DreamList'
import Pledge from './pages/Pledge'
import NGODashboard from './pages/NGODashboard'
import LegacyWall from './pages/LegacyWall'

function App() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mint" element={<MintDream />} />
          <Route path="/dreams" element={<DreamList />} />
          <Route path="/pledge/:id" element={<Pledge />} />
          <Route path="/ngo" element={<NGODashboard />} />
          <Route path="/legacy" element={<LegacyWall />} />
        </Routes>
      </main>
    </div>
  )
}

export default App 