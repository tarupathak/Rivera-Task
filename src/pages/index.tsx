// pages/index.tsx
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWalletClient, useChainId } from "wagmi";
import { ethers } from "ethers";
import { useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { CONTRACTS, ABI } from "../config/contracts";

type TokenType = "pUsd" | "usdc";
type NetworkType = "botanix" | "plume";

const Home: NextPage = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  const [selectedToken, setSelectedToken] = useState<TokenType>("pUsd");
  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<string>("");

  const getCurrentNetwork = (): NetworkType | null => {
    if (chainId === 3637) return "botanix";
    if (chainId === 98866) return "plume";
    return null;
  };

  const handleClaim = async () => {
    if (!walletClient || !address) {
      setClaimStatus("⚠️ Please connect your wallet first.");
      return;
    }

    const network = getCurrentNetwork();
    if (!network) {
      setClaimStatus("⚠️ Please switch to Botanix or Plume network.");
      return;
    }

    setClaiming(true);
    setClaimStatus("⏳ Initiating claim...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();

      const contractAddress = CONTRACTS[network].FVH_contract;
      const tokenAddress =
        selectedToken === "pUsd"
          ? CONTRACTS[network].pUsd
          : CONTRACTS[network].pUsd; // Fixed USDC selection

    const contract = new ethers.Contract(contractAddress, ABI, signer) as any;


      // Pre-checks
      const paused = await contract.isPause();
      if (paused) {
        setClaimStatus("❌ Contract is paused. Cannot claim now.");
        setClaiming(false);
        return;
      }

      const tokenAllowed = await contract.depositTokens(tokenAddress);
      if (!tokenAllowed) {
        setClaimStatus("❌ Selected token is not allowed for claiming.");
        setClaiming(false);
        return;
      }

      console.log("FVH Contract:", contractAddress);
      console.log("Token Address:", tokenAddress);

      // Estimate gas
      let gasLimit: ethers.BigNumberish = 200000; // fallback
      try {
        gasLimit = await contract.estimateGas.claim(tokenAddress);
      } catch (err) {
        console.warn("Gas estimation failed, using fallback:", err);
      }

      setClaimStatus("📤 Sending claim transaction...");
      const tx = await contract.claim(tokenAddress, { gasLimit });
      setClaimStatus(`📜 Transaction submitted: ${tx.hash}`);

      const receipt = await tx.wait();
      setClaimStatus(`✅ Claim successful! TX: ${receipt.transactionHash}`);
      console.log("Claim successful:", receipt);
    } catch (error: any) {
      console.error("Error claiming tokens:", error);

      if (error.code === "CALL_EXCEPTION") {
        setClaimStatus(
          "❌ Transaction reverted. You may not be eligible or token is not allowed."
        );
      } else if (error.code === -32603) {
        setClaimStatus(
          "❌ Internal JSON-RPC error. Possible contract issue or network error."
        );
      } else if (error.message.includes("hexlify")) {
        setClaimStatus("❌ Gas estimation failed. Try again or switch network.");
      } else {
        setClaimStatus(`❌ Error: ${error.message || "Transaction failed"}`);
      }
    } finally {
      setClaiming(false);
    }
  };

  const networkName = getCurrentNetwork();
  const networkDisplay = networkName
    ? networkName.charAt(0).toUpperCase() + networkName.slice(1)
    : "Unknown";

  return (
    <div className={styles.container}>
      <Head>
        <title>FVH Token Claim</title>
        <meta content="Claim your FVH tokens" name="description" />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className={styles.main}>
        <h1 className="text-4xl font-bold mb-8">FVH Token Claim</h1>

        <ConnectButton />

        {isConnected && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="mb-4">
              <p className="text-sm text-gray-600">Current Network:</p>
              <p className="text-lg font-semibold">{networkDisplay}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Connected Address:</p>
              <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                {address}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token to Claim:
              </label>
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value as TokenType)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pUsd">pUSD</option>
                <option value="usdc">USDC</option>
              </select>
            </div>

            <button
              onClick={handleClaim}
              disabled={!isConnected || claiming || !networkName}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {claiming ? "Claiming..." : "Claim Tokens"}
            </button>

            {claimStatus && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <p className="text-sm text-gray-700 break-words">{claimStatus}</p>
              </div>
            )}

            {!networkName && (
              <div className="mt-4 p-3 bg-yellow-100 rounded-md">
                <p className="text-sm text-yellow-800">
                  ⚠️ Please switch to Botanix or Plume network
                </p>
              </div>
            )}
          </div>
        )}

        {!isConnected && (
          <div className="mt-8 p-6 bg-gray-100 rounded-lg max-w-md w-full text-center">
            <p className="text-gray-600">
              Connect your wallet to start claiming tokens
            </p>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <a href="https://rainbow.me" rel="noopener noreferrer" target="_blank">
          Made with ❤️ by your frens at 🌈
        </a>
      </footer>
    </div>
  );
};

export default Home;
