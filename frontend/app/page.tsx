"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useReadContract, useReadContracts } from "wagmi";
import {
  BOT_POLL_ABI,
  BOT_POLL_ADDRESS,
  IS_CONTRACT_CONFIGURED,
  CONTRACT_NOT_CONFIGURED_MESSAGE,
  PollData,
} from "../lib/contracts";
import { PollCard } from "../components/PollCard";
import {
  Vote,
  Plus,
  RefreshCw,
  AlertCircle,
  Inbox,
  Flame,
  Archive,
  Layers,
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "closed">("active");

  // Read total poll count
  const {
    data: pollCountData,
    isLoading: isCountLoading,
    refetch: refetchCount,
    isRefetching: isCountRefetching,
  } = useReadContract({
    address: BOT_POLL_ADDRESS,
    abi: BOT_POLL_ABI,
    functionName: "getPollCount",
    query: {
      enabled: IS_CONTRACT_CONFIGURED,
    },
  });

  const pollCount = pollCountData ? Number(pollCountData) : 0;

  // Prepare batch call to get all polls from 1 to pollCount
  const pollQueries = React.useMemo(() => {
    if (!IS_CONTRACT_CONFIGURED || !BOT_POLL_ADDRESS || pollCount === 0) return [];
    const calls = [];
    for (let id = 1; id <= pollCount; id++) {
      calls.push({
        address: BOT_POLL_ADDRESS,
        abi: BOT_POLL_ABI,
        functionName: "getPoll" as const,
        args: [BigInt(id)],
      });
    }
    return calls;
  }, [pollCount]);

  const {
    data: pollsData,
    isLoading: isPollsLoading,
    refetch: refetchPolls,
  } = useReadContracts({
    contracts: pollQueries,
    query: {
      enabled: pollQueries.length > 0,
    },
  });

  const handleRefresh = () => {
    refetchCount();
    refetchPolls();
  };

  // Parse polls list (most recent first)
  const allPolls: PollData[] = React.useMemo(() => {
    if (!pollsData) return [];
    return pollsData
      .filter((res) => res.status === "success" && res.result)
      .map((res) => res.result as PollData)
      .reverse();
  }, [pollsData]);

  const activePolls = allPolls.filter((p) => p.active);
  const closedPolls = allPolls.filter((p) => !p.active);

  const displayedPolls =
    activeTab === "active"
      ? activePolls
      : activeTab === "closed"
      ? closedPolls
      : allPolls;

  const isLoading = isCountLoading || (pollCount > 0 && isPollsLoading);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="text-center pt-8 pb-4 max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
          <Vote className="w-3.5 h-3.5" />
          <span>Decentralized Polling Protocol</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Vote on-chain.
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Simple, transparent community polls powered by Botchain. Every question, option, and vote is recorded immutably on-chain.
        </p>

        <div className="pt-2 flex items-center justify-center gap-4">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-950/60 transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Poll</span>
          </Link>

          <button
            onClick={handleRefresh}
            disabled={isCountRefetching}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isCountRefetching ? "animate-spin text-emerald-400" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </section>

      {/* Contract Unconfigured Alert */}
      {!IS_CONTRACT_CONFIGURED && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-amber-300">
              {CONTRACT_NOT_CONFIGURED_MESSAGE}
            </p>
            <p className="text-xs text-amber-200/80">
              Please deploy the contract or set{" "}
              <code className="px-1.5 py-0.5 rounded bg-zinc-900 font-mono text-amber-400">
                NEXT_PUBLIC_BOT_POLL_ADDRESS
              </code>{" "}
              in your environment to interact with on-chain polls.
            </p>
          </div>
        </div>
      )}

      {/* Polls Filter & Header */}
      {IS_CONTRACT_CONFIGURED && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-900/80 border border-zinc-800 rounded-xl self-start">
              <button
                onClick={() => setActiveTab("active")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "active"
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-950/40"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Active ({activePolls.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("closed")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "closed"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Closed ({closedPolls.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("all")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "all"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All ({allPolls.length})</span>
              </button>
            </div>

            <div className="text-xs text-zinc-500">
              Total Polls On-Chain:{" "}
              <span className="font-mono text-zinc-300 font-semibold">{pollCount}</span>
            </div>
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-56 rounded-2xl bg-zinc-900/40 border border-zinc-800 animate-pulse p-6 space-y-4"
                >
                  <div className="h-4 bg-zinc-800 rounded w-1/3" />
                  <div className="h-6 bg-zinc-800 rounded w-3/4" />
                  <div className="h-4 bg-zinc-800 rounded w-1/2" />
                  <div className="h-10 bg-zinc-800 rounded w-full mt-4" />
                </div>
              ))}
            </div>
          ) : displayedPolls.length === 0 ? (
            <div className="text-center py-16 px-4 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-800/80 text-zinc-500 mx-auto flex items-center justify-center">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-zinc-300">
                {pollCount === 0
                  ? "No polls created yet."
                  : `No ${activeTab} polls found.`}
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {pollCount === 0
                  ? "Be the first community member to create an on-chain poll on Botchain Testnet."
                  : "Check back later or change filter tab to see other polls."}
              </p>
              {pollCount === 0 && (
                <div className="pt-2">
                  <Link
                    href="/create"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-400 text-black hover:bg-emerald-300 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    Create First Poll
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {displayedPolls.map((poll) => (
                <PollCard
                  key={poll.id.toString()}
                  poll={poll}
                  onRefresh={handleRefresh}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
