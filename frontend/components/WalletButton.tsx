"use client";

import React, { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from "wagmi";
import { BOTCHAIN_CHAIN_ID } from "../lib/contracts";
import { botchainTestnet } from "../lib/network";
import { Wallet, LogOut, AlertTriangle, ShieldCheck } from "lucide-react";

export function WalletButton() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-32 rounded-lg bg-zinc-800/60 animate-pulse border border-zinc-700/50" />
    );
  }

  if (!isConnected || !address) {
    return (
      <button
        onClick={() => {
          const connector = connectors[0];
          if (connector) {
            connect({ connector });
          }
        }}
        disabled={isConnecting}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-lg shadow-lg shadow-emerald-950/40 transition-all duration-200 active:scale-95 disabled:opacity-50"
      >
        <Wallet className="w-4 h-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  const isWrongNetwork = currentChainId !== BOTCHAIN_CHAIN_ID;

  if (isWrongNetwork) {
    return (
      <button
        onClick={() => switchChain({ chainId: botchainTestnet.id })}
        disabled={isSwitching}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg shadow-md transition-all active:scale-95"
      >
        <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
        {isSwitching ? "Switching..." : "Switch to Botchain Testnet"}
      </button>
    );
  }

  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 rounded-full">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Botchain</span>
      </div>

      <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-700/60 rounded-lg px-3 py-1.5 text-sm text-zinc-200">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span className="font-mono">{truncatedAddress}</span>
        <button
          onClick={() => disconnect()}
          title="Disconnect wallet"
          className="ml-1 text-zinc-400 hover:text-rose-400 transition-colors p-1 rounded hover:bg-zinc-800"
          aria-label="Disconnect wallet"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
