export interface PracticalExample {
  text: string
  category: string
  expectedHashtags: string[]
  context: string
}

export class PracticalAnalyzer {
  private examples: PracticalExample[]

  constructor() {
    this.examples = [
      // グルメ系
      {
        text: "今日は新宿のラーメン屋さんで醤油ラーメン食べた！麺がすごい美味しかった",
        category: "グルメ",
        expectedHashtags: ["#ラーメン", "#醤油ラーメン", "#新宿グルメ", "#麺", "#美味しい", "#ラーメン好き", "#ランチ", "#食べログ", "#新宿", "#グルメ"],
        context: "具体的な料理と場所を含むグルメ投稿"
      },
      {
        text: "渋谷のカフェでフレンチトーストとカフェラテをいただきました。おしゃれな雰囲気で最高でした",
        category: "グルメ",
        expectedHashtags: ["#カフェ", "#フレンチトースト", "#カフェラテ", "#渋谷カフェ", "#おしゃれ", "#スイーツ", "#カフェ巡り", "#ランチ", "#渋谷", "#グルメ"],
        context: "カフェでの軽食・スイーツ投稿"
      },
      
      // 旅行系
      {
        text: "沖縄旅行2日目！美ら海水族館でジンベエザメ見てきた。海が本当に綺麗だった",
        category: "旅行",
        expectedHashtags: ["#沖縄旅行", "#美ら海水族館", "#ジンベエザメ", "#海", "#水族館", "#沖縄", "#旅行", "#観光", "#美しい海", "#水族館好き"],
        context: "具体的な観光地を含む旅行投稿"
      },
      {
        text: "京都の紅葉が見頃！清水寺から見る京都市街の紅葉が絶景でした",
        category: "旅行",
        expectedHashtags: ["#紅葉", "#京都", "#清水寺", "#絶景", "#紅葉狩り", "#秋", "#京都旅行", "#観光", "#風景写真", "#日本の美"],
        context: "季節の風景を含む旅行投稿"
      },

      // ファッション系
      {
        text: "今日のコーデはユニクロのデニムに無印のTシャツ。シンプルで落ち着いた感じに",
        category: "ファッション",
        expectedHashtags: ["#コーデ", "#ユニクロ", "#無印良品", "#デニム", "#シンプルコーデ", "#今日のコーデ", "#カジュアル", "#おしゃれ", "#ファッション", "#春コーデ"],
        context: "具体的なブランドを含むファッション投稿"
      },
      {
        text: "新作のスニーカーをゲット！Nikeのエアマックス90でランニングに行ってきた",
        category: "ファッション",
        expectedHashtags: ["#スニーカー", "#Nike", "#エアマックス", "#ランニング", "#新作", "#スニーカー好き", "#運動", "#ナイキ", "#スポーツ", "#ファッション"],
        context: "スポーツウェア・シューズ投稿"
      },

      // 仕事・勉強系
      {
        text: "今日からリモートワーク！在宅勤務で集中してプログラミングできます",
        category: "仕事・勉強",
        expectedHashtags: ["#リモートワーク", "#在宅勤務", "#テレワーク", "#プログラミング", "#働き方", "#IT", "#エンジニア", "#在宅", "#仕事", "#集中"],
        context: "リモートワークに関する投稿"
      },
      {
        text: "TOEICの勉強中！今日はリスニングセクションを重点的に練習しました",
        category: "仕事・勉強",
        expectedHashtags: ["#TOEIC", "#英語学習", "#リスニング", "#勉強", "#資格", "#英語", "#学習", "#勉強垢", "#TOEIC勉強", "#語学"],
        context: "資格勉強に関する投稿"
      },

      // ホビー系
      {
        text: "週末はプラモデル作成！ガンダムのMGを組み立て中。細かいパーツが大変",
        category: "ホビー・趣味",
        expectedHashtags: ["#プラモデル", "#ガンダム", "#ガンプラ", "#MG", "#模型", "#週末", "#趣味", "#プラモデル製作", "#ガンダム好き", "#ホビー"],
        context: "プラモデル製作に関する投稿"
      },
      {
        text: "今日は釣りに！バス釣りで50cmのブラックバスをゲットしました",
        category: "ホビー・趣味",
        expectedHashtags: ["#釣り", "#バス釣り", "#ブラックバス", "#フィッシング", "#釣果", "#ルアー", "#釣り好き", "#週末", "#アウトドア", "#釣り場"],
        context: "釣りに関する投稿"
      },

      // ペット系
      {
        text: "うちの猫ちゃんが猫じゃらしで遊んでいます。可愛すぎる！",
        category: "ペット",
        expectedHashtags: ["#猫", "#猫ちゃん", "#猫のいる暮らし", "#可愛い", "#猫じゃらし", "#ペット", "#猫好き", "#猫動画", "#にゃんこ", "#猫の日常"],
        context: "猫の日常に関する投稿"
      },
      {
        text: "犬の散歩中に公園で他の犬と遊んできた。すごく楽しそうでした",
        category: "ペット",
        expectedHashtags: ["#犬", "#散歩", "#ドッグラン", "#犬の散歩", "#犬好き", "#わんこ", "#公園", "#犬の日常", "#ペット", "#楽しい"],
        context: "犬の散歩に関する投稿"
      }
    ]
  }

  // 実用的な例から学習
  analyzeFromExamples(text: string): {
    category: string
    hashtags: string[]
    confidence: number
    reasoning: string
  } | null {
    const cleanText = this.cleanText(text)
    const textWords = this.extractWords(cleanText)

    let bestMatch: {
      example: PracticalExample
      score: number
      matchedWords: string[]
    } | null = null

    // 各例と比較して最も類似度の高いものを見つける
    for (const example of this.examples) {
      const exampleWords = this.extractWords(example.text)
      const matchedWords = this.findMatchingWords(textWords, exampleWords)
      const score = matchedWords.length / Math.max(textWords.length, exampleWords.length)

      if (score > 0.3 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = {
          example,
          score,
          matchedWords
        }
      }
    }

    if (bestMatch && bestMatch.score > 0.4) {
      return {
        category: bestMatch.example.category,
        hashtags: bestMatch.example.expectedHashtags,
        confidence: bestMatch.score,
        reasoning: `「${bestMatch.matchedWords.slice(0, 3).join('」「')}」という単語から${bestMatch.example.category}の投稿と判断しました。例：${bestMatch.example.context}`
      }
    }

    return null
  }

  // テキストのクリーンアップ
  private cleanText(text: string): string {
    return text
      .replace(/[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // 単語抽出
  private extractWords(text: string): string[] {
    return text
      .split(/\s+/)
      .filter(word => word.length >= 2)
      .map(word => word.toLowerCase())
      .filter((word, index, self) => self.indexOf(word) === index)
  }

  // マッチング単語検索
  private findMatchingWords(words1: string[], words2: string[]): string[] {
    const matched: string[] = []

    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1 === word2 || 
            word1.includes(word2) || 
            word2.includes(word1)) {
          matched.push(word1)
          break
        }
      }
    }

    return matched
  }

  // 実用的な提案を生成
  generatePracticalSuggestions(text: string): string[] {
    const suggestions: string[] = []

    // 文脈に基づいた提案
    if (text.includes('食べ') || text.includes('飲み') || text.includes('ラーメン') || text.includes('カフェ')) {
      suggestions.push('食べ物の具体的な名前を入れると効果的です')
      suggestions.push('場所情報を追加すると露出が増えます')
    }

    if (text.includes('行った') || text.includes('旅行') || text.includes('観光')) {
      suggestions.push('地名や観光地の名前を入れると良いです')
      suggestions.push('季節や天気の情報を追加すると共感を呼びます')
    }

    if (text.includes('着た') || text.includes('コーデ') || text.includes('服')) {
      suggestions.push('ブランド名や具体的なアイテム名を入れると参考になります')
      suggestions.push('シーン（仕事、デートなど）を明記すると効果的です')
    }

    if (text.includes('勉強') || text.includes('仕事') || text.includes('資格')) {
      suggestions.push('具体的な科目や資格名を入れると同士が集まります')
      suggestions.push('学習時間や進捗状況を追加するとモチベーションが上がります')
    }

    return suggestions
  }
}
