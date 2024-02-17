
//A generalized loading page that captures the essence of the newpost page using pure HTML for optimized load times. Fun fact, the select box
//necessarily includes "3 ranks" due to a subpixel difference in the width of the number 2 and the number 3, which makes the transition from the 
//loading page to the real page visible since select boxes scale to the size of the largest option element that they contain. Adding "3 ranks" makes
//the transition entirely seamless.
export default function Loading() {

  return (
    <>
      <div className="flex justify-center pt-14 pb-2 lg:py-2 bg-gradient-to-r from-black from-20% via-slate-950 via-50% to-black to-80%">
        <div className="grid grid-flow-col min-w-[330px] h-9 justify-center">
          <button className="absolute left-2 top-3 text-4xl/7 text-offwhite">RankTop</button>
          <input placeholder="Search" className="w-[330px] h-9 py-2 bg-transparent outline outline-2 outline-slate-700 rounded-md indent-1" />
        </div>
      </div>

      <div className="min-h-[calc(100vh-116px)] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
        <div className="flex justify-center pt-12 px-6 pb-16">
          <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 w-full max-w-2xl">
            <header className="text-3xl justify-self-left text-slate-400">Loading...</header>
            <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 p-8 rounded-xl outline outline-slate-700 bg-slate-50 bg-opacity-5">
              <header className="text-4xl text-slate-400 outline-none bg-transparent pb-1">...</header>
              <div>
                <label className="text-xl pr-2 text-slate-400">...</label>
                <header name="r1" className="outline-none p-2 border-slate-400 w-11/12" />
              </div>
              <div>
                <label className="text-xl pr-2 text-slate-400">...</label>
                <header name="r2" className="outline-none p-2 border-slate-400 w-11/12" />
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