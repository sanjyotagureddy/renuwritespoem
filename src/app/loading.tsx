export default function HomeLoading() {
  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col items-center justify-center space-y-8 p-6 text-center animate-pulse">
      <div className="h-6 w-48 rounded-full bg-amber-500/10 border border-amber-500/20" />
      <div className="h-16 w-3/4 max-w-3xl rounded-xl bg-white/10 md:h-24" />
      <div className="h-24 w-full max-w-2xl rounded-xl bg-white/5" />
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <div className="h-14 w-48 rounded-full bg-white/20" />
        <div className="h-14 w-48 rounded-full bg-white/5 border border-white/10" />
      </div>
    </div>
  );
}
