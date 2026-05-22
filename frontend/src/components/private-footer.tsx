export function PrivateFooter() {
  return (
    <footer className="border-t border-[color:var(--color-line)] bg-[color:var(--color-surface)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-5 text-sm text-[color:var(--color-muted)] lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <span>Powered by DSIQ</span>
        <span>Part of the SMAJ Ecosystem</span>
      </div>
    </footer>
  );
}
