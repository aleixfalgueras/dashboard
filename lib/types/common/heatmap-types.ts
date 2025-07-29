// Common heatmap interfaces used across all platforms
export interface HeatmapCell {
  dayOfWeek: number // 1-7 (Monday to Sunday)
  hourBlock: number // 0, 3, 6, 9, 12, 15, 18, 21
  count: number // Generic count field that can represent posts, videos, etc.
}

export type HeatmapData = HeatmapCell[]