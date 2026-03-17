import { useState } from 'react'
import { HashtagAnalyzer, AnalysisResult } from './hashtagAnalyzer'
import { PracticalAnalyzer } from './practicalAnalyzer'
import { AdvancedAnalyzer } from './advancedAnalyzer'
import { hashtagCategories } from './hashtagDatabase'

function App() {
  const [inputText, setInputText] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [hashtagCount, setHashtagCount] = useState(20)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [effectiveness, setEffectiveness] = useState<{score: number, suggestions: string[]} | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [practicalSuggestions, setPracticalSuggestions] = useState<string[]>([])
  const [semanticAnalysis, setSemanticAnalysis] = useState<{
    category: string
    confidence: number
    hashtags: string[]
    context: string
    reasoning: string
  } | null>(null)

  const analyzer = new HashtagAnalyzer()
  const practicalAnalyzer = new PracticalAnalyzer()
  const advancedAnalyzer = new AdvancedAnalyzer()

  const generateHashtags = async () => {
    if (!inputText.trim()) return

    setIsAnalyzing(true)
    
    // 高度な文脈分析を試みる
    const contextResult = advancedAnalyzer.analyzeContext(inputText)
    
    // 実用的な例との比較
    const practicalResult = practicalAnalyzer.analyzeFromExamples(inputText)
    
    let finalHashtags: string[] = []
    let finalAnalysis: AnalysisResult[] = []
    let finalEffectiveness: {score: number, suggestions: string[]} | null = null

    if (contextResult && contextResult.confidence > 0.5) {
      // 高度な文脈分析が成功した場合
      finalHashtags = contextResult.hashtags.slice(0, hashtagCount)
      finalAnalysis = [{
        category: contextResult.category,
        confidence: contextResult.confidence,
        hashtags: contextResult.hashtags,
        reasoning: contextResult.reasoning
      }]
      setSemanticAnalysis(contextResult)
      setPracticalSuggestions([])
    } else if (practicalResult && practicalResult.confidence > 0.4) {
      // 実用的な例が見つかった場合
      finalHashtags = practicalResult.hashtags.slice(0, hashtagCount)
      finalAnalysis = [{
        category: practicalResult.category,
        confidence: practicalResult.confidence,
        hashtags: practicalResult.hashtags,
        reasoning: practicalResult.reasoning
      }]
      setSemanticAnalysis(null)
      setPracticalSuggestions(practicalAnalyzer.generatePracticalSuggestions(inputText))
    } else {
      // 意味的なハッシュタグ生成
      const semanticHashtags = advancedAnalyzer.generateSemanticHashtags(inputText)
      
      // 従来のAI分析にフォールバック
      const results = analyzer.analyzeText(inputText)
      finalAnalysis = results

      let allHashtags: string[] = [...semanticHashtags]
      
      for (const result of results) {
        allHashtags = [...allHashtags, ...result.hashtags]
      }

      allHashtags = analyzer.addTrendingHashtags(allHashtags, 2)
      allHashtags = analyzer.addEngagementBoosters(allHashtags, 1)
      allHashtags = analyzer.optimizeHashtags(allHashtags, hashtagCount)
      
      finalHashtags = allHashtags
      setSemanticAnalysis(null)
      setPracticalSuggestions([])
    }

    finalEffectiveness = analyzer.predictEffectiveness(finalHashtags)

    setAnalysisResults(finalAnalysis)
    setHashtags(finalHashtags)
    setEffectiveness(finalEffectiveness)

    setIsAnalyzing(false)
  }

  const copyToClipboard = () => {
    const hashtagText = hashtags.join(' ')
    navigator.clipboard.writeText(hashtagText)
  }

  const clearAll = () => {
    setInputText('')
    setHashtags([])
    setAnalysisResults([])
    setEffectiveness(null)
    setPracticalSuggestions([])
    setSemanticAnalysis(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🚀 ハッシュタグ生成ツール
          </h1>
          <p className="text-gray-600">
            文章を入力するだけで、最適なハッシュタグを自動生成！
          </p>
        </header>

        {/* 広告枠（上部） */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 text-center text-gray-400">
          <p>広告枠 (728x90)</p>
        </div>

        {/* メインコンテンツ */}
        <main className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* 入力エリア */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 テキストを入力
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="例：今日はカフェで勉強しました。コーヒーが美味しかったです。"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          {/* 設定エリア */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                ハッシュタグ数：
              </label>
              <select
                value={hashtagCount}
                onChange={(e) => setHashtagCount(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5個</option>
                <option value={10}>10個</option>
                <option value={15}>15個</option>
                <option value={20}>20個</option>
                <option value={25}>25個</option>
                <option value={30}>30個</option>
              </select>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={generateHashtags}
              disabled={isAnalyzing}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? '🔄 分析中...' : '✨ ハッシュタグ生成'}
            </button>
            {hashtags.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  📋 コピー
                </button>
                <button
                  onClick={clearAll}
                  className="px-6 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  🗑️ クリア
                </button>
              </>
            )}
          </div>

          {/* 結果表示エリア */}
          {hashtags.length > 0 && (
            <div className="border-t pt-6">
              {/* 分析結果 */}
              {analysisResults.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    🧠 AI分析結果
                  </h3>
                  <div className="space-y-3">
                    {analysisResults.slice(0, 3).map((result, index) => (
                      <div key={index} className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-blue-800">{result.category}</span>
                          <span className="text-sm text-blue-600">
                            {Math.round(result.confidence * 100)}%一致
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{result.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 文脈分析結果 */}
              {semanticAnalysis && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    🎯 文脈理解分析
                  </h3>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-purple-800">{semanticAnalysis.category}</span>
                      <span className="text-sm text-purple-600">
                        信頼度: {Math.round(semanticAnalysis.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{semanticAnalysis.context}</p>
                    <p className="text-sm text-gray-700">{semanticAnalysis.reasoning}</p>
                  </div>
                </div>
              )}

              {/* 効果予測 */}
              {effectiveness && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    📊 効果予測スコア
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-800">エンゲージメント期待値</span>
                      <span className="text-2xl font-bold text-green-600">{effectiveness.score}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div 
                        className="bg-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${effectiveness.score}%` }}
                      />
                    </div>
                    {effectiveness.suggestions.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-1">改善提案：</p>
                        <ul className="list-disc list-inside space-y-1">
                          {effectiveness.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 実用的な提案 */}
              {practicalSuggestions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    💡 改善提案
                  </h3>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <ul className="list-disc list-inside space-y-2">
                      {practicalSuggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-700">{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                🎯 生成されたハッシュタグ
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-wrap gap-2 mb-3">
                  {hashtags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  合計: {hashtags.length}個
                </div>
              </div>
            </div>
          )}
        </main>

        {/* 広告枠（下部） */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 text-center text-gray-400">
          <p>広告枠 (728x90)</p>
        </div>

        {/* 人気ハッシュタグ一覧 */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🔥 カテゴリ別ハッシュタグ
          </h2>
          <div className="space-y-4">
            {hashtagCategories.filter(cat => 
              ['グルメ', '旅行', 'ファッション', '仕事・勉強'].includes(cat.name)
            ).map((category, index) => (
              <div key={index} className="border rounded-lg p-3">
                <h3 className="font-medium text-gray-700 mb-2">{category.name}</h3>
                <div className="flex flex-wrap gap-1">
                  {category.hashtags.slice(0, 8).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs cursor-pointer hover:bg-purple-200 transition-colors"
                      onClick={() => setInputText(inputText + ' ' + tag)}
                    >
                      #{tag}
                    </span>
                  ))}
                  <span className="text-xs text-gray-500 px-2 py-1">+{category.hashtags.length - 8}個</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* フッター */}
        <footer className="text-center text-gray-600 text-sm">
          <p>
            無料で使えるハッシュタグ生成ツール | 
            SNS投稿のエンゲージメント向上に最適
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
