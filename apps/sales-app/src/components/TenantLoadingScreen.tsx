export function TenantLoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand-primary,#003366)] border-t-transparent"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}
