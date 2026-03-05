import { CheckCircle2, XCircle, Info } from 'lucide-react'

function Toast({ message, type }) {
    const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? XCircle : Info
    const color = type === 'success' ? '#34d399' : type === 'error' ? '#ef4444' : '#06b6d4'

    return (
        <div className={`toast ${type}`}>
            <Icon size={18} color={color} />
            <span>{message}</span>
        </div>
    )
}

export default Toast
