const API_BASE = '';

export async function fetchStats() {
    const res = await fetch(`${API_BASE}/api/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
}

export async function fetchComplaints() {
    const res = await fetch(`${API_BASE}/api/complaints`);
    if (!res.ok) throw new Error('Failed to fetch complaints');
    const data = await res.json();
    return data.complaints || [];
}

export async function submitComplaint(complaint) {
    const res = await fetch(`${API_BASE}/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaint }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Server error');
    }
    return res.json();
}
