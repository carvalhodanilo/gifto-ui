export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand-primary,#0f172a)] border-t-transparent"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">Autenticando...</p>
      </div>
    </div>
  );
}

