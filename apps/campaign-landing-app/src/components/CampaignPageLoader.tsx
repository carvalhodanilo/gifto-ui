type CampaignPageLoaderProps = {
  label?: string;
  /** Hex válido da marca; se omitido, loader 100% neutro (stone). */
  accentColor?: string | null;
};

/**
 * Loader full-screen (tema neutro; acento opcional se no futuro passares cor da marca).
 */
export function CampaignPageLoader({
  label = 'Carregando campanha…',
  accentColor,
}: CampaignPageLoaderProps) {
  const hasAccent =
    accentColor && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(accentColor.trim());
  const safeAccent = hasAccent ? accentColor!.trim() : '#a8a29e';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-stone-100"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background: hasAccent
            ? `
            radial-gradient(ellipse 80% 60% at 50% 120%, ${safeAccent}2e, transparent 55%),
            radial-gradient(ellipse 50% 40% at 20% 30%, ${safeAccent}24, transparent 50%),
            radial-gradient(ellipse 45% 35% at 85% 25%, #d6d3d120, transparent 45%)
          `
            : `
            radial-gradient(ellipse 80% 60% at 50% 120%, #d6d3d140, transparent 55%),
            radial-gradient(ellipse 50% 40% at 20% 30%, #e7e5e450, transparent 50%),
            radial-gradient(ellipse 45% 35% at 85% 25%, #a8a29e28, transparent 45%)
          `,
        }}
      />

      <div className="relative flex flex-col items-center gap-10 px-6">
        <div className="relative h-36 w-36 sm:h-44 sm:w-44">
          <div
            className="absolute inset-0 rounded-full opacity-35 blur-xl motion-reduce:animate-none animate-loader-pulse-soft"
            style={{ backgroundColor: safeAccent }}
          />
          <div
            className="absolute inset-2 rounded-full border-2 border-stone-300/60 motion-reduce:animate-none animate-loader-orbit"
            style={{ borderTopColor: safeAccent, borderRightColor: `${safeAccent}99` }}
          />
          <div
            className="absolute inset-6 rounded-full border border-stone-200 motion-reduce:animate-none animate-loader-orbit"
            style={{
              animationDirection: 'reverse',
              animationDuration: '3.6s',
              borderBottomColor: hasAccent ? `${safeAccent}55` : '#d6d3d1',
            }}
          />
          <div
            className="absolute inset-[22%] flex items-center justify-center rounded-full bg-white shadow-md ring-1 ring-stone-200/90"
            style={{
              background: hasAccent
                ? `linear-gradient(145deg, ${safeAccent}30 0%, #fafaf9 50%, #ffffff 100%)`
                : 'linear-gradient(145deg, #f5f5f4 0%, #ffffff 100%)',
            }}
          >
            <div
              className="h-14 w-14 rounded-full motion-reduce:opacity-90 animate-loader-shimmer sm:h-16 sm:w-16"
              style={{
                background: hasAccent
                  ? `linear-gradient(120deg, ${safeAccent}55 0%, #ffffff 45%, ${safeAccent}80 85%)`
                  : 'linear-gradient(120deg, #d6d3d1 0%, #fafaf9 45%, #a8a29e 85%)',
                backgroundSize: '200% 200%',
              }}
            />
          </div>
        </div>

        <div className="max-w-xs text-center sm:max-w-md">
          <p className="text-lg font-semibold tracking-tight text-stone-900 sm:text-xl">{label}</p>
          <p className="mt-2 text-sm font-medium text-stone-500">
            Preparando banner, datas e lojas participantes
          </p>
        </div>
      </div>

      <span className="sr-only">{label}</span>
    </div>
  );
}
