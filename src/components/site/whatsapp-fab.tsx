import { MessageCircle } from "lucide-react";

export function WhatsAppFab() {
  const href =
    "https://wa.me/919999999999?text=" +
    encodeURIComponent("Hi Zahau Music School, I'd like to know more about your courses.");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 size-14 rounded-full bg-[#25D366] text-white shadow-lg grid place-items-center hover:scale-105 transition-transform"
    >
      <MessageCircle className="size-7" />
    </a>
  );
}
