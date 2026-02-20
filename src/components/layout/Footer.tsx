export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-6 text-sm text-foreground-subtle sm:flex-row sm:justify-between">
        <p>&copy; 2026 Mythwright</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-foreground-muted transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-foreground-muted transition-colors">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
