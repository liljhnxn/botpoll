"use client";

import React, { useState } from "react";
import { useAccount, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useRouter } from "next/navigation";
import {
  BOT_POLL_ABI,
  BOT_POLL_ADDRESS,
  BOTCHAIN_CHAIN_ID,
  BOTCHAIN_EXPLORER_URL,
  IS_CONTRACT_CONFIGURED,
  CONTRACT_NOT_CONFIGURED_MESSAGE,
} from "../lib/contracts";
import { botchainTestnet } from "../lib/network";
import { Plus, Trash2, CheckCircle2, AlertCircle, ExternalLink, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function PollForm() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [formError, setFormError] = useState<string | null>(null);

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

  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!IS_CONTRACT_CONFIGURED || !BOT_POLL_ADDRESS) {
      setFormError(CONTRACT_NOT_CONFIGURED_MESSAGE);
      return;
    }

    if (!isConnected) {
      setFormError("Please connect your wallet first.");
      return;
    }

    if (isWrongChain) {
      setFormError("Please switch to Botchain Testnet to create a poll.");
      return;
    }

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setFormError("Question is required.");
      return;
    }

    if (trimmedQuestion.length > 280) {
      setFormError("Question must not exceed 280 characters.");
      return;
    }

    const trimmedOptions = options.map((opt) => opt.trim());
    const validOptions = trimmedOptions.filter(Boolean);

    if (validOptions.length < 2) {
      setFormError("At least 2 options are required.");
      return;
    }

    if (validOptions.length > 4) {
      setFormError("Maximum 4 options allowed.");
      return;
    }

    // Check if any option field that was entered is empty
    for (let i = 0; i < options.length; i++) {
      if (!options[i].trim()) {
        setFormError(`Option ${i + 1} cannot be empty.`);
        return;
      }
      if (options[i].trim().length > 100) {
        setFormError(`Option ${i + 1} must not exceed 100 characters.`);
        return;
      }
    }

    try {
      await writeContractAsync({
        address: BOT_POLL_ADDRESS,
        abi: BOT_POLL_ABI,
        functionName: "createPoll",
        args: [trimmedQuestion, validOptions],
      });
    } catch (err: unknown) {
      console.error("Failed to create poll:", err);
    }
  };

  if (isConfirmed && txHash) {
    return (
      <div className="bg-zinc-900/70 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 space-y-5 text-center shadow-xl shadow-emerald-950/20">
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            Poll created successfully!
          </h2>
          <p className="text-sm text-zinc-400">
            Your poll has been published to Botchain Testnet and is now open for voting.
          </p>
        </div>

        <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
          <p className="text-xs text-zinc-500 mb-1">Transaction Hash</p>
          <a
            href={`${BOTCHAIN_EXPLORER_URL}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 underline transition-colors break-all"
          >
            <span>{txHash}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-emerald-400 text-black hover:bg-emerald-300 transition-colors shadow-lg shadow-emerald-950/50"
          >
            <ArrowLeft className="w-4 h-4" />
            View All Polls
          </Link>
          <button
            type="button"
            onClick={() => {
              setQuestion("");
              setOptions(["", ""]);
              router.refresh();
            }}
            className="px-6 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Create Another Poll
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl shadow-black/30">
      {/* Question Field */}
      <div>
        <label
          htmlFor="question"
          className="block text-sm font-semibold text-zinc-200 mb-2"
        >
          Poll Question <span className="text-emerald-400">*</span>
        </label>
        <input
          id="question"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Which Web3 feature should we build next?"
          maxLength={280}
          className="w-full px-4 py-3 rounded-xl bg-zinc-950/70 border border-zinc-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-zinc-100 placeholder-zinc-500 text-sm transition-all"
        />
        <div className="flex justify-between text-[11px] text-zinc-500 mt-1 px-1">
          <span>Be clear and concise</span>
          <span>{question.length}/280</span>
        </div>
      </div>

      {/* Options Fields */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-zinc-200">
            Options <span className="text-emerald-400">*</span>
          </label>
          <span className="text-xs text-zinc-400">
            {options.length}/4 options (min 2)
          </span>
        </div>

        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500 select-none">
                {index + 1}
              </span>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}${index >= 2 ? " (optional)" : ""}`}
                maxLength={100}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-zinc-100 placeholder-zinc-500 text-sm transition-all"
              />
            </div>

            {options.length > 2 && (
              <button
                type="button"
                onClick={() => handleRemoveOption(index)}
                className="p-2.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-xl transition-colors"
                title="Remove option"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {options.length < 4 && (
          <button
            type="button"
            onClick={handleAddOption}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30 border border-dashed border-emerald-800/60 rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Option</span>
          </button>
        )}
      </div>

      {/* Errors */}
      {(formError || writeError || receiptError) && (
        <div className="flex items-start gap-2 p-3 text-xs rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>
            {formError || (writeError ? "Transaction failed." : "Transaction failed.")}
          </span>
        </div>
      )}

      {/* Status Indicators */}
      {isWritePending && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Confirm in wallet...</span>
        </div>
      )}

      {isConfirming && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Transaction pending...</span>
        </div>
      )}

      {/* Submit Button */}
      {isWrongChain && isConnected ? (
        <button
          type="button"
          onClick={() => switchChain({ chainId: botchainTestnet.id })}
          className="w-full py-3 px-4 text-sm font-semibold rounded-xl text-amber-950 bg-amber-400 hover:bg-amber-300 transition-colors"
        >
          Switch to Botchain Testnet
        </button>
      ) : (
        <button
          type="submit"
          disabled={isWritePending || isConfirming}
          className="w-full py-3 px-4 text-sm font-semibold rounded-xl text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-950/60 transition-all duration-150"
        >
          {isWritePending
            ? "Confirm in wallet..."
            : isConfirming
            ? "Transaction pending..."
            : "Create Poll"}
        </button>
      )}
    </form>
  );
}
