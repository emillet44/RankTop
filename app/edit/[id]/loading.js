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

      <main className="flex-grow flex flex-col items-center pt-[130px] md:pt-[82px] px-3 sm:px-6 pb-12 w-full">
        <div className="relative p-5 sm:p-8 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md w-full max-w-2xl flex flex-col gap-8 shadow-2xl">
          
          {/* Header Section Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-8 gap-6">
            <div className="space-y-2">
              <div className="w-40 h-8 bg-white/5 rounded-lg animate-pulse" />
              <div className="w-56 h-3 bg-white/5 rounded animate-pulse" />
            </div>

            {/* Category Skeleton */}
            <div className="flex flex-col gap-2 min-w-[200px]">
              <div className="w-20 h-3 bg-white/5 rounded animate-pulse" />
              <div className="h-10 w-full bg-white/5 border border-white/10 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Title and Ranks Section Skeleton */}
          <div className="space-y-8">
            {/* Title TextArea Skeleton */}
            <div className="relative group">
              <div className="absolute -top-2 left-2 w-12 h-3 bg-gray-950 rounded animate-pulse" />
              <div className="h-[60px] w-full bg-white/[0.02] border border-white/10 rounded-xl animate-pulse" />
            </div>

            {/* Ranks Header Skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white/5 rounded animate-pulse" />
                <div className="w-24 h-4 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="w-24 h-8 bg-white/5 border border-white/10 rounded-lg animate-pulse" />
            </div>

            {/* Rank Items Skeleton */}
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-[60px] bg-white/[0.03] border border-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>

          {/* Description Section Skeleton */}
          <div className="space-y-4 border-t border-white/5 pt-8">
            <div className="w-32 h-8 bg-white/5 rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="w-40 h-3 bg-white/5 rounded animate-pulse" />
              <div className="h-[120px] w-full bg-white/[0.02] border border-white/10 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="grid grid-cols-2 gap-4 pt-4 h-[82px]">
            <div className="h-[52px] bg-white/5 rounded-xl animate-pulse border border-white/5" />
            <div className="h-[52px] bg-blue-600/40 rounded-xl animate-pulse border border-blue-500/20 shadow-lg shadow-blue-500/5" />
          </div>
        </div>
      </main>

      {/* EXACT FOOTER SKELETON */}
      <footer className="w-full h-[52px] border-t border-white/10 bg-gray-950/50 backdrop-blur-md relative">
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
