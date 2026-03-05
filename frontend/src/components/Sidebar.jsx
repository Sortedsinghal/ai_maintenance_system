import { LayoutDashboard, FilePlus, ClipboardList, Settings, Activity } from 'lucide-react'

const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'submit', icon: FilePlus, label: 'Submit Complaint' },
    { id: 'history', icon: ClipboardList, label: 'Complaint History' },
]

function Sidebar({ activeView, onNavigate, isOpen }) {
    return (
        <aside className={`sidebar${isOpen ? ' open' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <div className="sidebar-logo">
                        <Settings size={20} strokeWidth={2.5} />
                    </div>
                    <div className="sidebar-brand-text">
                        <h1>NOVAMAINT</h1>
                        <span>Maintenance Intelligence</span>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(item => {
                    const Icon = item.icon
                    return (
                        <a
                            key={item.id}
                            className={`nav-item${activeView === item.id ? ' active' : ''}`}
                            onClick={() => onNavigate(item.id)}
                        >
                            <Icon size={18} className="nav-icon" />
                            <span>{item.label}</span>
                        </a>
                    )
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-status">
                    <span className="status-dot" />
                    <Activity size={14} />
                    <span>System Online</span>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
