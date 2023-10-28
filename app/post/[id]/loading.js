
//A generalized loading page that captures the essence of a post with the minimum requirements(as of now, it seems to be better to show minimal
//elements and have the post expand from there, rather than show the most elements, even though it may be the most seamless since most posts will
//likely have 5 ranks) using pure HTML for optimized load times.
export default function Loading() {

  return (
    <>
      <div className="flex justify-center pt-14 pb-2 lg:py-2 bg-slate-500">
        <div className="grid grid-flow-col min-w-[330px] h-9 justify-center">
          <button className="absolute left-2 top-3 text-4xl/7">RankTop</button>
          <input placeholder="Search" className="w-[330px] h-9 py-2 bg-slate-500 outline outline-2 rounded-md indent-1" />
          <button className="absolute right-2 top-1.5 hover:outline outline-2 py-2 px-2 rounded-sm">Sign In</button>
          <button className="absolute right-20 top-1.5 hover:outline outline-2 py-2 px-2 rounded-sm">New Post</button>
        </div>
      </div>

      <div className="flex justify-center py-10 px-6 min-h-[calc(100vh-116px)] bg-gradient-radial from-emerald-950 to-slate-950 bg-fixed">
        <div className="grid grid-cols-1 grid-flow-row auto-rows-min w-full max-w-2xl h-4/5">
          <header className="text-lg pb-4 text-slate-400">Posted by: </header>
          <div className=" h-60 rounded-xl outline outline-slate-700" />
          <header className="w-40 pb-6 pt-8 text-lg text-slate-400">... views</header>
        </div>
      </div>

      <footer className="py-3 w-full text-center bg-slate-500">
        <div className="grid grid-flow-col auto-cols-auto justify-center gap-44 h-10 items-center">
          <div className="w-20 py-2">
            <header>About</header>
          </div>
          <div className="w-16 py-2">
            <header>FAQ</header>
          </div>
          <div className="w-36 py-2">
            <header>Site Feedback</header>
          </div>
        </div>
      </footer>
    </>
  )
}  