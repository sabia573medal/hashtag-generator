import { hashtagCategories, trendingHashtags, engagementBoosters, HashtagCategory } from './hashtagDatabase'

export interface AnalysisResult {
  category: string
  confidence: number
  hashtags: string[]
  reasoning: string
}

export class HashtagAnalyzer {
  private categories: HashtagCategory[]

  constructor() {
    this.categories = hashtagCategories
  }

  // テキスト分析（改善版）
  analyzeText(text: string): AnalysisResult[] {
    const results: AnalysisResult[] = []
    const cleanText = this.cleanText(text)
    const keywords = this.extractKeywords(cleanText)

    // キーワードが少なすぎる場合は分析しない
    if (keywords.length === 0) {
      return results
    }

    for (const category of this.categories) {
      const matchScore = this.calculateCategoryMatch(keywords, category)
      if (matchScore > 0.1) {
        const hashtags = this.generateCategoryHashtags(keywords, category)
        results.push({
          category: category.name,
          confidence: matchScore,
          hashtags,
          reasoning: this.generateReasoning(keywords, category, matchScore)
        })
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence)
  }

  // テキストのクリーンアップ
  private cleanText(text: string): string {
    return text
      .replace(/[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // キーワード抽出（改善版）
  private extractKeywords(text: string): string[] {
    const words = text.split(/\s+/).filter(word => word.length > 0)
    const keywords: string[] = []

    // 無視する単語リスト（ストップワード）
    const stopWords = new Set([
      'おはよう', 'おやすみ', 'こんにちは', 'こんばんは', 'ありがとう', 'すみません', 'ごめんなさい',
      '今日', '明日', '昨日', '今', '現在', 'これ', 'それ', 'あれ', 'どれ', 'ここ', 'そこ', 'あそこ',
      '私', '僕', '俺', '俺様', '自分', '自身', '一人', '二人', 'みんな', '皆さん',
      'する', 'なる', 'できる', 'ある', 'いる', 'いく', 'くる', 'いくら', 'いくつ',
      'もの', 'こと', 'とき', 'ところ', 'ため', 'わけ', 'はず', 'べき', 'らしい', 'ようだ'
    ])

    // 基本的な形態素解析（簡易版）
    for (const word of words) {
      if (word.length >= 2 && !stopWords.has(word.toLowerCase())) {
        keywords.push(word.toLowerCase())
        
        // 部分文字列もキーワードとして追加（ただしストップワードは除く）
        if (word.length >= 3) {
          for (let i = 0; i <= word.length - 3; i++) {
            const subWord = word.substring(i, i + 3)
            if (subWord.length >= 3 && !stopWords.has(subWord.toLowerCase())) {
              keywords.push(subWord.toLowerCase())
            }
          }
        }
      }
    }

    return [...new Set(keywords)]
  }

  // カテゴリマッチ度計算
  private calculateCategoryMatch(keywords: string[], category: HashtagCategory): number {
    let matchCount = 0
    
    for (const keyword of keywords) {
      for (const categoryKeyword of category.keywords) {
        if (keyword.includes(categoryKeyword.toLowerCase()) || 
            categoryKeyword.toLowerCase().includes(keyword)) {
          matchCount++
          break
        }
      }
    }

    return keywords.length > 0 ? matchCount / keywords.length : 0
  }

  // カテゴリ別ハッシュタグ生成
  private generateCategoryHashtags(keywords: string[], category: HashtagCategory): string[] {
    const hashtags: string[] = []
    
    // キーワードから直接ハッシュタグ生成
    for (const keyword of keywords) {
      if (keyword.length >= 2 && !hashtags.includes(`#${keyword}`)) {
        hashtags.push(`#${keyword}`)
      }
    }

    // カテゴリ固有のハッシュタグを追加
    for (const hashtag of category.hashtags) {
      if (!hashtags.includes(`#${hashtag}`)) {
        hashtags.push(`#${hashtag}`)
      }
    }

    return hashtags
  }

  // 理由生成
  private generateReasoning(keywords: string[], category: HashtagCategory, score: number): string {
    const matchedKeywords = keywords.filter(keyword => 
      category.keywords.some(catKeyword => 
        keyword.includes(catKeyword.toLowerCase()) || 
        catKeyword.toLowerCase().includes(keyword)
      )
    )

    if (matchedKeywords.length > 0) {
      return `「${matchedKeywords.slice(0, 3).join('」「')}」というキーワードから${category.name}カテゴリが関連性高いと判断しました（一致度: ${Math.round(score * 100)}%）`
    }

    return `${category.name}カテゴリの関連性が検出されました（一致度: ${Math.round(score * 100)}%）`
  }

  // トレンドハッシュタグ追加（改善版）
  addTrendingHashtags(hashtags: string[], count: number = 3): string[] {
    // 関連性のあるキーワードが少ない場合はトレンドハッシュタグを追加しない
    if (hashtags.length < 3) {
      return hashtags
    }

    const shuffled = [...trendingHashtags].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, Math.min(count, 2)) // 最大2個に制限
    
    for (const trend of selected) {
      if (!hashtags.includes(`#${trend}`)) {
        hashtags.push(`#${trend}`)
      }
    }

    return hashtags
  }

  // エンゲージメント向上ハッシュタグ追加（改善版）
  addEngagementBoosters(hashtags: string[], count: number = 2): string[] {
    // 関連性のあるキーワードが少ない場合は追加しない
    if (hashtags.length < 3) {
      return hashtags
    }

    const shuffled = [...engagementBoosters].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, Math.min(count, 1)) // 最大1個に制限
    
    for (const booster of selected) {
      if (!hashtags.includes(`#${booster}`)) {
        hashtags.push(`#${booster}`)
      }
    }

    return hashtags
  }

  // ハッシュタグ最適化
  optimizeHashtags(hashtags: string[], maxCount: number = 20): string[] {
    // 重複除去
    const unique = [...new Set(hashtags)]
    
    // 長さでソート（短いものを優先）
    const sorted = unique.sort((a, b) => a.length - b.length)
    
    // 指定数に制限
    return sorted.slice(0, maxCount)
  }

  // ハッシュタグ効果予測
  predictEffectiveness(hashtags: string[]): {
    score: number
    suggestions: string[]
  } {
    let score = 50 // 基本スコア

    // ハッシュタグ数による評価
    if (hashtags.length >= 10 && hashtags.length <= 20) {
      score += 20
    } else if (hashtags.length < 5) {
      score -= 20
    } else if (hashtags.length > 30) {
      score -= 10
    }

    // トレンドハッシュタグ含有率
    const trendCount = hashtags.filter(tag => 
      trendingHashtags.some(trend => tag.includes(trend))
    ).length
    score += trendCount * 3

    // エンゲージメント向上ハッシュタグ含有率
    const boosterCount = hashtags.filter(tag => 
      engagementBoosters.some(booster => tag.includes(booster))
    ).length
    score += boosterCount * 5

    // カテゴリ多様性
    const categories = new Set()
    for (const tag of hashtags) {
      for (const category of this.categories) {
        if (category.hashtags.some(catTag => tag.includes(catTag))) {
          categories.add(category.name)
        }
      }
    }
    score += categories.size * 2

    const suggestions: string[] = []
    if (hashtags.length < 10) {
      suggestions.push('ハッシュタグ数を10〜20個に増やすと効果が上がります')
    }
    if (trendCount === 0) {
      suggestions.push('トレンドハッシュタグを追加すると露出が増えます')
    }
    if (boosterCount === 0) {
      suggestions.push('エンゲージメント向上ハッシュタグを入れるとコメントが増えます')
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      suggestions
    }
  }
}
