
//A generalized loading page that captures the essence of each of the three post pages(verified, unverified, all), using pure HTML for optimized load times. 
export default function Loading() {

  return (
    <>
      <div className="fixed w-screen flex justify-center pt-14 pb-2 lg:py-2 bg-gradient-to-r from-black from-20% via-slate-950 via-50% to-black to-80%">
        <div className="grid grid-flow-col min-w-[330px] h-9 justify-center">
          <button disabled className="absolute left-2 top-1.5 text-3xl sm:top-3 sm:text-4xl/7 text-offwhite">RankTop</button>
          <input placeholder="Search" disabled className="w-[300px] h-9 py-2 bg-transparent outline outline-2 outline-slate-700 rounded-md indent-1 placeholder-offwhite" />
        </div>
      </div>

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
            <p className="text-gray-400">List your top games, movies, books — anything. Up to 5 ranks, with optional images and description.</p>
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

      <footer className="py-3 w-full text-center bg-gradient-to-r from-black from-20% via-slate-950 via-50% to-black to-80%">
        <div className="grid grid-flow-col justify-center gap-10 sm:gap-40 h-10">
          <header className="w-20 py-2 text-offwhite">About</header>
          <header className="w-16 py-2 text-offwhite">FAQ</header>
          <header className="w-36 py-2 text-offwhite">Site Feedback</header>
        </div>
      </footer>
    </>
  )
}
