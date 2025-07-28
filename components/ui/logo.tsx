import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  clickable?: boolean
  onClick?: () => void
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
}

export function Logo({ size = 'md', className, clickable = false, onClick }: LogoProps) {
  const logoContent = (
    <svg 
      viewBox="0 0 113.36 163.64" 
      className={cn(sizeClasses[size], className, clickable && 'cursor-pointer hover:opacity-80 transition-opacity')}
      onClick={onClick}
    >
      <defs>
        <style>{`.cls-1{fill:#bd2200;}.cls-1,.cls-2{fill-rule:evenodd;stroke-width:0px;}.cls-2{fill:#f1441e;}`}</style>
      </defs>
      <g>
        <path className="cls-2" d="M86.01,33.37V0L28.33,33.07,0,49.33v32.51l86.01-48.47Z"/>
        <path className="cls-1" d="M43,106.05L0,81.84v32.47l27.35,15.69,15.65-23.95Z"/>
        <path className="cls-1" d="M71,57.96l42.36,23.88v-32.51l-27.35-15.69-15.01,24.33Z"/>
        <path className="cls-2" d="M113.36,81.84l-86.01,48.43v33.37l86.01-49.33v-32.47Z"/>
      </g>
    </svg>
  )

  return logoContent
}