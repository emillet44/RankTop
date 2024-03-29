import { Header } from "@/components/headers/Header";
import { Footer } from "@/components/Footer";

export default async function ReportBugs() {

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-116px)] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed pb-16">
        <div className="flex justify-center pt-96">
          <header className="text-slate-400">Nothing here yet!</header>
        </div>
      </div>

      <Footer />
    </>
  )
}