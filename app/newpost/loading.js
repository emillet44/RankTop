
//A generalized loading page that captures the essence of the newpost page using pure HTML for optimized load times. Fun fact, the select box
//necessarily includes "3 ranks" due to a subpixel difference in the width of the number 2 and the number 3, which makes the transition from the 
//loading page to the real page visible since select boxes scale to the size of the largest option element that they contain. Adding "3 ranks" makes
//the transition entirely seamless.
export default function Loading() {

  return (
    <>
      <div className="flex justify-center pt-14 pb-2 lg:py-2 bg-slate-500">
        <div className="grid grid-flow-col min-w-[330px] h-9 justify-center">
          <button className="absolute left-2 top-3 text-4xl/7">RankTop</button>
          <input placeholder="Search" className="w-[330px] h-9 py-2 bg-slate-500 outline outline-2 rounded-md indent-1" />
          <button className="absolute right-2 top-1.5 hover:outline outline-2 py-2 px-2 rounded-sm">Sign In</button>
        </div>
      </div>

      <div className="min-h-[calc(100vh-116px)] bg-gradient-radial from-emerald-950 to-slate-950 bg-fixed">
        <div className="flex justify-center pt-12 px-6 pb-16">
          <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 w-full max-w-2xl">
            <header className="text-3xl justify-self-left text-slate-400">New Post</header>
            <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 p-10 rounded-xl outline outline-slate-700 bg-slate-50 bg-opacity-5">
              <input name="title" placeholder="Title" className="text-4xl text-slate-400 outline-none bg-transparent placeholder:text-slate-400" />
              <div>
                <label className="text-xl p-2 text-slate-400">1.</label>
                <input name="r1" className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" />
              </div>
              <div>
                <label className="text-xl p-2 text-slate-400">2.</label>
                <input name="r2" className="text-xl text-slate-400 outline-none p-2 focus:border-b border-slate-400 w-11/12 bg-transparent" />
              </div>
            </div>
            <div className="max-w-2xl w-full h-10 flex justify-end space-x-5">
              <button className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">Add Description</button>
              <select className="p-2 outline outline-2 outline-slate-700 rounded-md bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">
                <option value="2" className="text-black">2 Ranks</option>
                <option value="3" className="text-black">3 Ranks</option>
              </select>
              <button className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-slate-400">Submit</button>
            </div>
          </div>
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
