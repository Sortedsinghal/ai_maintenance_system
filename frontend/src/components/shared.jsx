export function formatTime(timestamp) {
    if (!timestamp) return '—'
    try {
        const date = new Date(timestamp + 'Z')
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })
    } catch {
        return timestamp
    }
}

export function Badge({ type, label }) {
    const cls = `badge badge-${type.toLowerCase()}`
    return (
        <span className={cls}>
            <span className="badge-dot" />
            {label}
        </span>
    )
}
