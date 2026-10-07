"use client";

import React from "react";
import { OptionData } from "../lib/contracts";

interface ResultsProps {
  options: OptionData[];
  totalVotes: number;
}

export function Results({ options, totalVotes }: ResultsProps) {
  // Find highest vote count for subtle highlight
  const maxVotes = options.reduce((max, opt) => {
    const count = Number(opt.voteCount);
    return count > max ? count : max;
  }, 0);

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const votes = Number(option.voteCount);
        const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
        const isLeading = maxVotes > 0 && votes === maxVotes;

        return (
          <div
            key={option.id.toString()}
            className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors"
          >
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className={`font-medium ${isLeading ? "text-emerald-300 font-semibold" : "text-zinc-200"}`}>
                {option.text}
                {isLeading && (
                  <span className="ml-2 text-[10px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Leading
                  </span>
                )}
              </span>
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span>{votes} {votes === 1 ? "vote" : "votes"}</span>
                <span className="text-zinc-500">•</span>
                <span className="font-semibold text-zinc-200">{percentage}%</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isLeading
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                    : "bg-gradient-to-r from-zinc-600 to-zinc-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
