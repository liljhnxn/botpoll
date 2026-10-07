import React from "react";
import Link from "next/link";
import { PollForm } from "../../components/PollForm";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Poll | BotPoll",
  description: "Create an on-chain community poll on Botchain Testnet.",
};

export default function CreatePollPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to polls</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
          <PlusCircle className="w-3 h-3" />
          <span>New Proposal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Create an On-Chain Poll
        </h1>
        <p className="text-sm text-zinc-400">
          Pose a question to the community. Polls and voting options are stored directly on Botchain Testnet.
        </p>
      </div>

      {/* Form */}
      <PollForm />
    </div>
  );
}
