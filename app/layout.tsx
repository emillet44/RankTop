import './globals.css'
import { Inter } from 'next/font/google'
import Script from "next/script";

//This page is mostly Nextjs boilerplate, except the two scripts are used to report page views throughout the site to Google Analytics.
//this page essentially manages some constant layout info like the website title, the font, the body, etc.
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'RankTop'
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
          <Script id="google-tag-manager" async src="https://www.googletagmanager.com/gtag/js?id=G-JGMST5F7CL"></Script>
          <Script id="page-view-counter">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-JGMST5F7CL');
        `}

          </Script>
        </head>
        <body className={inter.className}>{children}</body>
      </html>
    </>

  )
}
