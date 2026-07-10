import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border relative overflow-hidden">
      <div className="glowing-blob bottom-0 right-0 w-[400px] h-[400px] translate-y-1/2 translate-x-1/3" />
      <div className="mx-auto max-w-7xl px-6 py-20 relative z-10">
        <div className="border-b border-border/50 pb-12 mb-16 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="max-w-md">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-azure font-bold block mb-2">
              Newsletter
            </span>
            <h3 className="font-serif italic text-azure text-2xl font-light">Stay in the loop</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed font-light">
              Subscribe to receive announcements for student recitals, faculty masterclasses, and
              educational resources.
            </p>
          </div>
          <div className="w-full lg:w-auto min-w-[320px] max-w-md">
            <NewsletterForm />
          </div>
        </div>

        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="max-w-xs">
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-3xl tracking-tighter uppercase text-foreground"
            >
              <span className="font-extrabold">Zahau</span>
              <span className="font-serif italic text-azure font-light normal-case tracking-normal text-xl">
                music
              </span>
            </Link>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed font-light">
              Excellence in musical education. Dedicated to fostering a culture of virtuosity,
              rigorous craft, and creative exploration.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-azure">
              School
            </span>
            {[
              { href: "/about", label: "About" },
              { href: "/courses", label: "Courses" },
              { href: "/fees", label: "Fees & Pricing" },
              { href: "/learning-levels", label: "Levels" },
              { href: "/online", label: "Online Learning" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-azure hover:translate-x-1 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-azure">
              Connect
            </span>
            {[
              { href: "/lessons", label: "Lessons" },
              { href: "/gallery", label: "Gallery" },
              { href: "/testimonials", label: "Testimonials" },
              { href: "/contact", label: "Contact" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-azure hover:translate-x-1 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/60 flex flex-col sm:flex-row justify-between gap-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Zahau Music School &middot; Delhi, India</span>
          <span>Founded by Henry Jahau</span>
        </div>
      </div>
    </footer>
  );
}
