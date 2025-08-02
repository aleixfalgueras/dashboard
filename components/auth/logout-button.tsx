'use client'

import { signOut } from 'next-auth/react'
import { useTranslations } from '@/lib/translations/context'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
  showText?: boolean
}

export function LogoutButton({ 
  variant = 'outline', 
  size = 'sm',
  showIcon = true,
  showText = true 
}: LogoutButtonProps) {
  const t = useTranslations('auth')
  
  const handleLogout = () => {
    void signOut({ callbackUrl: '/login' })
  }

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      size={size}
    >
      {showIcon && <LogOut className={showText ? "mr-2 h-4 w-4" : "h-4 w-4"} />}
      {showText && t('logout')}
    </Button>
  )
}