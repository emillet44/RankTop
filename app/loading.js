
//A generalized loading page that captures the essence of each of the three post pages(verified, unverified, all), using pure HTML for optimized load times. 
export default function Loading() {

  return (
    <>
      <div className="flex justify-center pt-14 pb-2 lg:py-2 bg-gradient-to-r from-black from-20% via-slate-950 via-50% to-black to-80%">
        <div className="grid grid-flow-col min-w-[330px] h-9 justify-center">
          <button className="absolute left-2 top-3 text-4xl/7 text-offwhite">RankTop</button>
          <input placeholder="Search" className="w-[330px] h-9 py-2 bg-transparent outline outline-2 outline-slate-700 rounded-md indent-1" />
        </div>
      </div>

      <div className="flex justify-center pb-10 px-6 min-h-[calc(100vh-116px)] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
        <div className="grid grid-cols-1 w-full max-w-2xl">
          <ul className="flex pt-6 pb-8 justify-center border-x border-b border-slate-700">
            <li className="mr-2">
              <header className="text-3xl hover:text-offwhite hover:border-b-2 border-white text-slate-400">Verified</header>
            </li>
            <li className="mr-2">
              <header className="text-3xl hover:text-offwhite hover:border-b-2 border-white text-slate-400">Unverified</header>
            </li>
            <li className="mr-2">
              <header className="text-3xl hover:text-offwhite hover:border-b-2 border-white text-slate-400">All</header>
            </li>
          </ul>
        </div>
      </div>

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
