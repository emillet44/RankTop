export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Skeleton Header - Matched to app/loading.js */}
      <nav className="fixed top-0 left-0 right-0 h-[52px] flex items-center bg-gradient-to-b from-stone-900/80 to-stone-950/90 backdrop-blur-md border-b border-white/10 z-[100] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="w-full px-4 md:px-6 flex items-center justify-between relative h-full">
          {/* Left: Logo Skeleton */}
          <div className="flex-1 flex items-center min-w-0">
            <div className="text-2xl md:text-3xl text-offwhite/10 tracking-tighter font-normal select-none">
              RankTop
            </div>
          </div>

          {/* Center: Search Skeleton */}
          <div className="flex-none w-full max-w-[200px] min-[400px]:max-w-[280px] sm:max-w-[380px] md:max-w-[420px] mx-2">
            <div className="h-9 w-full bg-white/5 rounded-md animate-pulse border border-white/10 flex overflow-hidden">
              <div className="w-12 sm:w-16 h-full border-r border-white/10" />
              <div className="flex-1 h-full" />
            </div>
          </div>

          {/* Right: Actions Skeleton */}
          <div className="flex-1 flex items-center justify-end gap-x-2 md:gap-x-3">
            <div className="hidden md:flex items-center gap-x-2 md:gap-x-3">
              <div className="w-16 h-8 bg-white/5 rounded animate-pulse" />
              <div className="w-20 h-8 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse md:ml-2" />
          </div>
        </div>
      </nav>

      <main className="flex justify-center px-4 sm:px-6 pb-16 min-h-[calc(100vh-52px)] pt-[140px] lg:pt-[100px]">
        <div className="w-full max-w-2xl flex flex-col gap-3">
          
          {/* ACTIONS BAR SKELETON */}
          <div className="flex justify-end items-center px-1">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
          </div>

          <div className="relative overflow-visible rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md w-full flex flex-col shadow-2xl">
            
            {/* 1. MEDIA / RANKING SKELETON */}
            <div className="w-full">
               <div className="w-full aspect-video bg-white/5 rounded-t-2xl animate-pulse border-b border-white/10" />
            </div>

            <div className="flex flex-col p-5 sm:p-6 gap-5">
              {/* 3. HEADER: AUTHOR & DATE */}
              <div className="flex flex-col gap-2 pb-4 border-b border-white/5">
                <div className="w-1/2 h-6 bg-white/5 rounded animate-pulse mb-1" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/15 animate-pulse" />
                    <div className="flex flex-col gap-1">
                      <div className="w-16 h-2 bg-white/5 rounded animate-pulse" />
                      <div className="w-12 h-1.5 bg-white/5 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. ENGAGEMENT ROW */}
              <div className="flex items-center gap-5 pb-4 border-b border-white/5">
                <div className="w-16 h-6 bg-white/5 rounded animate-pulse" />
                <div className="h-6 w-px bg-white/10" />
                <div className="flex flex-col gap-1">
                  <div className="w-8 h-3 bg-white/5 rounded animate-pulse" />
                  <div className="text-[8px] bg-white/5 w-10 h-2 rounded animate-pulse" />
                </div>
              </div>

              {/* 6. DESCRIPTION */}
              <div className="flex flex-col gap-2 pb-5 border-b border-white/10">
                <div className="text-[10px] bg-white/5 w-20 h-2.5 rounded animate-pulse" />
                <div className="w-full h-16 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* 8. COMMENTS */}
          <div className="w-full">
            <div className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
          </div>
        </div>
      </main>

      {/* Skeleton Footer - Matched to app/loading.js */}
      <footer className="w-full h-[52px] border-t border-white/10 bg-gradient-to-t from-stone-900/80 to-stone-950/90 backdrop-blur-md relative">
        <div className="w-full h-full px-6 flex items-center justify-center">
          <div className="flex items-center justify-center gap-x-12 sm:gap-x-20 h-full">
            <div className="w-12 h-3 bg-white/5 rounded animate-pulse" />
            <div className="w-8 h-3 bg-white/5 rounded animate-pulse" />
            <div className="w-24 h-3 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </footer>
    </div>
  )
}
