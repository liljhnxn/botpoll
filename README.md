# BotPoll 🗳️

A simple, polished, decentralized on-chain polling dApp on **Botchain Testnet**. Every poll, option, and vote is stored and verified directly on the smart contract without any intermediate database or backend.

---

## Features

- **On-Chain Poll Creation**: Anyone can create a poll with 2 to 4 options directly on Botchain Testnet.
- **Single Vote Protection**: Each connected wallet can only vote once per poll (enforced at the smart contract level).
- **Live On-Chain Results**: Vote counts and percentages update transparently based on actual blockchain state.
- **Poll Closing**: Poll creators can close their polls anytime; closed polls stop accepting votes while preserving immutable results.
- **Dark Web3 Aesthetic**: Sleek UI with subtle glows, responsive layout, and real-time transaction lifecycle feedback.
- **Network Guard**: Built-in network detection and seamless switching to Botchain Testnet (Chain ID 968).

---

## Tech Stack

- **Smart Contract**: Solidity `^0.8.24`, Hardhat, ethers.js v6
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Web3**: Wagmi v2, Viem, @tanstack/react-query
- **Icons**: Lucide React

---

## Botchain Testnet Configuration

| Parameter | Value |
|---|---|
| **Network Name** | Botchain Testnet |
| **Chain ID** | `968` |
| **RPC URL** | [https://rpc.bohr.life](https://rpc.bohr.life) |
| **Block Explorer** | [https://scan.bohr.life](https://scan.bohr.life) |
| **Native Token** | `BOT` |

---

## Project Structure

```text
bot-poll/
├── contracts/
│   └── BotPoll.sol         # Core smart contract
├── test/
│   └── BotPoll.ts          # Comprehensive unit test suite (12 tests)
├── scripts/
│   └── deploy.ts           # Deployment script targeting Botchain Testnet
├── frontend/
│   ├── app/
│   │   ├── page.tsx        # Main polling feed (Active / Closed / All)
│   │   └── create/
│   │       └── page.tsx    # Create poll page
│   ├── components/
│   │   ├── WalletButton.tsx
│   │   ├── PollCard.tsx
│   │   ├── PollForm.tsx
│   │   ├── VotePanel.tsx
│   │   ├── Results.tsx
│   │   └── Providers.tsx
│   └── lib/
│       ├── contracts.ts    # Contract ABI, address, and explorer config
│       ├── network.ts      # Botchain Testnet chain definition
│       └── wagmi.ts        # Wagmi client configuration
├── .env.example
├── hardhat.config.ts
├── package.json
└── README.md
```

---

## Installation & Setup

1. **Clone & Install Dependencies**:
   ```bash
   # Install root and hardhat dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your private key for deployment:
   ```env
   PRIVATE_KEY=your_botchain_testnet_private_key
   BOTCHAIN_RPC_URL=https://rpc.bohr.life
   NEXT_PUBLIC_BOT_POLL_ADDRESS=
   ```

---

## Testing

Run the Hardhat test suite:
```bash
npm test
```
Runs 12 unit tests verifying:
- Poll creation (valid poll, empty question rejected, < 2 options rejected, > 4 options rejected, empty option rejected)
- Voting (successful vote, vote count increases, VoteCast emitted, double voting blocked, invalid option rejected, nonexistent poll rejected)
- Closing (creator close allowed, non-creator close blocked, voting on closed poll blocked)

---

## Deployment

Deploy the `BotPoll` smart contract to Botchain Testnet:
```bash
npm run deploy
```

The script will output:
- Contract Address
- Transaction Hash
- Chain ID (`968`)
- BohrScan Explorer URL

Once deployed, copy the contract address and update `.env` (or `frontend/.env.local`):
```env
NEXT_PUBLIC_BOT_POLL_ADDRESS=0xYourDeployedContractAddress
```

Verify contract source code on BohrScan:
```bash
npm run verify <CONTRACT_ADDRESS>
```

Currently deployed & verified contract on Botchain Testnet:
- **Contract Address**: [`0xA583957f5386260D772803B6d38aFF08D88f2613`](https://scan.bohr.life/address/0xA583957f5386260D772803B6d38aFF08D88f2613#code)
- **Status**: Verified Source Code & ABI on BohrScan


---

## Running the Frontend

Start the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

Build for production:
```bash
npm run build
```

Run linter:
```bash
npm run lint
```

---

## Usage

1. **Connect Wallet**: Click "Connect Wallet" in the header. If connected to another network, click "Switch to Botchain Testnet".
2. **Browse Polls**: View active and closed polls with real-time on-chain stats.
3. **Vote**: Expand an active poll, select an option, and click "Cast Vote". Confirm in your wallet.
4. **Create Poll**: Click "Create Poll", enter your question and 2–4 options, and submit the transaction to Botchain.
5. **Close Poll**: If you are the creator of an active poll, you can click "Close Poll" to stop further voting.

---

## Limitations

- Minimalist MVP architecture: Direct on-chain reads without an external centralized indexing server or database.
- Up to 4 options per poll to maintain low gas consumption and simplicity.
- Double voting prevention is mapped per address (`hasVoted[pollId][voter]`).
