import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'محرر البحث الأكاديمي',
  description: 'أداة لإنشاء وتحرير الأبحاث الأكاديمية باللغة العربية مع التهميش بأسلوب APA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
