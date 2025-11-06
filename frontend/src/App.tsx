import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ArchitectureDiagram from './pages/ArchitectureDiagram'
import Dashboard from './pages/Dashboard'
import Players from './pages/Players'
import NPCs from './pages/NPCs'
import Metrics from './pages/Metrics'
import Layout from './components/Layout'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/architecture" element={<ArchitectureDiagram />} />
          <Route path="/players" element={<Players />} />
          <Route path="/npcs" element={<NPCs />} />
          <Route path="/metrics" element={<Metrics />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
