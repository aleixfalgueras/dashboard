export interface HashtagAnalysis {
  tag: string
  count: number
}

export function analyzeHashtagsGeneric<T extends { hashtags: string[] }>(
  posts: T[], 
  limit: number = 10
): HashtagAnalysis[] {
  const hashtagCount: Record<string, number> = {}
  
  posts.forEach(post => {
    post.hashtags.forEach((tag: string) => {
      hashtagCount[tag] = (hashtagCount[tag] || 0) + 1
    })
  })
  
  return Object.entries(hashtagCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }))
}