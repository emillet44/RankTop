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
        <div className="flex justify-center pt-[124px] lg:pt-[76px] pb-10">
          <ul className="flex flex-row">
            <li>
              <header className="px-4 py-1.5 rounded-md text-xl font-medium text-white bg-gray-700">My Groups</header>
            </li>
            <li>
              <header className="px-4 py-1.5 rounded-md text-xl font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200">Create</header>
            </li>
            <li>
              <header className="px-4 py-1.5 rounded-md text-xl font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200">Join</header>
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