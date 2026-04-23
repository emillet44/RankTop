export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* EXACT HEADER SKELETON */}
      <nav className="fixed top-0 left-0 right-0 h-[52px] flex items-center bg-gray-950/50 backdrop-blur-md border-b border-white/10 z-[100] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="w-full px-4 md:px-6 flex items-center justify-between relative h-full">
          <div className="flex-1 flex items-center min-w-0">
            <div className="text-2xl md:text-3xl text-offwhite/10 tracking-tighter font-normal select-none">RankTop</div>
          </div>
          <div className="flex-none w-full max-w-[200px] min-[400px]:max-w-[280px] sm:max-w-[380px] md:max-w-[420px] mx-2">
            <div className="border border-white/10 rounded-md flex flex-row w-full bg-white/5 h-[34px] animate-pulse">
              <div className="w-12 sm:w-16 h-full border-r border-white/10" />
              <div className="flex-grow" />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-end gap-x-2 md:gap-x-3">
            <div className="hidden md:flex items-center gap-x-2 md:gap-x-3">
              <div className="w-20 h-8 bg-white/5 rounded animate-pulse" />
              <div className="w-24 h-8 bg-white/5 rounded animate-pulse" />
              <div className="w-20 h-8 bg-blue-600/20 rounded animate-pulse" />
            </div>
            <div className="md:hidden w-10 h-10 bg-white/5 rounded-xl animate-pulse" />
          </div>
        </div>
      </nav>

      <main className="flex justify-center px-6 pb-20 min-h-[calc(100vh-52px)] pt-[141px] lg:pt-[94px]">
        <div className="w-full max-w-2xl">
          {/* EXACT PAGE HEADER SKELETON */}
          <header className="mb-4 text-center lg:text-left flex flex-col items-center lg:items-start">
            {/* Back Link mb-2 */}
            <div className="flex items-center gap-2 mb-2 animate-pulse">
              <div className="w-3 h-3 bg-white/5 rounded-full" />
              <div className="w-20 h-3 bg-white/5 rounded" />
            </div>

            {/* Tooltip mb-4 */}
            <div className="w-full max-w-xl h-4 bg-white/5 rounded animate-pulse mb-4" />
            
            {/* Title mb-2 */}
            <div className="w-3/4 h-8 bg-white/5 rounded-lg animate-pulse mb-2" />
          </header>

          {/* FORM CONTAINER SKELETON */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] px-4 pb-8 sm:px-8 backdrop-blur-sm shadow-2xl">
            <div className="space-y-8 mt-8">
              <div className="grid grid-cols-1 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-4 p-4 rounded-2xl border-2 border-white/5 bg-white/[0.03] animate-pulse"
                    style={{ opacity: 1 - i * 0.15 }}
                  >
                    <div className="flex-none w-10 h-10 rounded-xl bg-black/40 border-2 border-white/10" />
                    <div className="flex-none w-24 h-16 rounded-xl bg-black/60 border border-white/10" />
                    <div className="flex-grow space-y-2">
                      <div className="w-3/4 h-6 bg-white/5 rounded" />
                      <div className="w-1/4 h-2 bg-white/5 rounded opacity-60" />
                    </div>
                  </div>
                ))}
              </div>

              {/* ACTION BUTTONS SKELETON */}
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
                <div className="h-[52px] bg-white/5 rounded-2xl border border-white/10" />
                <div className="h-[52px] bg-blue-600/40 rounded-2xl border border-white/10" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* EXACT FOOTER SKELETON */}
      <footer className="w-full h-[52px] border-t border-white/10 bg-gray-950/50 backdrop-blur-md relative">
        <div className="w-full h-full px-6 flex items-center justify-center">
          <div className="flex items-center justify-center gap-x-12 sm:gap-x-20 text-slate-400/20 h-full">
            <div className="w-12 h-3 bg-white/5 rounded animate-pulse" />
            <div className="w-8 h-3 bg-white/5 rounded animate-pulse" />
            <div className="w-24 h-3 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </footer>
    </div>
  )
}
