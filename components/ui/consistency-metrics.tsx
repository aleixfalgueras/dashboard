import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CalendarCheck, CalendarX, TrendingUp, AlertCircle, Flame, HelpCircle } from 'lucide-react'
import { useTranslations } from '@/lib/translations/context'
import {ConsistencyMetrics} from "@/lib/types/dashboard-types";

interface ConsistencyMetricsComponentProps {
  data: ConsistencyMetrics
}

export function ConsistencyMetricsComponent({ data }: ConsistencyMetricsComponentProps) {
  const t = useTranslations('consistency')
  
  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-green-500"/>
            <span className="font-medium">{t('activeDays')}</span>
          </div>
          <span className="text-sm font-medium">{data.activeDays}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarX className="h-4 w-4 text-red-500"/>
            <span className="font-medium">{t('inactiveDays')}</span>
          </div>
          <span className="text-sm font-medium">{data.inactiveDays}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500"/>
            <span className="font-medium">{t('dailyConsistencyRate')}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  {t('dailyConsistencyTooltip')}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="text-sm font-medium">{data.dailyConsistencyRate}%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500"/>
            <span className="font-medium">{t('longestSilence')}</span>
          </div>
          <span className="text-sm font-medium">{data.longestSilence} {data.longestSilence === 1 ? t('day') : t('days')}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-accent"/>
            <span className="font-medium">{t('longestActiveStreak')}</span>
          </div>
          <span className="text-sm font-medium">{data.longestActiveStreak} {data.longestActiveStreak === 1 ? t('day') : t('days')}</span>
        </div>
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500"/>
              <span className="font-medium">{t('consistencyScore')}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    {t('consistencyScoreTooltip')}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{data.consistencyScore}/100</span>
              <div className="w-16 h-2 bg-secondary rounded-full">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                  style={{ width: `${data.consistencyScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}