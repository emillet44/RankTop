import { Header } from "../components/headers/Header";
import { Footer } from "@/components/Footer";
import { AlgoliaUpdate } from "@/components/search/AlgoliaUpdate";
import { Metadata } from 'next'

export const metadata: Metadata = {
  description: 'Create, share, and browse lists on anything and everything, ranked.',
}

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center bg-gradient-radial from-gray-950 to-stone-950 bg-fixed min-h-[calc(100vh-64px)] text-white px-6">
        <section className="w-full max-w-4xl text-center pt-32 pb-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Rank Anything. Discover Everything.</h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            Ranktop lets you create, share, and explore ranked lists — from hot takes to factual breakdowns. No limits, just opinions.
          </p>
          <a href="/home" className="bg-white text-black font-semibold text-lg px-6 py-3 rounded-2xl shadow hover:bg-gray-100 transition">Get Started</a>
        </section>
        <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 pb-32">
          <div className="bg-stone-900 p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Create Your Own Ranks</h3>
            <p className="text-gray-400">List your top games, movies, ideas — anything. Up to 5 ranks, with optional images and description.</p>
          </div>
          <div className="bg-stone-900 p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Discover Hot Takes</h3>
            <p className="text-gray-400">Browse a global feed of lists sorted by views, likes, or category.</p>
          </div>
          <div className="bg-stone-900 p-6 rounded-2xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Search Across Everything</h3>
            <p className="text-gray-400">
              Find users, groups, or posts instantly with search powered by Algolia.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
