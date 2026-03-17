interface Morpheme {
  word: string
  pos: string // 品詞
  reading?: string
  base?: string // 原形
}

interface ContextPattern {
  pattern: string[]
  category: string
  hashtags: string[]
  weight: number
  description: string
}

export class AdvancedAnalyzer {
  private contextPatterns: ContextPattern[]
  private morphemeDict: Map<string, Morpheme[]>

  constructor() {
    this.contextPatterns = this.initializeContextPatterns()
    this.morphemeDict = this.initializeMorphemeDict()
  }

  // 高度な形態素解析
  analyzeMorphemes(text: string): Morpheme[] {
    const morphemes: Morpheme[] = []
    const words = text.split(/\s+/)

    for (const word of words) {
      const morphemeData = this.morphemeDict.get(word.toLowerCase())
      if (morphemeData) {
        morphemes.push(...morphemeData)
      } else {
        // 簡易的な形態素解析
        morphemes.push(this.simpleMorphemeAnalysis(word))
      }
    }

    return morphemes
  }

  // 文脈理解と意味解析
  analyzeContext(text: string): {
    category: string
    confidence: number
    hashtags: string[]
    context: string
    reasoning: string
  } | null {
    const morphemes = this.analyzeMorphemes(text)
    const baseWords = morphemes.map(m => m.base || m.word).filter(w => w.length >= 2)

    let bestMatch: ContextPattern | null = null
    let bestScore = 0

    for (const pattern of this.contextPatterns) {
      const score = this.calculatePatternMatch(baseWords, pattern)
      if (score > bestScore && score > 0.3) {
        bestScore = score
        bestMatch = pattern
      }
    }

    if (bestMatch) {
      return {
        category: bestMatch.category,
        confidence: bestScore,
        hashtags: this.generateContextualHashtags(baseWords, bestMatch),
        context: bestMatch.description,
        reasoning: this.generateContextReasoning(baseWords, bestMatch, bestScore)
      }
    }

    return null
  }

  // 意味的なハッシュタグ生成
  generateSemanticHashtags(text: string): string[] {
    const morphemes = this.analyzeMorphemes(text)
    const hashtags: string[] = []

    // 動詞から行動ハッシュタグ
    const verbs = morphemes.filter(m => m.pos === '動詞')
    for (const verb of verbs) {
      const actionHashtags = this.generateActionHashtags(verb.word)
      hashtags.push(...actionHashtags)
    }

    // 名詞から対象ハッシュタグ
    const nouns = morphemes.filter(m => m.pos === '名詞')
    for (const noun of nouns) {
      const objectHashtags = this.generateObjectHashtags(noun.word)
      hashtags.push(...objectHashtags)
    }

    // 形容詞から感情ハッシュタグ
    const adjectives = morphemes.filter(m => m.pos === '形容詞')
    for (const adj of adjectives) {
      const emotionHashtags = this.generateEmotionHashtags(adj.word)
      hashtags.push(...emotionHashtags)
    }

    return [...new Set(hashtags)]
  }

  // 文脈パターンの初期化
  private initializeContextPatterns(): ContextPattern[] {
    return [
      // 食事パターン
      {
        pattern: ['食べる', '飲む', 'ラーメン', 'カフェ', '美味しい', 'ランチ', 'ディナー'],
        category: '食事',
        hashtags: ['#美味しい', '#食べ物', '#グルメ', '#カフェ', '#ランチ', '#ディナー', '#料理'],
        weight: 0.9,
        description: '食事や飲食に関する投稿'
      },
      // 旅行パターン
      {
        pattern: ['旅行', '行く', '観光', 'ホテル', '飛行機', '新幹線', '景色', '写真'],
        category: '旅行',
        hashtags: ['#旅行', '#観光', '#景色', '#写真', '#ホテル', '#旅', '#風景'],
        weight: 0.9,
        description: '旅行や観光に関する投稿'
      },
      // 買い物パターン
      {
        pattern: ['買う', 'ショッピング', '新品', 'セール', 'ブランド', '服', '靴'],
        category: '買い物',
        hashtags: ['#買い物', '#ショッピング', '#新品', '#セール', '#ファッション', '#コーデ'],
        weight: 0.8,
        description: '買い物やショッピングに関する投稿'
      },
      // 仕事パターン
      {
        pattern: ['仕事', '勤務', '会議', 'プロジェクト', 'クライアント', '締め切り', '残業'],
        category: '仕事',
        hashtags: ['#仕事', '#勤務', '#仕事垢', '#業務', '#プロジェクト', '#クライアント'],
        weight: 0.8,
        description: '仕事や業務に関する投稿'
      },
      // 勉強パターン
      {
        pattern: ['勉強', '学習', '資格', '試験', '参考書', '問題集', '練習', '練習する'],
        category: '勉強',
        hashtags: ['#勉強', '#学習', '#資格', '#試験', '#勉強垢', '#学習記録'],
        weight: 0.8,
        description: '勉強や学習に関する投稿'
      },
      // 運動パターン
      {
        pattern: ['運動', 'ジム', 'ランニング', '筋トレ', 'トレーニング', '汗', '走る'],
        category: '運動',
        hashtags: ['#運動', '#ジム', '#ランニング', '#筋トレ', '#トレーニング', '#健康'],
        weight: 0.8,
        description: '運動やフィットネスに関する投稿'
      },
      // ペットパターン
      {
        pattern: ['猫', '犬', 'ペット', '散歩', '餌', '遊ぶ', '可愛い', '動物'],
        category: 'ペット',
        hashtags: ['#猫', '#犬', '#ペット', '#猫のいる暮らし', '#犬のいる暮らし', '#可愛い'],
        weight: 0.9,
        description: 'ペットや動物に関する投稿'
      },
      // 趣味パターン
      {
        pattern: ['ゲーム', '読書', '映画', '音楽', 'アニメ', '漫画', 'プラモデル', '作る'],
        category: '趣味',
        hashtags: ['#ゲーム', '#読書', '#映画', '#音楽', '#アニメ', '#漫画', '#ホビー'],
        weight: 0.7,
        description: '趣味や娯楽に関する投稿'
      }
    ]
  }

  // 形態素辞書の初期化（簡易版）
  private initializeMorphemeDict(): Map<string, Morpheme[]> {
    const dict = new Map<string, Morpheme[]>()

    // 動詞
    dict.set('食べる', [{ word: '食べる', pos: '動詞', base: '食べる' }])
    dict.set('飲む', [{ word: '飲む', pos: '動詞', base: '飲む' }])
    dict.set('行く', [{ word: '行く', pos: '動詞', base: '行く' }])
    dict.set('見る', [{ word: '見る', pos: '動詞', base: '見る' }])
    dict.set('作る', [{ word: '作る', pos: '動詞', base: '作る' }])
    dict.set('買う', [{ word: '買う', pos: '動詞', base: '買う' }])
    dict.set('勉強する', [{ word: '勉強する', pos: '動詞', base: '勉強する' }])
    dict.set('運動する', [{ word: '運動する', pos: '動詞', base: '運動する' }])
    dict.set('走る', [{ word: '走る', pos: '動詞', base: '走る' }])
    dict.set('遊ぶ', [{ word: '遊ぶ', pos: '動詞', base: '遊ぶ' }])

    // 名詞
    dict.set('ラーメン', [{ word: 'ラーメン', pos: '名詞', base: 'ラーメン' }])
    dict.set('カフェ', [{ word: 'カフェ', pos: '名詞', base: 'カフェ' }])
    dict.set('旅行', [{ word: '旅行', pos: '名詞', base: '旅行' }])
    dict.set('仕事', [{ word: '仕事', pos: '名詞', base: '仕事' }])
    dict.set('勉強', [{ word: '勉強', pos: '名詞', base: '勉強' }])
    dict.set('ゲーム', [{ word: 'ゲーム', pos: '名詞', base: 'ゲーム' }])
    dict.set('猫', [{ word: '猫', pos: '名詞', base: '猫' }])
    dict.set('犬', [{ word: '犬', pos: '名詞', base: '犬' }])
    dict.set('映画', [{ word: '映画', pos: '名詞', base: '映画' }])
    dict.set('音楽', [{ word: '音楽', pos: '名詞', base: '音楽' }])

    // 形容詞
    dict.set('美味しい', [{ word: '美味しい', pos: '形容詞', base: '美味しい' }])
    dict.set('楽しい', [{ word: '楽しい', pos: '形容詞', base: '楽しい' }])
    dict.set('面白い', [{ word: '面白い', pos: '形容詞', base: '面白い' }])
    dict.set('可愛い', [{ word: '可愛い', pos: '形容詞', base: '可愛い' }])
    dict.set('綺麗', [{ word: '綺麗', pos: '形容詞', base: '綺麗' }])
    dict.set('忙しい', [{ word: '忙しい', pos: '形容詞', base: '忙しい' }])

    return dict
  }

  // 簡易的な形態素解析
  private simpleMorphemeAnalysis(word: string): Morpheme {
    // 動詞の判定
    if (word.endsWith('する') || word.endsWith('る') || word.endsWith('く') || word.endsWith('う')) {
      return { word, pos: '動詞', base: word }
    }
    // 形容詞の判定
    if (word.endsWith('い') && !word.endsWith('ない')) {
      return { word, pos: '形容詞', base: word }
    }
    // その他は名詞
    return { word, pos: '名詞', base: word }
  }

  // パターンマッチングの計算
  private calculatePatternMatch(words: string[], pattern: ContextPattern): number {
    let matchCount = 0
    for (const word of words) {
      if (pattern.pattern.some(p => word.includes(p) || p.includes(word))) {
        matchCount++
      }
    }
    return (matchCount / words.length) * pattern.weight
  }

  // 文脈ハッシュタグ生成
  private generateContextualHashtags(words: string[], pattern: ContextPattern): string[] {
    const hashtags = [...pattern.hashtags]
    
    // マッチした単語をハッシュタグに追加
    for (const word of words) {
      if (pattern.pattern.some(p => word.includes(p) || p.includes(word))) {
        if (!hashtags.includes(`#${word}`)) {
          hashtags.push(`#${word}`)
        }
      }
    }

    return hashtags
  }

  // 文脈理由の生成
  private generateContextReasoning(words: string[], pattern: ContextPattern, score: number): string {
    const matchedWords = words.filter(word => 
      pattern.pattern.some(p => word.includes(p) || p.includes(word))
    )
    
    return `「${matchedWords.slice(0, 3).join('」「')}」という単語から${pattern.description}と判断しました（一致度: ${Math.round(score * 100)}%）`
  }

  // 行動ハッシュタグ生成
  private generateActionHashtags(verb: string): string[] {
    const actionMap: Record<string, string[]> = {
      '食べる': ['#食べる', '#食事', '#グルメ'],
      '飲む': ['#飲む', '#ドリンク', '#カフェ'],
      '行く': ['#行く', '#外出', '#出かける'],
      '見る': ['#見る', '#鑑賞', '#チェック'],
      '作る': ['#作る', '#手作り', '#DIY'],
      '買う': ['#買う', '#買い物', '#ショッピング'],
      '勉強する': ['#勉強', '#学習', '#勉強垢'],
      '運動する': ['#運動', '#トレーニング', '#健康'],
      '走る': ['#走る', '#ランニング', '#ジョギング'],
      '遊ぶ': ['#遊ぶ', '#遊び', '#エンタメ']
    }

    return actionMap[verb] || []
  }

  // 対象ハッシュタグ生成
  private generateObjectHashtags(noun: string): string[] {
    const objectMap: Record<string, string[]> = {
      'ラーメン': ['#ラーメン', '#麺', '#中華'],
      'カフェ': ['#カフェ', '#カフェ巡り', '#スイーツ'],
      '旅行': ['#旅行', '#観光', '#旅'],
      '仕事': ['#仕事', '#勤務', '#業務'],
      'ゲーム': ['#ゲーム', '#ゲーミング', '#ゲーム垢'],
      '猫': ['#猫', '#猫のいる暮らし', '#猫好き'],
      '犬': ['#犬', '#犬のいる暮らし', '#犬好き'],
      '映画': ['#映画', '#映画好き', '#鑑賞'],
      '音楽': ['#音楽', '#音楽好き', '#曲']
    }

    return objectMap[noun] || [`#${noun}`]
  }

  // 感情ハッシュタグ生成
  private generateEmotionHashtags(adjective: string): string[] {
    const emotionMap: Record<string, string[]> = {
      '美味しい': ['#美味しい', '#絶品', '#最高'],
      '楽しい': ['#楽しい', '#楽しい時間', '#ハッピー'],
      '面白い': ['#面白い', '#興味深い', '#知見'],
      '可愛い': ['#可愛い', '#かわいい', '#癒し'],
      '綺麗': ['#綺麗', '#美しい', '#絶景'],
      '忙しい': ['#忙しい', '#多忙', '#仕事']
    }

    return emotionMap[adjective] || []
  }
}
