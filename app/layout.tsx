import './globals.css'
import { Inter } from 'next/font/google'
import Script from "next/script";

//This page is mostly Nextjs boilerplate, except the two scripts are used to report page views throughout the site to Google Analytics.
//this page essentially manages some constant layout info like the website title, the font, the body, etc.
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DIGBTT'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Script async src="https://www.googletagmanager.com/gtag/js?id=G-JGMST5F7CL"></Script>
      <Script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-JGMST5F7CL');
        `}

      </Script>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </>

  )
}
