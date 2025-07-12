export const metadata = {
  title: 'Chat App',
  description: 'Real-time chat application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 