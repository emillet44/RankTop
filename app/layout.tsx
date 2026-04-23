import { Metadata } from 'next';
import './globals.css'
import { Inter } from 'next/font/google'
import Script from "next/script";

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'RankTop',
  metadataBase: new URL('https://www.ranktop.net'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="fixed inset-0 -z-10 bg-gradient-radial from-gray-950 to-stone-950" aria-hidden="true" />
      <html lang="en" className={`${inter.variable}`}>
        <head>
          <meta name="google-site-verification" content="DVHvBfg1RjRArve45Es4EY9USwgJc3xtaCYYljYElMU" />
          <Script id="google-tag-manager" async src="https://www.googletagmanager.com/gtag/js?id=G-JGMST5F7CL"></Script>
          <Script id="page-view-counter">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-JGMST5F7CL');
            `}

          </Script>
          <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6723055610683564" crossOrigin="anonymous"></Script>
        </head>
        <body className={`${inter.className} bg-black text-offwhite antialiased`}>{children}</body>
      </html>
    </>

  )
}
