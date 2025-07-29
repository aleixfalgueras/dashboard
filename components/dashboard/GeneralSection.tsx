'use client'

import { GeneralMetrics } from "@/lib/types/dashboard-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Eye, TrendingUp, Target, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";

interface GeneralSectionProps {
  metrics: GeneralMetrics;
}

interface TooltipData {
  month: string;
  value: number;
  type: string;
}

export function GeneralSection({ metrics }: GeneralSectionProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; data: TooltipData } | null>(null);
  
  // Auto-hide tooltip after delay
  useEffect(() => {
    if (hoveredPoint) {
      const timer = setTimeout(() => {
        setHoveredPoint(null);
      }, 1000); // Hide after 1.5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [hoveredPoint]);

  // Generate chart data for follower growth forecast
  const generateChartData = () => {
    const currentFollowers = metrics.totalFollowers;
    const today = new Date();
    
    // Generate next 6 months starting from current month
    const months = Array.from({ length: 6 }, (_, index) => {
      const futureDate = new Date(today.getFullYear(), today.getMonth() + index, 1);
      return futureDate.toLocaleDateString('en-US', { month: 'short' });
    });
    
    // Generate forward-looking forecast data
    return months.map((month, index) => {
      // Current trend: modest 2% monthly growth starting from current followers
      const monthlyGrowthRate = 0.02;
      const currentTrend = Math.round(currentFollowers * Math.pow(1 + monthlyGrowthRate, index));
      
      // 15% growth forecast: distributed over 6 months starting from current followers
      const forecastGrowthRate = 0.15 / 6; // ~2.5% per month to reach 15% total
      const forecast = Math.round(currentFollowers * Math.pow(1 + forecastGrowthRate, index));
      
      return {
        month,
        current: currentTrend,
        forecast: forecast,
      };
    });
  };

  const chartData = generateChartData();

  // Simple SVG Chart Component
  const SimpleLineChart = () => {
    const width = 600;
    const height = 250;
    const padding = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Calculate min/max values for scaling
    const allValues = chartData.flatMap(d => [d.current, d.forecast]);
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const valueRange = maxValue - minValue;

    // Scale functions
    const xScale = (index: number) => (index / (chartData.length - 1)) * chartWidth;
    const yScale = (value: number) => chartHeight - ((value - minValue) / valueRange) * chartHeight;

    // Generate path strings
    const currentPath = chartData.map((d, i) => 
      `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.current)}`
    ).join(' ');

    const forecastPath = chartData.map((d, i) => 
      `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.forecast)}`
    ).join(' ');

    // Generate area path for forecast fill
    const forecastAreaPath = [
      // Start at bottom left
      `M ${xScale(0)} ${chartHeight}`,
      // Go up to first forecast point
      `L ${xScale(0)} ${yScale(chartData[0].forecast)}`,
      // Follow the forecast line
      ...chartData.slice(1).map((d, i) => 
        `L ${xScale(i + 1)} ${yScale(d.forecast)}`
      ),
      // Go down to bottom right
      `L ${xScale(chartData.length - 1)} ${chartHeight}`,
      // Close the path
      'Z'
    ].join(' ');

    return (
      <div 
        className="relative w-full h-[300px] flex items-center justify-center"
        onMouseLeave={() => setHoveredPoint(null)}
      >
        <svg width={width} height={height} className="overflow-visible">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width={chartWidth} height={chartHeight} x={padding.left} y={padding.top} fill="url(#grid)" />
          
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const value = minValue + ratio * valueRange;
            const y = padding.top + chartHeight - ratio * chartHeight;
            return (
              <g key={ratio}>
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-muted-foreground"
                >
                  {(value / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {chartData.map((d, i) => (
            <text
              key={i}
              x={padding.left + xScale(i)}
              y={height - 10}
              textAnchor="middle"
              className="text-xs fill-muted-foreground"
            >
              {d.month}
            </text>
          ))}

          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Forecast area fill */}
            <path
              d={forecastAreaPath}
              fill="hsl(var(--accent))"
              fillOpacity="0.2"
              className="transition-colors"
            />

            {/* Current trend line */}
            <path
              d={currentPath}
              fill="none"
              stroke="hsl(var(--foreground))"
              strokeWidth="2"
              className="transition-colors"
            />

            {/* Forecast line */}
            <path
              d={forecastPath}
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="transition-colors"
            />

            {/* Data points for interactivity */}
            {chartData.map((d, i) => (
              <g key={i}>
                {/* Current trend point */}
                <circle
                  cx={xScale(i)}
                  cy={yScale(d.current)}
                  r="4"
                  fill="hsl(var(--foreground))"
                  className="cursor-pointer hover:r-6 transition-all"
                  onMouseEnter={(e) => setHoveredPoint({
                    x: e.clientX + 15,
                    y: e.clientY - 50,
                    data: { month: d.month, value: d.current, type: 'Current Trend' }
                  })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {/* Forecast point */}
                <circle
                  cx={xScale(i)}
                  cy={yScale(d.forecast)}
                  r="4"
                  fill="hsl(var(--accent))"
                  className="cursor-pointer hover:r-6 transition-all"
                  onMouseEnter={(e) => setHoveredPoint({
                    x: e.clientX + 15,
                    y: e.clientY - 50,
                    data: { month: d.month, value: d.forecast, type: '15% Growth Forecast' }
                  })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}
          </g>
        </svg>

        {/* Legend */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-foreground"></div>
            <span>Current Trend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-accent" style={{ backgroundImage: 'repeating-linear-gradient(to right, hsl(var(--accent)) 0, hsl(var(--accent)) 3px, transparent 3px, transparent 6px)' }}></div>
            <span>15% Growth Forecast</span>
          </div>
        </div>

        {/* Custom tooltip */}
        {hoveredPoint && (
          <div 
            className="fixed z-50 bg-background border border-border rounded-md p-2 text-xs shadow-lg pointer-events-none"
            style={{ 
              left: hoveredPoint.x, 
              top: hoveredPoint.y
            }}
          >
            <div className="font-medium">{hoveredPoint.data.type}</div>
            <div>{hoveredPoint.data.month}: {hoveredPoint.data.value.toLocaleString()}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Overview</h2>
        <p className="text-muted-foreground">Cross-platform analytics summary</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-accent accent-gradient-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {metrics.totalFollowers.toLocaleString()}
            </div>
            <CardDescription>Across all platforms</CardDescription>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-1">
              <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Calculated as (Likes + Comments + Shares) ÷ Views across all video posts
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {metrics.globalAvgEngagement}%
            </div>
            <CardDescription>Video posts only</CardDescription>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-400 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Views</CardTitle>
            <Eye className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {metrics.avgViews.toLocaleString()}
            </div>
            <CardDescription>Per video post</CardDescription>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-400 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consistency</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {metrics.consistency}
            </div>
            <CardDescription>Coming soon</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Follower Growth Forecast Chart */}
      <Card className="col-span-full border-l-4 border-l-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Follower Growth Forecast
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardTitle>
          <CardDescription>
            Current trend vs. 15% growth projection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleLineChart />
        </CardContent>
      </Card>
      </div>
    </TooltipProvider>
  );
}