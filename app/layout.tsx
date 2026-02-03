import { Metadata } from 'next';
import './globals.css'
import { Inter } from 'next/font/google'
import Script from "next/script";

//This page is mostly Nextjs boilerplate, except the two scripts are used to report page views throughout the site to Google Analytics.
//this page essentially manages some constant layout info like the website title, the font, the body, etc.
const inter = Inter({ subsets: ['latin'] })

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

      <html lang="en">
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
        <body className={`${inter.className} bg-black`}>{children}</body>
      </html>
    </>

  )
}
