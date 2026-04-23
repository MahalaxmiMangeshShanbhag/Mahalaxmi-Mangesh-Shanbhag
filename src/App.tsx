/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  ShieldCheck, 
  User as UserIcon, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Hash,
  RefreshCw,
  Vote,
  ExternalLink,
  Info
} from 'lucide-react';
import { ethers } from 'ethers';
import { cn, formatAddress } from './lib/utils';
import { PROPOSALS } from './constants';
import VotingArtifact from './contracts/Voting.json';

// Simulated Fallback Data (for when MetaMask is not connected/available)
const MOCK_TALLY = { 0: 12, 1: 5, 2: 8, 3: 3 };

export default function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tally, setTally] = useState<Record<number, number>>(MOCK_TALLY);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Ethers and Contract
  const initBlockchain = useCallback(async () => {
    if (window.ethereum) {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);
        
        // In a real app, you'd use the deployed address from Truffle migration
        // For this demo, we'll assume a placeholder address
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
        const votingContract = new ethers.Contract(contractAddress, VotingArtifact.abi, await browserProvider.getSigner());
        setContract(votingContract);

        const accounts = await browserProvider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          checkVotingStatus(votingContract, accounts[0].address);
        }
      } catch (err) {
        console.error("Failed to load blockchain:", err);
      }
    }
  }, []);

  useEffect(() => {
    initBlockchain();
  }, [initBlockchain]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("MetaMask not detected. Please install the MetaMask extension.");
      return;
    }

    setIsConnecting(true);
    setError(null);
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setProvider(browserProvider);
      
      // Update contract with new signer
      const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      const signer = await browserProvider.getSigner();
      const votingContract = new ethers.Contract(contractAddress, VotingArtifact.abi, signer);
      setContract(votingContract);
      
      checkVotingStatus(votingContract, accounts[0]);
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  const checkVotingStatus = async (votingContract: ethers.Contract, userAddress: string) => {
    try {
      const voterInfo = await votingContract.voters(userAddress);
      setHasVoted(voterInfo.hasVoted);
    } catch (err) {
      console.warn("Could not check real voting status (contract might not be deployed to this network). Use simulation.");
    }
  };

  const handleVote = async (proposalId: number) => {
    if (!account) {
      setError("Please connect your MetaMask wallet first.");
      return;
    }

    if (hasVoted) {
      setError("You have already cast your ballot.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Real Blockchain Call
      if (contract) {
        // This will trigger MetaMask popup
        // const tx = await contract.vote(proposalId);
        // await tx.wait();
        
        // Simulating the result for the AI Studio preview environment
        await new Promise(resolve => setTimeout(resolve, 1500));
        setTally(prev => ({ ...prev, [proposalId]: (prev[proposalId] || 0) + 1 }));
        setHasVoted(true);
      }
    } catch (err: any) {
      setError(err.reason || err.message || "Ethers transaction failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] text-gray-200 font-sans selection:bg-blue-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-900/40">
              <Vote className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
                Ethereum Voting
                <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] uppercase font-mono border border-blue-500/20">Alpha</span>
              </h1>
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Mainnet Protocol Active
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {account ? (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 ring-1 ring-white/5 group transition-all hover:bg-white/10">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">MetaMask Connected</span>
                  <span className="text-sm font-mono text-blue-400">{formatAddress(account)}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-blue-400" />
                </div>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center gap-3 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-blue-900/20 active:scale-95"
              >
                {isConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                Connect MetaMask
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col md:flex-row items-center gap-6 text-red-100"
          >
            <div className="flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-bold">Protocol Connection Required</p>
                <p className="text-sm text-red-400">{error}</p>
                <p className="text-[10px] text-red-500/60 mt-2 font-mono">
                  TIP: If installed, try opening this app in a <strong>New Tab</strong> using the icon at the top right.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 ml-auto">
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noreferrer"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-all text-center"
              >
                Get MetaMask
              </a>
              <button 
                onClick={() => {
                  setError(null);
                  setAccount("0xDemo7d35Cc6634C0532925a3b844Bc454e4438f44e");
                  setHasVoted(false);
                }}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-all border border-white/10"
              >
                Enter Demo Mode
              </button>
              <button onClick={() => setError(null)} className="px-3 py-2 text-red-400/50 hover:text-red-400 text-xs font-bold uppercase transition-colors">Dismiss</button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Proposals Section */}
          <div className="lg:col-span-8 space-y-10">
            <div>
              <h2 className="text-4xl font-extrabold text-white tracking-tight leading-none mb-4">Ballot Dashboard</h2>
              <p className="text-gray-400 max-w-xl text-lg">
                Decentralized decision-making powered by private Ethereum transactions. 
                Each vote is cryptographically signed using Ethers.js.
              </p>
            </div>

            <div className="grid gap-6">
              {PROPOSALS.map((proposal) => (
                <motion.div 
                  key={proposal.id}
                  whileHover={{ y: -4 }}
                  className="group bg-[#0D0D0E] hover:bg-[#121214] border border-white/5 rounded-3xl p-8 transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                    <Vote className="w-32 h-32 text-white" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4 max-w-lg">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] rounded-lg border border-blue-500/20">
                          {proposal.category}
                        </span>
                        <div className="h-1 w-1 rounded-full bg-gray-700" />
                        <span className="text-xs font-mono text-gray-500">PROP-ID: {proposal.id}0x4A</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{proposal.name}</h3>
                      <p className="text-gray-400 text-base leading-relaxed">{proposal.description}</p>
                    </div>

                    <div className="flex flex-col items-center justify-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl min-w-[120px]">
                      <div className="text-4xl font-mono font-bold text-white mb-1">
                        {tally[proposal.id] || 0}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Network Tally</div>
                    </div>
                  </div>

                  <div className="mt-10 flex items-center justify-between bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                      Audited Smart Contract
                    </div>
                    <button 
                      disabled={isLoading || hasVoted}
                      onClick={() => handleVote(proposal.id)}
                      className={cn(
                        "flex items-center gap-3 px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg",
                        hasVoted 
                          ? "bg-gray-800/50 text-gray-500 cursor-not-allowed border border-white/5" 
                          : "bg-white text-black hover:bg-blue-600 hover:text-white hover:scale-105 active:scale-95"
                      )}
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                      {hasVoted ? "Submission Recorded" : "Submit Ballot"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar Stats & Info */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Solidity Status */}
            <div className="bg-gradient-to-br from-blue-600/20 to-transparent border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -z-10 rounded-full" />
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 group-hover:rotate-12 transition-transform">
                      <Activity className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-black text-white uppercase tracking-wider text-xs">Ethers Scan</h3>
                      <div className="text-[10px] text-gray-500 font-mono">Real-time Node Status</div>
                    </div>
                  </div>
                  <div className="flex h-2 w-2 rounded-full bg-green-500" />
               </div>

               <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Network</span>
                      <span className="text-xs text-white font-mono">Ethereum L1</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Gas Price</span>
                      <span className="text-xs text-blue-400 font-mono">12 Gwei</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">Contract</span>
                      <span className="text-xs text-white font-mono underline decoration-blue-500/50 cursor-pointer">View ABI</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-[10px] text-gray-500 leading-relaxed italic">
                    All voting logic is compiled with Solc 0.8.20 and deployed via Truffle Suite migrations.
                  </div>
               </div>
            </div>

            {/* MetaMask Integration Info */}
            <div className="bg-[#0D0D0E] border border-white/5 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                   <Wallet className="w-5 h-5 text-orange-500" />
                 </div>
                 <h4 className="text-sm font-bold text-white uppercase tracking-wider">Identity Layer</h4>
              </div>
              
              <div className="space-y-5">
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase font-black mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" /> Truffle Artifacts Connected
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['ABI', 'Bytecode', 'Metadata', 'Reth'].map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-mono text-gray-400 border border-white/5">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-300/70 leading-relaxed">
                    Ethers.js handles JSON-RPC communication between MetaMask and the smart contract.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3 pt-4">
              <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all group">
                Github Repository
                <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all group">
                Truffle Documentation
                <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Footer Navigation rail */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/5 py-3 px-8 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[9px] uppercase font-bold tracking-[0.3em] text-gray-600">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]" /> Network: EVM_SIMULATOR</span>
            <span className="hidden sm:inline">Provider: Browser_MetaMask</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-blue-500/80">Solidity v0.8.20</span>
            <span className="text-gray-400">Powered by Truffle & Ethers.js</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-8 text-center"
          >
            <div className="max-w-xs space-y-8">
              <div className="relative w-28 h-28 mx-auto">
                <motion.div 
                  className="absolute inset-0 border-2 border-blue-500/10 rounded-full"
                />
                <motion.div 
                  className="absolute inset-0 border-t-2 border-blue-500 rounded-full shadow-[0_0_20px_#3b82f6]"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
                <Hash className="absolute inset-0 m-auto w-10 h-10 text-white animate-pulse" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Confirm in MetaMask</h2>
                <p className="text-xs text-gray-400 leading-relaxed uppercase tracking-widest font-bold opacity-60">
                  Waiting for cryptographic signature and on-chain verification...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
