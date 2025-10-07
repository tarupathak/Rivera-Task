// config/chains.ts
import { Chain, getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

// Botanix Mainnet
export const botanixMainnet: Chain = {
  id: 3637,
  name: "Botanix",
  nativeCurrency: {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.ankr.com/botanix_mainnet"],
    },
  },
  blockExplorers: {
    default: {
      name: "Botanix Explorer",
      url: "https://botanixscan.io/",
    },
  },
  testnet: false,
};

// Plume Testnet
export const plumeTestnet: Chain = {
  id: 98866,
  name: "Plume",
  nativeCurrency: {
    name: "Plume Token",
    symbol: "PLUME",
    decimals: 18,
  },
  rpcUrls: {
    default: { 
      http: ["https://rpc.plume.org/"] 
    },
  },
  blockExplorers: {
    default: { 
      name: "PlumeScan", 
      url: "https://explorer.plume.org" 
    },
  },
  testnet: true,
};

// Export RainbowKit config
export const config = getDefaultConfig({
  appName: "FVH Claim App",
  projectId: "YOUR_PROJECT_ID", // Replace with your WalletConnect Project ID
  chains: [botanixMainnet, plumeTestnet],
  ssr: true,
});