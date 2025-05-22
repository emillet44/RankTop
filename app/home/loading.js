
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

      <div className="flex justify-center pt-[100px] lg:pt-[52px] pb-10 px-6 min-h-[calc(100vh-64px)] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
        <div className="grid grid-cols-1 w-full max-w-2xl h-screen border-x border-b border-slate-700">
          <div className="grid grid-cols-1 justify-items-center auto-rows-min">
            <div className="border-b p-8 w-full border-slate-700">
              <div className="flex flex-row space-y-3">
                <label className="text-xl text-slate-400 pr-1 flex pt-4">Loading</label>
                <select className="p-2 pr-1 outline outline-2 outline-slate-700 rounded-md bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-transparent opacity-100" disabled>
                  <option className="text-black">Most Viewed</option>
                </select>
              </div>
              <div className="flex flex-row space-y-3">
                <label className="text-xl text-slate-400 pr-1 flex pt-4">Loading...</label>
                <select className="p-2 pr-1 outline outline-2 outline-slate-700 rounded-md bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-transparent opacity-100" disabled>
                  <option className="text-black">Science & Nature</option>
                </select>
              </div>
            </div>
          </div>
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
