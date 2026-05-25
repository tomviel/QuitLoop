import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center
                             text-[10px] font-bold text-white">
              QL
            </span>
            <span className="font-semibold text-text-secondary text-sm">QuitLoop</span>
          </div>

          <nav className="flex items-center gap-6 text-xs text-text-muted">
            <Link href="/privacy" className="hover:text-text-secondary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-text-secondary transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-text-secondary transition-colors">
              Contact
            </Link>
            <a href="mailto:hello@quitloop.app" className="hover:text-text-secondary transition-colors">
              hello@quitloop.app
            </a>
          </nav>
        </div>

        <p className="text-text-muted text-xs text-center sm:text-left mt-6">
          © {new Date().getFullYear()} QuitLoop. Not a substitute for medical advice.
        </p>
      </div>
    </footer>
  );
}
