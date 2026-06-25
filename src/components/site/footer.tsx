import { Link } from "@tanstack/react-router";
import { NewsletterForm } from "./newsletter-form";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="glowing-blob bottom-0 right-0 w-[400px] h-[400px] translate-y-1/2 translate-x-1/3" />
      
      <div className="mx-auto max-w-7xl px-6 py-20 relative z-10">
        <div className="grid gap-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2 font-display text-3xl tracking-tighter uppercase text-foreground">
              <span className="font-extrabold">Zahau</span>
              <span className="font-serif italic text-azure font-light normal-case tracking-normal text-xl">music</span>
            </Link>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              Excellence in musical education. Dedicated to fostering a culture
              of virtuosity, rigorous craft, and creative exploration.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-azure">
              School
            </span>
            {[
              { to: "/about", label: "About" },
              { to: "/curriculum", label: "Curriculum" },
              { to: "/fees", label: "Fees & Pricing" },
              { to: "/learning-levels", label: "Levels" },
              { to: "/online", label: "Online Learning" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-muted-foreground hover:text-azure hover:translate-x-1 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-azure">
              Connect
            </span>
            {[
              { to: "/courses", label: "Courses" },
              { to: "/gallery", label: "Gallery" },
              { to: "/testimonials", label: "Testimonials" },
              { to: "/contact", label: "Contact" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-muted-foreground hover:text-azure hover:translate-x-1 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-azure">
              Newsletter
            </span>
            <p className="text-sm text-muted-foreground">
              Stay updated on recitals, workshops, and new courses.
            </p>
            <NewsletterForm />
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border/60 flex flex-col sm:flex-row justify-between gap-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <span>© {new Date().getFullYear()} Zahau Music School · Delhi, India</span>
          <span>Founded by Henry Jahau</span>
        </div>
      </div>
    </footer>
  );
}
