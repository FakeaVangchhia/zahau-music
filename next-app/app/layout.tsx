import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Zahau Music School — Premier Online Music Academy",
  description:
    "Piano, Keyboard, Guitar (Ukulele, Classical, Electric), Drum, Vocal Performance (Hindustani, Carnatic, Western) and Music Theory at Zahau Music School.",
  authors: [{ name: "Zahau Music School" }],
  openGraph: {
    siteName: "Zahau Music School",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: "Zahau Music School",
      url: "/",
      founder: { "@type": "Person", name: "Henry Jahau" },
      sameAs: [],
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  localStorage.setItem('theme', 'light');
                  document.documentElement.className = 'light';
                } catch (e) {
                  document.documentElement.className = 'light';
                }
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "Zahau Music School",
              url: "/",
              founder: { "@type": "Person", name: "Henry Jahau" },
              sameAs: [],
            }),
          }}
        />
      </head>
      <body>
        <QueryProvider>
          <Header />
          <main id="main" className="animate-page-transition">
            {children}
          </main>
          <Footer />
          <WhatsAppFab />
          <Toaster position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
