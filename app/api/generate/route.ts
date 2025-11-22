import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { references, chapter, section } = await request.json()

    if (!references) {
      return NextResponse.json(
        { error: 'المراجع مطلوبة' },
        { status: 400 }
      )
    }

    // تحديد نوع المحتوى المطلوب
    let sectionTitle = ''
    let targetPages = 2
    let prompt = ''

    if (chapter === 'intro') {
      sectionTitle = 'المقدمة'
      targetPages = 2
      prompt = `أنت باحث أكاديمي متخصص في القانون وعلاقات العمل. مهمتك كتابة مقدمة بحث أكاديمي باللغة العربية حول موضوع "الاتفاقية الجماعية والعلاقات المهنية".

المقدمة يجب أن تكون صفحتين وتتضمن:
1. تمهيد عام حول أهمية الموضوع
2. إشكالية البحث
3. أهداف الدراسة
4. أهمية الدراسة
5. منهج البحث
6. خطة البحث (الفصول والمباحث)

استخدم المراجع التالية:
${references}

الشروط المطلوبة:
- الكتابة باللغة العربية الفصحى
- استخدام أسلوب أكاديمي رصين
- الطول: حوالي 800-1000 كلمة (صفحتين)
- التهميش بأسلوب APA في نهاية النص
- استخراج المعلومات من المراجع المقدمة فقط`
    } else {
      targetPages = 25

      const sectionMap: { [key: string]: string } = {
        'ch1_mb1': 'المبحث الأول: الإطار العام للاتفاقية الجماعية',
        'ch1_mb1_sub0': 'المطلب الأول: تعريف الاتفاقية وخصائصها',
        'ch1_mb1_sub1': 'المطلب الثاني: شروطها وأنواعها وأطرافها',
        'ch1_mb1_sub2': 'المطلب الثالث: مجال تطبيق الاتفاقية ومضمونها',
        'ch1_mb2': 'المبحث الثاني: العلاقات المهنية داخل المؤسسة',
        'ch1_mb2_sub0': 'المطلب الأول: مفهوم العلاقات المهنية وأبعادها',
        'ch1_mb2_sub1': 'المطلب الثاني: أهدافها وأهميتها',
        'ch1_mb2_sub2': 'المطلب الثالث: عوامل تفكك العلاقات المهنية',
        'ch2_mb1': 'المبحث الأول: الاتفاقية الجماعية وتنظيم شروط العمل',
        'ch2_mb1_sub0': 'المطلب الأول: تنظيم الزمن والظروف المهنية (الوقت، الإجازة، السلامة)',
        'ch2_mb1_sub1': 'المطلب الثاني: تحديد الأجور، الامتيازات، التحفيزات',
        'ch2_mb1_sub2': 'المطلب الثالث: تحديد حقوق والتزامات طرفي علاقة العمل',
      }

      sectionTitle = sectionMap[section] || 'القسم المختار'

      // تحديد الطول بناءً على نوع القسم
      if (section.includes('_sub')) {
        targetPages = 8 // المطالب أقصر
        prompt = `أنت باحث أكاديمي متخصص في القانون وعلاقات العمل. مهمتك كتابة قسم من بحث أكاديمي باللغة العربية.

العنوان: ${sectionTitle}

استخدم المراجع التالية:
${references}

الشروط المطلوبة:
- الكتابة باللغة العربية الفصحى
- استخدام أسلوب أكاديمي رصين ومتخصص
- الطول: 3000-3500 كلمة (حوالي 8 صفحات)
- تقسيم المحتوى إلى فقرات منطقية
- استخدام عناوين فرعية عند الحاجة
- الاستشهاد بالمراجع في النص بأسلوب APA (مثل: (العمري، 2020، ص 45))
- قائمة المراجع في نهاية النص بأسلوب APA
- التركيز على العمق والتحليل القانوني
- استخراج المعلومات من المراجع المقدمة فقط`
      } else {
        targetPages = 12 // المباحث أطول
        prompt = `أنت باحث أكاديمي متخصص في القانون وعلاقات العمل. مهمتك كتابة مبحث كامل من بحث أكاديمي باللغة العربية.

العنوان: ${sectionTitle}

استخدم المراجع التالية:
${references}

الشروط المطلوبة:
- الكتابة باللغة العربية الفصحى
- استخدام أسلوب أكاديمي رصين ومتخصص
- الطول: 4500-5500 كلمة (حوالي 12 صفحة)
- تقسيم المحتوى إلى أقسام فرعية واضحة
- استخدام عناوين فرعية للمطالب
- الاستشهاد بالمراجع في النص بأسلوب APA (مثل: (العمري، 2020، ص 45))
- قائمة المراجع في نهاية النص بأسلوب APA
- التركيز على العمق والتحليل القانوني والمقارنة بين الآراء
- استخراج المعلومات من المراجع المقدمة فقط
- تضمين أمثلة وتطبيقات عملية عند الحاجة`
      }
    }

    // استدعاء Claude API
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY

    if (!anthropicApiKey) {
      return NextResponse.json(
        { error: 'مفتاح API غير موجود' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Claude API error:', errorData)
      return NextResponse.json(
        { error: 'فشل في التواصل مع خدمة توليد النصوص' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const generatedContent = data.content[0].text

    return NextResponse.json({
      content: generatedContent,
      sectionTitle,
      targetPages,
    })
  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}
