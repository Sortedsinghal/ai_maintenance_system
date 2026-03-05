import { useEffect, useState, useRef, useCallback } from 'react'
import { fetchStats, fetchComplaints } from '../api'
import { Badge, formatTime } from './shared'
import {
    BarChart3, Zap, Cog, Radio,
    AlertTriangle, AlertCircle, CheckCircle,
    Activity, Inbox
} from 'lucide-react'

const CATEGORY_COLORS = {
    Electrical: '#facc15',
    Mechanical: '#f97316',
    Sensor: '#06b6d4',
    Unknown: '#94a3b8',
}

const PRIORITY_COLORS = {
    High: '#ef4444',
    Medium: '#f59e0b',
    Low: '#22c55e',
}

// --- Animated Counter ---
function CountUp({ target }) {
    const ref = useRef(null)

    useEffect(() => {
        if (!ref.current) return
        const el = ref.current
        if (target === 0) { el.textContent = '0'; return }

        const duration = 800
        const start = performance.now()

        function update(now) {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            el.textContent = Math.round(target * eased)
            if (progress < 1) requestAnimationFrame(update)
        }

        requestAnimationFrame(update)
    }, [target])

    return <span ref={ref}>0</span>
}

// --- Donut Chart ---
function DonutChart({ data, colors, title }) {
    const canvasRef = useRef(null)

    const draw = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const dpr = window.devicePixelRatio || 1
        canvas.width = 200 * dpr
        canvas.height = 200 * dpr
        canvas.style.width = '200px'
        canvas.style.height = '200px'
        ctx.scale(dpr, dpr)

        const entries = Object.entries(data)
        const total = entries.reduce((s, [, v]) => s + v, 0)
        const cx = 100, cy = 100, r = 72, lw = 18

        ctx.clearRect(0, 0, 200, 200)

        if (total === 0) {
            ctx.beginPath()
            ctx.arc(cx, cy, r, 0, Math.PI * 2)
            ctx.strokeStyle = 'rgba(255,255,255,0.04)'
            ctx.lineWidth = lw
            ctx.stroke()
            ctx.fillStyle = '#475569'
            ctx.font = '500 13px Inter, sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('No data', cx, cy)
            return
        }

        // Background ring
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.03)'
        ctx.lineWidth = lw
        ctx.stroke()

        let startAngle = -Math.PI / 2
        const gap = 0.04 // small gap between segments

        entries.forEach(([key, value]) => {
            if (value === 0) return
            const sliceAngle = (value / total) * Math.PI * 2 - gap
            if (sliceAngle <= 0) return

            ctx.beginPath()
            ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle)
            ctx.strokeStyle = colors[key] || '#94a3b8'
            ctx.lineWidth = lw
            ctx.lineCap = 'round'
            ctx.stroke()

            startAngle += sliceAngle + gap
        })

        // Center text
        ctx.fillStyle = '#e2e8f0'
        ctx.font = '700 26px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(total, cx, cy - 4)

        ctx.fillStyle = '#475569'
        ctx.font = '600 9px Inter, sans-serif'
        ctx.letterSpacing = '1px'
        ctx.fillText('TOTAL', cx, cy + 16)
    }, [data, colors])

    useEffect(() => { draw() }, [draw])

    const entries = Object.entries(data)

    return (
        <div className="chart-card">
            <div className="chart-card-title">{title}</div>
            <div className="chart-container">
                <canvas ref={canvasRef} />
            </div>
            <div className="chart-legend">
                {entries.map(([key, value]) => (
                    <div key={key} className="legend-item">
                        <span className="legend-color" style={{ background: colors[key] || '#94a3b8' }} />
                        <span className="legend-label">{key}</span>
                        <span className="legend-value">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// --- Dashboard ---
function Dashboard({ onError }) {
    const [stats, setStats] = useState(null)
    const [recent, setRecent] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const [statsData, complaints] = await Promise.all([
                    fetchStats(),
                    fetchComplaints(),
                ])
                setStats(statsData)
                setRecent(complaints.slice(0, 5))
            } catch (err) {
                onError('Failed to load dashboard data')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [onError])

    if (loading) {
        return (
            <div className="view-enter">
                <div className="page-header">
                    <h2>Dashboard</h2>
                    <p>Real-time overview of maintenance operations</p>
                </div>
                <div className="loading-overlay">
                    <div className="spinner" />
                    <span>Loading dashboard...</span>
                </div>
            </div>
        )
    }

    if (!stats) return null

    const statCards = [
        { cls: 'total', icon: <BarChart3 size={20} />, label: 'Total Complaints', value: stats.total },
        { cls: 'electrical', icon: <Zap size={20} />, label: 'Electrical', value: stats.by_category.Electrical || 0 },
        { cls: 'mechanical', icon: <Cog size={20} />, label: 'Mechanical', value: stats.by_category.Mechanical || 0 },
        { cls: 'sensor', icon: <Radio size={20} />, label: 'Sensor', value: stats.by_category.Sensor || 0 },
        { cls: 'high', icon: <AlertTriangle size={20} />, label: 'High Priority', value: stats.by_priority.High || 0 },
        { cls: 'medium', icon: <AlertCircle size={20} />, label: 'Medium Priority', value: stats.by_priority.Medium || 0 },
        { cls: 'low', icon: <CheckCircle size={20} />, label: 'Low Priority', value: stats.by_priority.Low || 0 },
    ]

    return (
        <div className="view-enter">
            <div className="page-header">
                <h2>Dashboard</h2>
                <p>Real-time overview of maintenance operations</p>
            </div>

            <div className="stats-grid">
                {statCards.map(c => (
                    <div key={c.cls} className={`stat-card ${c.cls}`}>
                        <div className="stat-card-icon">{c.icon}</div>
                        <div className="stat-card-label">{c.label}</div>
                        <div className="stat-card-value">
                            <CountUp target={c.value} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="charts-row">
                <DonutChart data={stats.by_category} colors={CATEGORY_COLORS} title="Category Distribution" />
                <DonutChart data={stats.by_priority} colors={PRIORITY_COLORS} title="Priority Distribution" />
            </div>

            <div>
                <div className="section-title">
                    <Activity size={18} className="icon" />
                    Recent Complaints
                </div>
                <div className="table-card">
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Complaint</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.length === 0 ? (
                                    <tr>
                                        <td colSpan="5">
                                            <div className="empty-state">
                                                <Inbox size={40} strokeWidth={1.5} />
                                                <h3>No complaints yet</h3>
                                                <p>Submit your first maintenance complaint to get started.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    recent.map(c => (
                                        <tr key={c.id}>
                                            <td className="id-col">#{c.id}</td>
                                            <td><Badge type={c.issue_category} label={c.issue_category} /></td>
                                            <td><Badge type={c.priority} label={c.priority} /></td>
                                            <td className="complaint-text" title={c.original_complaint}>{c.original_complaint}</td>
                                            <td className="timestamp">{formatTime(c.timestamp)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
