"use client";

import React, { useState } from "react";
import { useAccount, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { BOT_POLL_ABI, BOT_POLL_ADDRESS, BOTCHAIN_CHAIN_ID, BOTCHAIN_EXPLORER_URL, OptionData } from "../lib/contracts";
import { botchainTestnet } from "../lib/network";
import { CheckCircle2, AlertCircle, ExternalLink, Loader2 } from "lucide-react";

interface VotePanelProps {
  pollId: bigint;
  options: OptionData[];
  onVoteSuccess?: () => void;
}

export function VotePanel({ pollId, options, onVoteSuccess }: VotePanelProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  const {
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    writeContractAsync,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const isWrongChain = currentChainId !== BOTCHAIN_CHAIN_ID;

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (selectedOptionId === null) {
      setValidationError("Please select an option before voting.");
      return;
    }

    if (!isConnected) {
      setValidationError("Please connect your wallet first.");
      return;
    }

    if (isWrongChain) {
      setValidationError("Please switch to Botchain Testnet to cast your vote.");
      return;
    }

    if (!BOT_POLL_ADDRESS) {
      setValidationError("BotPoll contract is not configured.");
      return;
    }

    try {
      await writeContractAsync({
        address: BOT_POLL_ADDRESS,
        abi: BOT_POLL_ABI,
        functionName: "vote",
        args: [pollId, BigInt(selectedOptionId)],
      });
    } catch (err: unknown) {
      console.error("Voting failed:", err);
    }
  };

  React.useEffect(() => {
    if (isConfirmed && onVoteSuccess) {
      onVoteSuccess();
    }
  }, [isConfirmed, onVoteSuccess]);

  // Successfully confirmed state
  if (isConfirmed && txHash) {
    return (
      <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Vote submitted successfully!</span>
        </div>
        <p className="text-xs text-zinc-300">
          Your vote has been permanently recorded on Botchain.
        </p>
        <div className="pt-2">
          <a
            href={`${BOTCHAIN_EXPLORER_URL}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-300 hover:text-emerald-200 underline decoration-emerald-500/50 hover:decoration-emerald-300 transition-colors"
          >
            <span>Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleVoteSubmit} className="space-y-4">
      {/* Radio options */}
      <div className="space-y-2">
        {options.map((option) => {
          const optId = Number(option.id);
          const isSelected = selectedOptionId === optId;
          return (
            <label
              key={optId}
              onClick={() => {
                setSelectedOptionId(optId);
                setValidationError(null);
              }}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                isSelected
                  ? "bg-emerald-500/10 border-emerald-500/50 text-white shadow-sm shadow-emerald-950/50"
                  : "bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:border-zinc-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? "border-emerald-400 bg-emerald-500"
                    : "border-zinc-600 bg-zinc-800"
                }`}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
              </div>
              <span className="text-sm font-medium">{option.text}</span>
            </label>
          );
        })}
      </div>

      {/* Validation or contract error */}
      {(validationError || writeError || receiptError) && (
        <div className="flex items-start gap-2 p-3 text-xs rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>
            {validationError ||
              (writeError ? "Transaction failed." : "Transaction failed.")}
          </span>
        </div>
      )}

      {/* Status Indicators */}
      {isWritePending && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Confirm in wallet...</span>
        </div>
      )}

      {isConfirming && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Transaction pending...</span>
        </div>
      )}

      {/* Submit Button */}
      {isWrongChain ? (
        <button
          type="button"
          onClick={() => switchChain({ chainId: botchainTestnet.id })}
          className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg text-amber-950 bg-amber-400 hover:bg-amber-300 transition-colors"
        >
          Switch to Botchain Testnet
        </button>
      ) : (
        <button
          type="submit"
          disabled={isWritePending || isConfirming || selectedOptionId === null}
          className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg text-black bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-950/50 transition-all duration-150"
        >
          {isWritePending
            ? "Confirm in wallet..."
            : isConfirming
            ? "Transaction pending..."
            : "Cast Vote"}
        </button>
      )}
    </form>
  );
}
