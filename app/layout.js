export const metadata = {
  title: 'Studby',
  description: 'Studby',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
