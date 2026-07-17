import { Sparkles } from 'lucide-react';

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#FF9900]/10 border border-[#FF9900]/20 flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-[#FF9900]" />
        </div>
        <h1 className="text-xl font-bold text-[#E6EDF3] mb-2">{title}</h1>
        <p className="text-sm text-[#8B949E] leading-relaxed mb-6">
          This feature is under active development and will be available in a future release.
        </p>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] animate-pulse" />
          Coming Soon
        </span>
      </div>
    </div>
  );
}
