import { Link } from "@tanstack/react-router";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

const NAV = [
  { to: "/courses", label: "Curriculum" },
  { to: "/fees", label: "Fees" },
  { to: "/about", label: "About" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl tracking-tighter uppercase text-foreground">
          Zahau
        </Link>
        <nav className="hidden md:flex gap-7 text-[11px] font-bold uppercase tracking-widest">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-foreground/80 hover:text-azure transition-colors"
              activeProps={{ className: "text-azure" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="size-10 grid place-items-center rounded hover:bg-muted text-foreground/80 hover:text-foreground transition-all duration-200 cursor-pointer"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? (
              <Sun className="size-5 text-yellow-500 animate-pulse" />
            ) : (
              <Moon className="size-5 text-azure" />
            )}
          </button>
          <Link
            to="/contact"
            className="hidden sm:inline-flex bg-navy text-navy-foreground px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest hover:bg-azure hover:text-azure-foreground transition-colors"
          >
            Apply Now
          </Link>
          <button
            className="md:hidden size-10 grid place-items-center rounded hover:bg-muted"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col px-6 py-4 gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-bold uppercase tracking-widest text-foreground/80 hover:text-azure"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="py-3 text-sm font-bold uppercase tracking-widest text-foreground/80"
            >
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
