import { useEffect, useState, useMemo } from 'react'
import { fetchComplaints } from '../api'
import { Badge, formatTime } from './shared'
import { Search, Zap, Cog, Radio, HelpCircle, Inbox } from 'lucide-react'

const FILTERS = [
    { key: 'all', label: 'All', icon: null },
    { key: 'Electrical', label: 'Electrical', icon: <Zap size={13} /> },
    { key: 'Mechanical', label: 'Mechanical', icon: <Cog size={13} /> },
    { key: 'Sensor', label: 'Sensor', icon: <Radio size={13} /> },
    { key: 'Unknown', label: 'Unknown', icon: <HelpCircle size={13} /> },
]

function History({ onError }) {
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchComplaints()
                setComplaints(data)
            } catch (err) {
                onError('Failed to load complaint history')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [onError])

    const filtered = useMemo(() => {
        let result = complaints

        if (filter !== 'all') {
            result = result.filter(c => c.issue_category === filter)
        }

        if (search) {
            const q = search.toLowerCase()
            result = result.filter(c =>
                c.original_complaint.toLowerCase().includes(q) ||
                c.issue_category.toLowerCase().includes(q) ||
                c.priority.toLowerCase().includes(q) ||
                String(c.id).includes(q)
            )
        }

        return result
    }, [complaints, filter, search])

    return (
        <div className="view-enter">
            <div className="page-header">
                <h2>Complaint History</h2>
                <p>Browse and filter all recorded maintenance complaints</p>
            </div>

            <div className="table-card">
                <div className="table-toolbar">
                    <div className="search-input-wrapper">
                        <Search size={15} className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search complaints..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {FILTERS.map(f => (
                        <button
                            key={f.key}
                            className={`filter-btn${filter === f.key ? ' active' : ''}`}
                            onClick={() => setFilter(f.key)}
                        >
                            {f.icon}
                            {f.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-overlay">
                        <div className="spinner" />
                        <span>Loading complaints...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <Inbox size={40} strokeWidth={1.5} />
                        <h3>No complaints found</h3>
                        <p>Try adjusting your search or filter to find what you're looking for.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Complaint</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(c => (
                                    <tr key={c.id}>
                                        <td className="id-col">#{c.id}</td>
                                        <td><Badge type={c.issue_category} label={c.issue_category} /></td>
                                        <td><Badge type={c.priority} label={c.priority} /></td>
                                        <td className="complaint-text" title={c.original_complaint}>
                                            {c.original_complaint}
                                        </td>
                                        <td className="timestamp">{formatTime(c.timestamp)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default History
