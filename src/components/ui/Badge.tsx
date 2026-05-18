interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'info'
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<string, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  neutral: 'bg-slate-100 text-slate-700',
  info: 'bg-blue-100 text-blue-800',
}

export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
