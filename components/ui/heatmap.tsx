import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTranslations } from "@/lib/translations/context"

import {HeatmapCell, HeatmapData} from "@/lib/types/dashboard-types";

interface HeatmapComponentProps {
  data: HeatmapData
  itemType: {
    singular: string
    plural: string
  }
  getCountFromCell: (cell: HeatmapCell) => number // Generic accessor for count property
}

export function HeatmapComponent({ data, itemType, getCountFromCell }: HeatmapComponentProps) {
  const tHeatmap = useTranslations('heatmap')
  const days = [tHeatmap('days.mon'), tHeatmap('days.tue'), tHeatmap('days.wed'), tHeatmap('days.thu'), tHeatmap('days.fri'), tHeatmap('days.sat'), tHeatmap('days.sun')]
  const hours = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm']

  // Find max value for color scaling
  const maxCount = Math.max(...data.map(cell => getCountFromCell(cell)), 1)
  
  // Get color intensity based on count
  const getColorOpacity = (count: number) => {
    if (count === 0) return 0
    return Math.max(0.1, count / maxCount)
  }
  
  return (
    <TooltipProvider>
      <div className="w-full overflow-x-auto">
        <div className="inline-block">
          {/* Time labels */}
          <div className="flex mb-1">
            <div className="w-16"></div> {/* Spacer to match day label width */}
            <div className="w-1"></div>   {/* Spacer to match gap */}
            <div className="flex gap-1">
              {hours.map((hour, i) => (
                <div key={i} className="w-12 text-center text-xs text-muted-foreground">
                  {hour}
                </div>
              ))}
            </div>
          </div>
          
          {/* Heatmap grid */}
          <div className="space-y-1">
            {days.map((day, dayIndex) => (
              <div key={dayIndex} className="flex items-center gap-1">
                <div className="w-16 text-xs text-muted-foreground text-right">
                  {day}
                </div>
                <div className="flex gap-1">
                  {hours.map((_, hourIndex) => {
                    const cell = data.find(
                      c => c.dayOfWeek === dayIndex + 1 && c.hourBlock === hourIndex * 3
                    )
                    const count = cell ? getCountFromCell(cell) : 0
                    
                    return (
                      <Tooltip key={hourIndex}>
                        <TooltipTrigger asChild>
                          <div
                            className="w-12 h-12 rounded-sm border border-border cursor-pointer hover:border-accent transition-colors"
                            style={{
                              backgroundColor: count > 0 
                                ? `hsl(var(--accent) / ${getColorOpacity(count)})`
                                : 'hsl(var(--muted) / 0.3)'
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            {day} {hours[hourIndex]}-{hourIndex === 7 ? '12am' : hours[hourIndex + 1]}
                          </p>
                          <p className="text-sm font-medium">
                            {count} {count === 1 ? itemType.singular : itemType.plural}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm border border-border" style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }} />
              <span className="text-xs text-muted-foreground">No {itemType.plural}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--accent) / 0.3)' }} />
              <span className="text-xs text-muted-foreground">Few {itemType.plural}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--accent) / 1)' }} />
              <span className="text-xs text-muted-foreground">Many {itemType.plural}</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}