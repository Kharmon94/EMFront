import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { SolanaWalletProvider } from "@/lib/solana";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import { OnboardingModal } from "@/components/OnboardingModal";
import { GlobalMusicPlayer } from "@/components/GlobalMusicPlayer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Music Artist Platform - Launch, Stream, Trade on Solana",
  description: "Discover music, support artists, and trade artist tokens on Solana blockchain",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Music Platform",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#8B5CF6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <SolanaWalletProvider>
            {children}
            <Toaster position="top-right" />
            <OnboardingModal />
            <GlobalMusicPlayer />
          </SolanaWalletProvider>
        </Providers>
      </body>
    </html>
  );
}
