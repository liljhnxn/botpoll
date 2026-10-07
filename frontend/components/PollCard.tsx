"use client";

import React, { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  BOT_POLL_ABI,
  BOT_POLL_ADDRESS,
  BOTCHAIN_EXPLORER_URL,
  PollData,
  OptionData,
} from "../lib/contracts";
import { VotePanel } from "./VotePanel";
import { Results } from "./Results";
import {
  Calendar,
  User,
  Vote,
  BarChart3,
  Lock,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

interface PollCardProps {
  poll: PollData;
  onRefresh?: () => void;
}

export function PollCard({ poll, onRefresh }: PollCardProps) {
  const { address } = useAccount();
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch poll options
  const {
    data: optionsData,
    refetch: refetchOptions,
    isLoading: isOptionsLoading,
  } = useReadContract({
    address: BOT_POLL_ADDRESS,
    abi: BOT_POLL_ABI,
    functionName: "getPollOptions",
    args: [poll.id],
    query: {
      enabled: Boolean(BOT_POLL_ADDRESS),
    },
  });

  // Check if current user has voted
  const {
    data: hasVotedData,
    refetch: refetchHasVoted,
  } = useReadContract({
    address: BOT_POLL_ADDRESS,
    abi: BOT_POLL_ABI,
    functionName: "hasAddressVoted",
    args: [poll.id, address as `0x${string}`],
    query: {
      enabled: Boolean(BOT_POLL_ADDRESS && address),
    },
  });

  // Close poll transaction
  const {
    data: closeTxHash,
    isPending: isClosePending,
    writeContractAsync: closePollAsync,
  } = useWriteContract();

  const {
    isLoading: isCloseConfirming,
    isSuccess: isCloseSuccess,
  } = useWaitForTransactionReceipt({
    hash: closeTxHash,
  });

  React.useEffect(() => {
    if (isCloseSuccess && onRefresh) {
      onRefresh();
      refetchOptions();
    }
  }, [isCloseSuccess, onRefresh, refetchOptions]);

  const options: OptionData[] = (optionsData as OptionData[]) || [];
  const hasVoted = Boolean(hasVotedData);
  const isCreator = address && poll.creator.toLowerCase() === address.toLowerCase();
  const isActive = poll.active && !isCloseSuccess;

  const totalVotes = options.reduce(
    (sum, opt) => sum + Number(opt.voteCount),
    0
  );

  const formattedDate = new Date(Number(poll.createdAt) * 1000).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  const truncatedCreator = `${poll.creator.slice(0, 6)}...${poll.creator.slice(-4)}`;

  const handleVoteCompleted = () => {
    refetchOptions();
    refetchHasVoted();
    if (onRefresh) onRefresh();
  };

  const handleClosePoll = async () => {
    if (!BOT_POLL_ADDRESS) return;
    try {
      await closePollAsync({
        address: BOT_POLL_ADDRESS,
        abi: BOT_POLL_ABI,
        functionName: "closePoll",
        args: [poll.id],
      });
    } catch (err) {
      console.error("Failed to close poll:", err);
    }
  };

  return (
    <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-xl shadow-black/30">
      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {isActive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
              <Lock className="w-3 h-3 text-zinc-400" />
              Closed
            </span>
          )}

          <span className="text-xs text-zinc-500">#{poll.id.toString()}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-zinc-500" />
            <a
              href={`${BOTCHAIN_EXPLORER_URL}/address/${poll.creator}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-zinc-400 hover:text-emerald-300 transition-colors"
              title={poll.creator}
            >
              {truncatedCreator}
            </a>
          </div>
        </div>
      </div>

      {/* Question */}
      <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 leading-snug">
        {poll.question}
      </h3>

      {/* Poll Meta Stats */}
      <div className="flex items-center justify-between py-2 border-y border-zinc-800/80 text-xs text-zinc-400 mb-4">
        <div>
          <span className="text-zinc-500">Options: </span>
          <span className="font-medium text-zinc-300">
            {poll.optionCount.toString()}
          </span>
        </div>
        <div>
          <span className="text-zinc-500">Total votes: </span>
          <span className="font-semibold text-emerald-400">{totalVotes}</span>
        </div>
      </div>

      {/* Action / Status Button Area */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Main Status or Vote Button */}
        {!isActive ? (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-750 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Poll Closed • View Results</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        ) : hasVoted ? (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/40 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Already Voted • View Live Results</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-400 text-black hover:bg-emerald-300 shadow-md shadow-emerald-950/50 transition-all active:scale-95"
          >
            <Vote className="w-3.5 h-3.5" />
            <span>{isExpanded ? "Hide Voting" : "Vote"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Creator Close Poll Option */}
        {isCreator && isActive && (
          <button
            type="button"
            onClick={handleClosePoll}
            disabled={isClosePending || isCloseConfirming}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-950/30 border border-rose-800/40 hover:bg-rose-900/40 transition-colors disabled:opacity-50"
          >
            {isClosePending || isCloseConfirming ? (
              <Loader2 className="w-3 h-3 animate-spin text-rose-400" />
            ) : (
              <Lock className="w-3 h-3 text-rose-400" />
            )}
            <span>
              {isClosePending
                ? "Confirm in wallet..."
                : isCloseConfirming
                ? "Closing..."
                : "Close Poll"}
            </span>
          </button>
        )}
      </div>

      {/* Expanded Content Area (Voting UI or Results) */}
      {isExpanded && (
        <div className="mt-5 pt-5 border-t border-zinc-800/80">
          {isOptionsLoading ? (
            <div className="py-6 flex items-center justify-center text-xs text-zinc-500 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Loading poll options...</span>
            </div>
          ) : !isActive || hasVoted ? (
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Current Blockchain Results
              </h4>
              <Results options={options} totalVotes={totalVotes} />
            </div>
          ) : (
            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Cast Your On-Chain Vote
              </h4>
              <VotePanel
                pollId={poll.id}
                options={options}
                onVoteSuccess={handleVoteCompleted}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
