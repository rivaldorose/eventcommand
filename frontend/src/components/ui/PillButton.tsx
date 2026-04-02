import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outlined'
  children: ReactNode
}

export default function PillButton({ variant = 'primary', children, className = '', ...props }: PillButtonProps) {
  const base = 'rounded-full px-5 py-2 text-sm font-medium transition-colors inline-flex items-center gap-2'
  const variants = {
    primary: 'bg-primary text-white hover:bg-gray-800',
    outlined: 'bg-white text-primary border border-primary hover:bg-gray-50',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
