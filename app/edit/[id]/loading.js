
//A generalized loading page that captures the essence of the newpost page using pure HTML for optimized load times. Fun fact, the select box
//necessarily includes "3 ranks" due to a subpixel difference in the width of the number 2 and the number 3, which makes the transition from the 
//loading page to the real page visible since select boxes scale to the size of the largest option element that they contain. Adding "3 ranks" makes
//the transition entirely seamless.
export default function Loading() {

  return (
    <>
      <div className="fixed w-screen flex justify-center pt-14 pb-2 lg:py-2 bg-gradient-to-r from-black from-20% via-slate-950 via-50% to-black to-80%">
        <div className="grid grid-flow-col min-w-[330px] h-9 justify-center">
          <button disabled className="absolute left-2 top-1.5 text-3xl sm:top-3 sm:text-4xl/7 text-offwhite">RankTop</button>
          <input placeholder="Search" disabled className="w-[300px] h-9 py-2 bg-transparent outline outline-2 outline-slate-700 rounded-md indent-1 placeholder-offwhite" />
        </div>
      </div>

      <div className="min-h-[calc(100vh-64px)] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed">
        <div className="flex justify-center pt-[130px] lg:pt-[82px] px-6 pb-10">
          <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-6 w-full max-w-2xl">
            <div className="flex justify-between">
              <header className="text-3xl justify-self-left text-slate-400 self-end">Loading...</header>
              <div className="flex sm:flex-row flex-col space-y-3">
                <label className="text-xl text-slate-400 pr-1 flex pt-4">Loading...</label>
                <select className="p-2 outline outline-2 outline-slate-700 rounded-md bg-slate-50 hover:bg-opacity-10 bg-opacity-5 text-transparent opacity-100" disabled>
                  <option>Science & Nature</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-2 sm:gap-4 p-4 sm:p-6 rounded-xl outline outline-slate-700 bg-slate-50 bg-opacity-5">
              <label className="text-2xl text-slate-400 outline-none bg-transparent placeholder:text-slate-400">...</label>
              <div className="flex items-center">
                <label className="text-xl text-slate-400 pr-2">...</label>
                <input className="text-xl outline-none p-2 border-slate-400 bg-transparent flex-1" disabled />
              </div>
              <div className="flex items-center">
                <label className="text-xl text-slate-400 pr-2">...</label>
                <input className="text-xl outline-none p-2 border-slate-400 bg-transparent flex-1" disabled />
              </div>
            </div>
            <div className="max-w-2xl w-full h-10 flex flex-wrap justify-end space-x-5 gap-y-5">
              <button className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 bg-opacity-5 text-transparent" disabled>Add Description</button>
              <select className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 bg-opacity-5 text-transparent opacity-100" disabled>
                <option>2 Ranks</option>
              </select>
              <button className="outline outline-2 outline-slate-700 rounded-md p-2 bg-slate-50 bg-opacity-5 text-transparent" disabled>Submit</button>
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