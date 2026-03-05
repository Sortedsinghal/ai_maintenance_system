import { useState } from 'react'
import { submitComplaint } from '../api'
import { Send, CheckCircle2, Loader2 } from 'lucide-react'

const CATEGORY_COLORS = {
    Electrical: 'var(--color-electrical)',
    Mechanical: 'var(--color-mechanical)',
    Sensor: 'var(--color-sensor)',
    Unknown: 'var(--color-unknown)',
}

const PRIORITY_COLORS = {
    High: 'var(--color-high)',
    Medium: 'var(--color-medium)',
    Low: 'var(--color-low)',
}

function SubmitComplaint({ onSuccess, onError }) {
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!text.trim()) return

        setLoading(true)
        setResult(null)

        try {
            const data = await submitComplaint(text.trim())
            setResult(data)
            setText('')
            onSuccess()
        } catch (err) {
            onError(`Error: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="view-enter">
            <div className="page-header">
                <h2>Submit Complaint</h2>
                <p>Describe a maintenance issue — our AI will analyze and categorize it instantly</p>
            </div>

            <div className="complaint-form-wrapper">
                <div className="form-card">
                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div className="form-group">
                            <label className="form-label" htmlFor="complaintInput">
                                Describe the Issue
                            </label>
                            <textarea
                                className="form-textarea"
                                id="complaintInput"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="e.g. Sparking wires observed near the main generator during morning inspection. Burning smell detected."
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading || !text.trim()}>
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="spin-icon" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    Analyze &amp; Submit
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {result && (
                    <div className="result-panel">
                        <div className="result-card">
                            <div className="result-header">
                                <div className="result-header-icon">
                                    <CheckCircle2 size={20} color="white" />
                                </div>
                                <h3>Analysis Complete</h3>
                            </div>
                            <div className="result-grid">
                                <div className="result-item">
                                    <div className="result-item-label">Record ID</div>
                                    <div className="result-item-value" style={{ color: 'var(--accent-primary)' }}>
                                        #{result.id}
                                    </div>
                                </div>
                                <div className="result-item">
                                    <div className="result-item-label">Category</div>
                                    <div
                                        className="result-item-value"
                                        style={{ color: CATEGORY_COLORS[result.issue_category] || 'inherit' }}
                                    >
                                        {result.issue_category}
                                    </div>
                                </div>
                                <div className="result-item">
                                    <div className="result-item-label">Priority</div>
                                    <div
                                        className="result-item-value"
                                        style={{ color: PRIORITY_COLORS[result.priority] || 'inherit' }}
                                    >
                                        {result.priority}
                                    </div>
                                </div>
                                <div className="result-item">
                                    <div className="result-item-label">Complaint</div>
                                    <div
                                        className="result-item-value"
                                        style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}
                                    >
                                        {result.original_complaint}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SubmitComplaint
