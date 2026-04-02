export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Skeleton Header */}
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

      {/* Skeleton Main Content */}
      <main className="flex-grow pt-[52px]">
        <div className="max-w-2xl mx-auto sm:border-x border-white/10 min-h-[calc(100vh-104px)]">
          {/* Filter Bar Skeleton */}
          <div className="sticky top-[52px] bg-black/40 backdrop-blur-md border-b border-white/10 z-50 px-3 sm:px-4 py-2 flex items-center justify-start gap-x-6">
            <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
            <div className="w-20 h-4 bg-white/5 rounded animate-pulse border-l border-white/10 pl-6" />
            <div className="w-20 h-4 bg-white/5 rounded animate-pulse border-l border-white/10 pl-6" />
          </div>

          {/* Feed Skeleton */}
          <div className="flex flex-col">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 sm:p-6 space-y-4 border-b border-white/10">
                <div className="w-3/4 h-7 bg-white/5 rounded-md animate-pulse" />
                <div className="aspect-video w-full bg-white/[0.03] rounded-lg animate-pulse border border-white/5" />
                <div className="flex justify-between">
                  <div className="flex gap-x-4">
                    <div className="w-16 h-4 bg-white/5 rounded animate-pulse" />
                    <div className="w-16 h-4 bg-white/5 rounded animate-pulse" />
                  </div>
                  <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Skeleton Footer */}
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
