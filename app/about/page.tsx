import { Header } from "@/components/headers/Header";
import { Footer } from "@/components/Footer";

export default async function About() {

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed flex items-center justify-center pt-14">
        <p className="p-5 rounded-xl outline outline-slate-700 bg-slate-50 bg-opacity-5 max-w-5xl w-full h-fit text-xl text-slate-400">
          The intention of this site is to become a social media platform where users can post and converse about their top five(potentially more ranks in
          the future) in various categories like sports, books, fashion, etc. This site has been in development since May 2023, and is a solo project. The site 
          is roughly 80% finished, although nothing is set in stone and new feature requests are always welcome under the Site Feedback button.
        </p>
      </div>
      <Footer />
    </>
  )
}