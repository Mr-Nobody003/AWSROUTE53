export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="p-8 max-w-[1200px] mx-auto flex flex-col items-center justify-center min-h-[500px]">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-center max-w-md w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
        <p className="text-slate-500 mb-6">
          This feature is currently in development and will be available in a future release of the AWS Route53 Clone.
        </p>
        <div className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 cursor-not-allowed">
          Coming Soon
        </div>
      </div>
    </div>
  );
}
