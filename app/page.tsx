'use client'

import { useState } from 'react'

interface ChapterSection {
  title: string
  content: string
  references: string[]
}

export default function Home() {
  const [references, setReferences] = useState('')
  const [chapter, setChapter] = useState<'intro' | 'chapter1' | 'chapter2'>('intro')
  const [section, setSection] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [error, setError] = useState('')

  const chapterStructure = {
    intro: {
      title: 'المقدمة',
      pages: '2 صفحات'
    },
    chapter1: {
      title: 'الفصل الأول',
      sections: [
        {
          id: 'ch1_mb1',
          title: 'المبحث الأول: الإطار العام للاتفاقية الجماعية',
          subsections: [
            'المطلب الأول: تعريف الاتفاقية وخصائصها',
            'المطلب الثاني: شروطها وأنواعها وأطرافها',
            'المطلب الثالث: مجال تطبيق الاتفاقية ومضمونها'
          ]
        },
        {
          id: 'ch1_mb2',
          title: 'المبحث الثاني: العلاقات المهنية داخل المؤسسة',
          subsections: [
            'المطلب الأول: مفهوم العلاقات المهنية وأبعادها',
            'المطلب الثاني: أهدافها وأهميتها',
            'المطلب الثالث: عوامل تفكك العلاقات المهنية'
          ]
        }
      ],
      pages: '25-30 صفحة'
    },
    chapter2: {
      title: 'الفصل الثاني: مساهمة الاتفاقية الجماعية في تسيير العلاقات المهنية',
      sections: [
        {
          id: 'ch2_mb1',
          title: 'المبحث الأول: الاتفاقية الجماعية وتنظيم شروط العمل',
          subsections: [
            'المطلب الأول: تنظيم الزمن والظروف المهنية (الوقت، الإجازة، السلامة)',
            'المطلب الثاني: تحديد الأجور، الامتيازات، التحفيزات',
            'المطلب الثالث: تحديد حقوق والتزامات طرفي علاقة العمل'
          ]
        }
      ],
      pages: '25-30 صفحة'
    }
  }

  const handleGenerate = async () => {
    if (!references.trim()) {
      setError('الرجاء إدخال المراجع')
      return
    }

    setLoading(true)
    setError('')
    setGeneratedContent('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          references,
          chapter,
          section,
        }),
      })

      if (!response.ok) {
        throw new Error('فشل في توليد المحتوى')
      }

      const data = await response.json()
      setGeneratedContent(data.content)
    } catch (err) {
      setError('حدث خطأ أثناء توليد المحتوى. الرجاء المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([generatedContent], { type: 'text/plain;charset=utf-8' })
    element.href = URL.createObjectURL(file)
    element.download = `${chapter}_${section || 'content'}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
            محرر البحث الأكاديمي
          </h1>
          <p className="text-center text-gray-600 mb-8">
            أداة لإنشاء وتحرير الأبحاث الأكاديمية باللغة العربية مع التهميش بأسلوب APA
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* القسم الأيمن: الإعدادات */}
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold mb-3 text-gray-700">
                  اختر الفصل:
                </label>
                <select
                  value={chapter}
                  onChange={(e) => {
                    setChapter(e.target.value as any)
                    setSection('')
                  }}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-800"
                >
                  <option value="intro">المقدمة (2 صفحات)</option>
                  <option value="chapter1">الفصل الأول (25-30 صفحة)</option>
                  <option value="chapter2">الفصل الثاني (25-30 صفحة)</option>
                </select>
              </div>

              {chapter !== 'intro' && (
                <div>
                  <label className="block text-lg font-semibold mb-3 text-gray-700">
                    اختر القسم:
                  </label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-800"
                  >
                    <option value="">-- اختر القسم --</option>
                    {chapterStructure[chapter].sections.map((sec: any) => (
                      <optgroup key={sec.id} label={sec.title}>
                        <option value={sec.id}>{sec.title}</option>
                        {sec.subsections.map((subsec: string, idx: number) => (
                          <option key={idx} value={`${sec.id}_sub${idx}`}>
                            {subsec}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-lg font-semibold mb-3 text-gray-700">
                  المراجع (كتب، رسائل، مقالات):
                </label>
                <textarea
                  value={references}
                  onChange={(e) => setReferences(e.target.value)}
                  placeholder="أدخل المراجع هنا... (مثال: كتب، رسائل ماجستير ودكتوراه، مقالات علمية باللغة العربية أو الأجنبية)"
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none min-h-[300px] text-gray-800"
                  dir="rtl"
                />
                <p className="text-sm text-gray-500 mt-2">
                  * يفضل إدخال المراجع بصيغة APA أو أي صيغة مفصلة تحتوي على معلومات المرجع الكاملة
                </p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !references.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {loading ? 'جاري التوليد...' : 'توليد المحتوى'}
              </button>

              {error && (
                <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 rounded">
                  {error}
                </div>
              )}
            </div>

            {/* القسم الأيسر: المحتوى المولد */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-lg font-semibold text-gray-700">
                  المحتوى المولد:
                </label>
                {generatedContent && (
                  <button
                    onClick={handleDownload}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    تحميل
                  </button>
                )}
              </div>
              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 min-h-[600px] overflow-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
                  </div>
                ) : generatedContent ? (
                  <div className="prose prose-lg max-w-none text-gray-800 whitespace-pre-wrap" dir="rtl">
                    {generatedContent}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center">
                    سيظهر المحتوى المولد هنا...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* هيكل البحث */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">هيكل البحث الكامل</h2>

          <div className="space-y-6">
            <div className="border-r-4 border-purple-500 pr-4">
              <h3 className="text-xl font-bold text-gray-800">المقدمة</h3>
              <p className="text-gray-600">2 صفحات</p>
            </div>

            <div className="border-r-4 border-indigo-500 pr-4">
              <h3 className="text-xl font-bold text-gray-800 mb-3">الفصل الأول (25-30 صفحة)</h3>

              <div className="mr-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-2">المبحث الأول: الإطار العام للاتفاقية الجماعية</h4>
                  <ul className="mr-6 space-y-1 text-gray-700">
                    <li>• المطلب الأول: تعريف الاتفاقية وخصائصها</li>
                    <li>• المطلب الثاني: شروطها وأنواعها وأطرافها</li>
                    <li>• المطلب الثالث: مجال تطبيق الاتفاقية ومضمونها</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-2">المبحث الثاني: العلاقات المهنية داخل المؤسسة</h4>
                  <ul className="mr-6 space-y-1 text-gray-700">
                    <li>• المطلب الأول: مفهوم العلاقات المهنية وأبعادها</li>
                    <li>• المطلب الثاني: أهدافها وأهميتها</li>
                    <li>• المطلب الثالث: عوامل تفكك العلاقات المهنية</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-r-4 border-blue-500 pr-4">
              <h3 className="text-xl font-bold text-gray-800 mb-3">الفصل الثاني: مساهمة الاتفاقية الجماعية في تسيير العلاقات المهنية (25-30 صفحة)</h3>

              <div className="mr-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-2">المبحث الأول: الاتفاقية الجماعية وتنظيم شروط العمل</h4>
                  <ul className="mr-6 space-y-1 text-gray-700">
                    <li>• المطلب الأول: تنظيم الزمن والظروف المهنية (الوقت، الإجازة، السلامة)</li>
                    <li>• المطلب الثاني: تحديد الأجور، الامتيازات، التحفيزات</li>
                    <li>• المطلب الثالث: تحديد حقوق والتزامات طرفي علاقة العمل</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-r-4 border-green-500 pr-4">
              <h3 className="text-xl font-bold text-gray-800">الفصل التطبيقي</h3>
              <p className="text-gray-600">(سيتم تحريره من قبل المستخدم)</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
