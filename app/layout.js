import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ConvexClientProvider } from "../components/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: "Hostr – AI Event Management Platform",
  description:
    "Hostr is a full-stack AI-powered event management platform to create, discover, and manage events with real-time analytics and QR-based ticketing.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="bg-linear-to-br from-gray-950 via-zinc-900 to-stone-900 text-white">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ConvexClientProvider>
              <Header />

              <main className="relative min-h-screen container mx-auto pt-40 md:pt-32">
                {/* Background glow effects (behind everything) */}
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                  <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
                </div>

                {/* Page content (above glow) */}
                <div className="relative z-10">{children}</div>
              </main>

              <Footer />
            </ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
