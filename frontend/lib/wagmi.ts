import { http, createConfig } from "wagmi";
import { botchainTestnet } from "./network";
import { injected } from "wagmi/connectors/injected";

export const wagmiConfig = createConfig({
  chains: [botchainTestnet],
  connectors: [injected()],
  ssr: true,
  transports: {
    [botchainTestnet.id]: http("https://rpc.bohr.life"),
  },
});
