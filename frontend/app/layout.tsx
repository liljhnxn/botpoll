import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../components/Providers";
import { WalletButton } from "../components/WalletButton";
import Link from "next/link";
import { Vote, PlusCircle, ExternalLink, Activity } from "lucide-react";
import { BOTCHAIN_EXPLORER_URL } from "../lib/contracts";

export const metadata: Metadata = {
  title: "BotPoll | On-Chain Polling on Botchain Testnet",
  description: "Simple, transparent community polls powered by Botchain Testnet. Create polls and vote on-chain.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
        <Providers>
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
              {/* Logo / Brand */}
              <div className="flex items-center gap-6">
                <Link
                  href="/"
                  className="flex items-center gap-2.5 group transition-transform active:scale-95"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-zinc-950 shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                    <Vote className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                      BotPoll
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
                        Testnet
                      </span>
                    </span>
                  </div>
                </Link>

                <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-zinc-400">
                  <Link
                    href="/"
                    className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-zinc-850 transition-colors"
                  >
                    Polls
                  </Link>
                  <Link
                    href="/create"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-white hover:bg-zinc-850 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    Create Poll
                  </Link>
                </nav>
              </div>

              {/* Action Buttons & Wallet */}
              <div className="flex items-center gap-3">
                <Link
                  href="/create"
                  className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-800 text-emerald-400 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                  title="Create Poll"
                >
                  <PlusCircle className="w-5 h-5" />
                </Link>
                <WalletButton />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-zinc-900 bg-zinc-950/40 py-6 text-xs text-zinc-500">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Connected to Botchain Testnet (Chain ID 968)</span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href={BOTCHAIN_EXPLORER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-zinc-300 transition-colors"
                >
                  <span>BohrScan Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span>•</span>
                <span>Native Token: BOT</span>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
