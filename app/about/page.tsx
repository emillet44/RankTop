import { Header } from "@/components/headers/Header";
import { Footer } from "@/components/Footer";

export default async function ReportBugs() {

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-116px)] bg-gradient-radial from-emerald-950 to-slate-950 bg-fixed">
        <div className="flex justify-center py-20 px-6">
          <ul className="p-5 rounded-xl outline outline-slate-700 bg-slate-50 bg-opacity-5 max-w-5xl w-full h-3/4 text-xl text-slate-400 space-y-5">
            <li>NextJS app router- Using the app router allows for high client interactivity while also preserving fast response times with React server components.</li>
            <li>Prisma- built in support of NextJS, and it also heavily simplifies database management with any major database system like PostgreSQL. It enables
              the construction of descriptive yet simple database schema, as well as easy access to perform CRUD functions with its APIs.</li>
            <li>PostgreSQL- a relational database was the best choice for this site because the nature of the data included many relational fields, such as users that
              need to be connected to their posts, or their likes.</li>
            <li>Google Analytics-tracks views on each post, and is best in class for providing important website traffic analytics.</li>
            <li>Algolia- the best choice for a free search platform, and it provides rich functionality like synonym matching, spelling error correction, and instant 
              searching, very easy.</li>
            <li>MailerSend- A good SMTP for sending and receiving mail to your domain, while also providing helpful analytics. Currently it is only used for sending bug 
              reports.
            </li>
            <li>Tailwind- One of the best CSS frameworks for writing convenience and concise CSS. It provides high quality documentation and simplifies many common
              use cases of CSS, while also allowing for addons added through its configuration file like the radial gradient background on this site.
            </li>
            <li> NextAuth- While not a technology and more of a node package, NextAuth is vital to creating any form of OAuth verification like Google sign in, and it
              heavily simplified the process of adding a sign in feature and persisting sign in state throughout the site.
            </li>
          </ul>
        </div>
      </div>

      <Footer />
    </>
  )
}