import { MessageCircle } from "lucide-react";

export function WhatsAppFab() {
  const href =
    "https://wa.me/916360777933?text=" +
    encodeURIComponent("Hi Zahau Music School, I'd like to know more about your courses.");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 size-14 rounded-full bg-card border border-azure/40 text-azure shadow-[0_4px_24px_rgba(0,0,0,0.4)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.7)] flex items-center justify-center hover:scale-110 hover:bg-azure hover:text-azure-foreground transition-all duration-300 group cursor-pointer"
    >
      <span className="absolute -inset-1 rounded-full border border-azure/20 animate-ping group-hover:opacity-0 transition-opacity duration-300" />
      <MessageCircle className="size-6 transition-transform group-hover:rotate-6" />
    </a>
  );
}
