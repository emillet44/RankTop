
//A generalized loading page that captures the essence of a post with the minimum requirements(as of now, it seems to be better to show minimal
//elements and have the post expand from there, rather than show the most elements, even though it may be the most seamless since most posts will
//likely have 5 ranks) using pure HTML for optimized load times.
export default function Loading() {

  return (
    <>
      <div className="fixed w-screen flex justify-center pt-14 pb-2 lg:py-2 bg-gradient-to-r from-black from-20% via-slate-950 via-50% to-black to-80%">
        <div className="grid grid-flow-col min-w-[330px] h-9 justify-center">
          <button disabled className="absolute left-2 top-1.5 text-3xl sm:top-3 sm:text-4xl/7 text-offwhite">RankTop</button>
          <input placeholder="Search" disabled className="w-[300px] h-9 py-2 bg-transparent outline outline-2 outline-slate-700 rounded-md indent-1 placeholder-offwhite" />
        </div>
      </div>

      <div className="flex justify-center px-6 pb-10 min-h-[calc(100vh-64px)] pt-[141px] lg:pt-[94px] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
        <div className="grid grid-cols-1 grid-flow-row auto-rows-min w-full max-w-2xl h-4/5">
          <div className="max-w-2xl w-full flex justify-between items-end">
            <header className="text-2xl text-ellipsis overflow-hidden text-slate-400 font-semibold outline-none w-auto pb-2 pl-2">Loading...</header>
            <div className="flex space-x-4 pb-4">
            <span className="p-2 h-10" />
            </div>
          </div>
          <ul className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-2 sm:gap-4 list-inside p-4 sm:p-6 rounded-xl outline outline-slate-700">
            <li className="text-xl text-slate-400 outline-none p-2 w-11/12">...</li>
            <li className="text-xl text-slate-400 outline-none p-2 w-11/12">...</li>
          </ul>
          <header className="pt-[104px] text-3xl text-slate-400 justify-self-left">Comments</header>
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