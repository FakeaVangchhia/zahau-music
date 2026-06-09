import { Link } from "@tanstack/react-router";
import { NewsletterForm } from "./newsletter-form";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="max-w-xs">
            <Link to="/" className="font-display text-4xl tracking-tighter uppercase">Zahau</Link>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              Excellence in musical education. Founded by Henry Jahau in Delhi to foster a culture of virtuosity and creative exploration.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">School</span>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link>
            <Link to="/courses" className="text-sm text-muted-foreground hover:text-foreground">Courses</Link>
            <Link to="/learning-levels" className="text-sm text-muted-foreground hover:text-foreground">Levels</Link>
            <Link to="/online" className="text-sm text-muted-foreground hover:text-foreground">Online Learning</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Connect</span>
            <Link to="/events" className="text-sm text-muted-foreground hover:text-foreground">Events</Link>
            <Link to="/gallery" className="text-sm text-muted-foreground hover:text-foreground">Gallery</Link>
            <Link to="/testimonials" className="text-sm text-muted-foreground hover:text-foreground">Testimonials</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Newsletter</span>
            <p className="text-sm text-muted-foreground">Monthly: recitals, workshops, new courses.</p>
            <NewsletterForm />
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between gap-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <span>© {new Date().getFullYear()} Zahau Music School · Delhi, India</span>
          <span>Founded by Henry Jahau</span>
        </div>
      </div>
    </footer>
  );
}
