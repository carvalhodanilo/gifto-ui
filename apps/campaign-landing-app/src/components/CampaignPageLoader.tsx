import { OFFICIAL_BRAND_PALETTE } from '@core-ui/ui';

type CampaignPageLoaderProps = {
  label?: string;
  /** Hex da marca; se omitido, usa o navy da paleta oficial (`OFFICIAL_BRAND_PALETTE` em `@core-ui/ui`). */
  accentColor?: string | null;
};

/**
 * Loader full-screen alinhado à paleta global (brand-muted + acento navy por defeito).
 */
export function CampaignPageLoader({
  label = 'Carregando campanha…',
  accentColor,
}: CampaignPageLoaderProps) {
  const safeAccent =
    accentColor && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(accentColor.trim())
      ? accentColor.trim()
      : OFFICIAL_BRAND_PALETTE.navy;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-brand-muted"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 120%, ${safeAccent}2e, transparent 55%),
            radial-gradient(ellipse 50% 40% at 20% 30%, ${safeAccent}24, transparent 50%),
            radial-gradient(ellipse 45% 35% at 85% 25%, ${OFFICIAL_BRAND_PALETTE.grayLight}40, transparent 45%)
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
            className="absolute inset-2 rounded-full border-2 border-black/15 motion-reduce:animate-none animate-loader-orbit"
            style={{ borderTopColor: safeAccent, borderRightColor: `${safeAccent}99` }}
          />
          <div
            className="absolute inset-6 rounded-full border border-black/10 motion-reduce:animate-none animate-loader-orbit"
            style={{
              animationDirection: 'reverse',
              animationDuration: '3.6s',
              borderBottomColor: `${safeAccent}55`,
            }}
          />
          <div
            className="absolute inset-[22%] flex items-center justify-center rounded-full bg-brand-white shadow-md ring-1 ring-black/10"
            style={{
              background: `linear-gradient(145deg, ${safeAccent}30 0%, ${OFFICIAL_BRAND_PALETTE.grayLight} 50%, ${OFFICIAL_BRAND_PALETTE.white} 100%)`,
            }}
          >
            <div
              className="h-14 w-14 rounded-full motion-reduce:opacity-90 animate-loader-shimmer sm:h-16 sm:w-16"
              style={{
                background: `linear-gradient(120deg, ${safeAccent}55 0%, #ffffff 45%, ${safeAccent}80 85%)`,
                backgroundSize: '200% 200%',
              }}
            />
          </div>
        </div>

        <div className="max-w-xs text-center sm:max-w-md">
          <p className="text-lg font-semibold tracking-tight text-brand-navy sm:text-xl">{label}</p>
          <p className="mt-2 text-sm font-medium text-brand-soft">
            Preparando banner, datas e lojas participantes
          </p>
        </div>
      </div>

      <span className="sr-only">{label}</span>
    </div>
  );
}
