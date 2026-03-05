import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import SubmitComplaint from './components/SubmitComplaint'
import History from './components/History'
import Toast from './components/Toast'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [toasts, setToasts] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const showToast = (message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  const handleNav = (view) => {
    setActiveView(view)
    setSidebarOpen(false)
    if (view === 'dashboard' || view === 'history') {
      setRefreshKey(k => k + 1)
    }
  }

  const handleComplaintSubmitted = () => {
    showToast('Complaint analyzed and saved successfully!', 'success')
    setRefreshKey(k => k + 1)
  }

  return (
    <>
      <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <Menu size={20} />
      </button>
      {sidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="app-layout">
        <Sidebar activeView={activeView} onNavigate={handleNav} isOpen={sidebarOpen} />

        <main className="main-content">
          {activeView === 'dashboard' && (
            <Dashboard key={`dash-${refreshKey}`} onError={(msg) => showToast(msg, 'error')} />
          )}
          {activeView === 'submit' && (
            <SubmitComplaint
              onSuccess={handleComplaintSubmitted}
              onError={(msg) => showToast(msg, 'error')}
            />
          )}
          {activeView === 'history' && (
            <History key={`hist-${refreshKey}`} onError={(msg) => showToast(msg, 'error')} />
          )}
        </main>
      </div>

      <div className="toast-container">
        {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} />)}
      </div>
    </>
  )
}

export default App
