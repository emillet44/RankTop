
//A generalized loading page that captures the essence of the newpost page using pure HTML for optimized load times. Fun fact, the select box
//necessarily includes "3 ranks" due to a subpixel difference in the width of the number 2 and the number 3, which makes the transition from the 
//loading page to the real page visible since select boxes scale to the size of the largest option element that they contain. Adding "3 ranks" makes
//the transition entirely seamless.
export default function Loading() {

  return (
    <>
      <div className="fixed w-screen flex justify-center pt-14 pb-2 md:py-2 bg-gradient-to-r from-black from-20% via-slate-950 via-50% to-black to-80%">
        <div className="grid grid-flow-col min-w-[330px] h-9 justify-center">
          <button disabled className="absolute left-2 top-1.5 text-3xl sm:top-3 sm:text-4xl/7 text-offwhite">RankTop</button>
          <input placeholder="Search" disabled className="w-[300px] h-9 py-2 bg-transparent outline outline-2 outline-slate-700 rounded-md indent-1 placeholder-offwhite" />
        </div>
      </div>

      <div className="min-h-[calc(100vh-64px)] bg-gradient-radial from-gray-950 to-stone-950 bg-fixed text-offwhite">
        <div className="flex justify-center pt-[130px] md:pt-[82px] px-6 pb-10">
          <div className="grid grid-cols-1 grid-flow-row auto-rows-auto gap-2 sm:gap-4 p-4 sm:p-6 rounded-xl shadow-black shadow-lg bg-slate-500 bg-opacity-20 w-full max-w-2xl">
            <div className="flex justify-between -mb-2">
              <header className="text-3xl font-bold">Loading...</header>
            </div>
            <div className="outline-none rounded-md p-4 my-4 h-[130px] bg-slate-700 bg-opacity-30">

            </div>
            <button disabled className="h-9 flex justify-between items-center p-1 outline outline-2 outline-slate-700 rounded-md bg-slate-50 bg-opacity-5 w-full text-xl " />
            <button disabled className="h-9 flex justify-between items-center p-1 outline outline-2 outline-slate-700 rounded-md bg-slate-50 bg-opacity-5 w-full text-xl" />
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="flex flex-col space-y-1">
                <label className="text-xl pr-2 text-transparent">Category:</label>
                <select disabled className="text-transparent p-2 outline outline-2 outline-slate-700 rounded-md bg-slate-50 bg-opacity-5 overflow-auto">
                  <option className="text-black">None</option>
                </select>
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-xl text-transparent pr-2">Visibility:</label>
                <select disabled className="text-transparent p-2 outline outline-2 outline-slate-700 rounded-md bg-slate-50 bg-opacity-5 text-offwhite">
                  <option className="text-black">Public</option>
                </select>
              </div>
            </div>
            <button disabled className="h-10 outline-none rounded-md p-2 bg-blue-900 text-offwhite" />
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