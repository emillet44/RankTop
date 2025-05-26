
//A generalized loading page that captures the groups header, footer, and background
export default function Loading() {

  return (
    <>
      <div className="fixed w-screen flex justify-center pt-14 pb-2 lg:py-2 bg-gradient-to-r from-black from-20% via-slate-950 via-50% to-black to-80%">
        <div className="grid grid-flow-col min-w-[330px] h-9 justify-center">
          <button disabled className="absolute left-2 top-1.5 text-3xl sm:top-3 sm:text-4xl/7 text-offwhite">RankTop</button>
          <div className="outline outline-2 outline-slate-700 rounded-md flex w-[350px] animate-pulse">
            <div className="h-9 bg-slate-800/50 text-offwhite text-sm flex items-center px-2 border-r-2 border-slate-700 cursor-default">
              <div className="w-[36px] h-3 bg-slate-600 rounded animate-pulse" />
              <span className="ml-2 text-offwhite w-[14px]" />
            </div>
            <div className="flex items-center flex-1">
              <input type="text" disabled className="h-9 w-full bg-slate-800/30 outline-none indent-2 text-offwhite placeholder-slate-500" placeholder="Loading..." />
            </div>
          </div>
          <div className="absolute right-2 top-1.5 flex flex-row space-x-2 max-[490px]:hidden">
            <div className="hover:outline outline-2 py-2 px-2 rounded-sm bg-slate-800/50 animate-pulse">
              <div className="w-16 h-4 bg-slate-600 rounded" />
            </div>
            <div className="hover:outline outline-2 py-2 px-2 rounded-sm bg-slate-800/50 animate-pulse">
              <div className="w-12 h-4 bg-slate-600 rounded" />
            </div>
          </div>
        </div>
      </div>

      <main className="flex flex-col items-center justify-center bg-gradient-radial from-gray-950 to-stone-950 bg-fixed min-h-[calc(100vh-64px)] text-white px-6" />

      <footer className="py-3 w-full text-center bg-gradient-to-r from-black from-20% via-slate-950 via-50% to-black to-80%">
        <div className="grid grid-flow-col justify-center gap-10 sm:gap-40 h-10">
          <div className="w-20 py-2 bg-slate-800/50 rounded animate-pulse">
            <div className="w-12 h-4 bg-slate-600 rounded mx-auto" />
          </div>
          <div className="w-16 py-2 bg-slate-800/50 rounded animate-pulse">
            <div className="w-8 h-4 bg-slate-600 rounded mx-auto" />
          </div>
          <div className="w-36 py-2 bg-slate-800/50 rounded animate-pulse">
            <div className="w-24 h-4 bg-slate-600 rounded mx-auto" />
          </div>
        </div>
      </footer>
    </>
  )
}
