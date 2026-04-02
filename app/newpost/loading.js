export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Skeleton Header (Matches NewPostHeader) */}
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
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse md:ml-2" />
          </div>
        </div>
      </nav>

      {/* Skeleton Main Content (Matches CSForm Layout with Exact Heights) */}
      <main className="flex-grow flex flex-col items-center pt-[130px] md:pt-[82px] px-3 sm:px-6 pb-12 w-full">
        <div className="p-5 sm:p-8 rounded-2xl border border-white/15 bg-black/25 backdrop-blur-md w-full max-w-2xl flex flex-col">
          
          {/* Inner Content with Gap-8 and PT-2 */}
          <div className="flex flex-col gap-8 pt-2">
            {/* Form Header Skeleton (~89px height) */}
            <div className="flex items-center justify-between border-b border-white/10 pb-8 gap-4 h-[90px]">
              <div className="space-y-2">
                <div className="w-32 h-8 bg-white/5 rounded animate-pulse" />
                <div className="w-24 h-3 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="w-10 h-3 bg-white/5 rounded animate-pulse" />
                <div className="w-[124px] h-9 bg-white/5 rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Post Type Selector Skeleton (~78px height) */}
            <div className="grid grid-cols-2 gap-4 h-[78px]">
              <div className="bg-white/5 rounded-xl animate-pulse border border-white/5" />
              <div className="bg-white/5 rounded-xl animate-pulse border border-white/5" />
            </div>

            {/* Title and Ranks Section */}
            <div className="space-y-6">
              {/* Title Input (~58px height) */}
              <div className="h-[58px] bg-white/5 rounded-xl animate-pulse border border-white/15" />
              
              {/* Rank Inputs (~54px height each) */}
              <div className="space-y-4">
                <div className="h-[54px] bg-white/5 rounded-xl animate-pulse border border-white/10" />
                <div className="h-[54px] bg-white/5 rounded-xl animate-pulse border border-white/10" />
              </div>
            </div>

            {/* Optional Settings Collapsed Skeleton (~58px height) */}
            <div className="h-[58px] bg-white/[0.03] border border-white/10 rounded-2xl animate-pulse" />
          </div>

          {/* Action Buttons Skeleton (mt-2 pt-8) */}
          <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10 mt-2 h-[82px]">
            <div className="h-[52px] bg-white/5 rounded-xl animate-pulse border border-white/10" />
            <div className="h-[52px] bg-white/5 rounded-xl animate-pulse border border-blue-500/20 shadow-lg shadow-blue-500/5" />
          </div>
        </div>
      </main>

      {/* Skeleton Footer */}
      <footer className="fixed bottom-0 left-0 right-0 h-[52px] border-t border-white/10 bg-gradient-to-t from-stone-900/80 to-stone-950/90 backdrop-blur-md z-[100]">
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
