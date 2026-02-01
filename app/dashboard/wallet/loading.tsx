export default function Loading() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto p-8">
      <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-[1.586/1] rounded-3xl bg-slate-200 animate-pulse shadow-xl" />
        ))}
      </div>
    </div>
  );
}
