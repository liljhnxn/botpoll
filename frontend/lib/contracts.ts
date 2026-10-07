export const BOTCHAIN_CHAIN_ID = 968;
export const BOTCHAIN_EXPLORER_URL = "https://scan.bohr.life";

// Read from NEXT_PUBLIC_BOT_POLL_ADDRESS environment variable
const rawAddress = process.env.NEXT_PUBLIC_BOT_POLL_ADDRESS?.trim();
export const BOT_POLL_ADDRESS = (rawAddress && rawAddress.startsWith("0x")
  ? (rawAddress as `0x${string}`)
  : undefined);

export const IS_CONTRACT_CONFIGURED = Boolean(BOT_POLL_ADDRESS);
export const CONTRACT_NOT_CONFIGURED_MESSAGE = "BotPoll contract is not configured.";

export const BOT_POLL_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "pollId", type: "uint256" },
    ],
    name: "PollClosed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "pollId", type: "uint256" },
      { indexed: true, internalType: "address", name: "creator", type: "address" },
      { indexed: false, internalType: "string", name: "question", type: "string" },
    ],
    name: "PollCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "pollId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "optionId", type: "uint256" },
      { indexed: true, internalType: "address", name: "voter", type: "address" },
    ],
    name: "VoteCast",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "pollId", type: "uint256" }],
    name: "closePoll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "question", type: "string" },
      { internalType: "string[]", name: "options", type: "string[]" },
    ],
    name: "createPoll",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "pollId", type: "uint256" }],
    name: "getPoll",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "string", name: "question", type: "string" },
          { internalType: "uint256", name: "optionCount", type: "uint256" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "bool", name: "active", type: "bool" },
        ],
        internalType: "struct BotPoll.Poll",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPollCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "pollId", type: "uint256" }],
    name: "getPollOptions",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "string", name: "text", type: "string" },
          { internalType: "uint256", name: "voteCount", type: "uint256" },
        ],
        internalType: "struct BotPoll.Option[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "pollId", type: "uint256" },
      { internalType: "address", name: "voter", type: "address" },
    ],
    name: "hasAddressVoted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "polls",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "string", name: "question", type: "string" },
      { internalType: "uint256", name: "optionCount", type: "uint256" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
      { internalType: "bool", name: "active", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "pollId", type: "uint256" },
      { internalType: "uint256", name: "optionId", type: "uint256" },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export interface PollData {
  id: bigint;
  creator: `0x${string}`;
  question: string;
  optionCount: bigint;
  createdAt: bigint;
  active: boolean;
}

export interface OptionData {
  id: bigint;
  text: string;
  voteCount: bigint;
}
