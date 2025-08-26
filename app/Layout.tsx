import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Coach IA Gratuit - Analyse de Personnalité',
  description: 'Découvre ton profil unique avec notre IA gratuite. Questionnaire intelligent, analyse personnalisée et coaching adapté.',
  keywords: 'coach IA, analyse personnalité, questionnaire gratuit, profil psychologique',
  authors: [{ name: 'Plateforme IA' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Coach IA Gratuit - Analyse de Personnalité',
    description: 'Découvre ton profil unique avec notre IA gratuite',
    type: 'website',
    locale: 'fr_FR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧠</text></svg>" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className="font-sans antialiased">
        <div id="root">
          {children}
        </div>
        <div id="modal-root"></div>
      </body>
    </html>
  )
}