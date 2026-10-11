import React, { useState } from 'react';
import { LedgerBlock, BlockchainTransaction, SmartContractMethod } from '../types/framework';
import { SMART_CONTRACT_METHODS } from '../data/mockTopology';
import { Database, CheckCircle2, Search, Download, ArrowRight, ShieldCheck, Eye, Terminal } from 'lucide-react';

interface BlockchainLedgerViewProps {
  blocks: LedgerBlock[];
  onSelectTransaction: (tx: BlockchainTransaction) => void;
}

export const BlockchainLedgerView: React.FC<BlockchainLedgerViewProps> = ({
  blocks,
  onSelectTransaction
}) => {
  const [selectedBlockHeight, setSelectedBlockHeight] = useState<number>(blocks[0]?.blockHeight ?? 1042);
  const [selectedContractTab, setSelectedContractTab] = useState<'IntrusionRegistry' | 'FederatedConsensus' | 'DefenseOrchestrator'>('IntrusionRegistry');
  const [contractInputValues, setContractInputValues] = useState<Record<string, string>>({});
  const [contractCallOutput, setContractCallOutput] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedBlock = blocks.find(b => b.blockHeight === selectedBlockHeight) || blocks[0];

  // Contract methods for current tab
  const activeMethod = SMART_CONTRACT_METHODS.find(m => m.contract === selectedContractTab) || SMART_CONTRACT_METHODS[0];

  const handleSimulateContractCall = (e: React.FormEvent) => {
    e.preventDefault();
    const fakeTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const output = `[Smart Contract Execution: ${activeMethod.contract}.${activeMethod.name}]
Transaction Hash: ${fakeTxHash}
Status: 0x1 (SUCCESS)
Gas Consumed: 48,290 gas
Consensus Validators Signed: 3/3 (Core-US, Core-EU, Fog-Tokyo)
Zero-Knowledge Invariant Check: PASSED (Groth16 BN254)
Event Emitted: ${activeMethod.contract}Event(caller=0x71C...a829, timestamp=${Date.now()})
State Change: Immutable distributed ledger updated successfully.`;
    setContractCallOutput(output);
  };

  const handleExportFullLedger = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(blocks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aegiscloud_full_blockchain_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredTransactions = selectedBlock?.transactions.filter(tx => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return tx.txHash.toLowerCase().includes(q) ||
           tx.senderNodeId.toLowerCase().includes(q) ||
           tx.type.toLowerCase().includes(q) ||
           tx.payloadSummary.toLowerCase().includes(q);
  }) || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-6 py-6">
      {/* Title & Blockchain Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Consortium Blockchain Ledger & Smart Contracts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable, Byzantine Fault-Tolerant ledger storing verified threat hashes, federated model consensus records, and autonomous mitigation rules.
          </p>
        </div>

        <button
          onClick={handleExportFullLedger}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Ledger Proofs (.JSON)</span>
        </button>
      </div>

      {/* Block Explorer & Block Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Blocks List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <span>Blocks ({blocks.length})</span>
            <span className="text-slate-500 font-mono">PoA Consensus</span>
          </div>

          <div className="space-y-2.5">
            {blocks.map(block => {
              const isSelected = block.blockHeight === selectedBlockHeight;
              return (
                <div
                  key={block.blockHeight}
                  onClick={() => setSelectedBlockHeight(block.blockHeight)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono font-bold text-cyan-400">
                      Block #{block.blockHeight}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {block.transactionsCount} TXs
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-[11px] text-slate-400">
                    <div className="truncate">
                      Hash: <span className="text-slate-300">{block.blockHash.slice(0, 18)}...</span>
                    </div>
                    <div>
                      Validator: <span className="text-slate-300">{block.validatorNodeId}</span>
                    </div>
                    <div>
                      Gas Used: <span className="text-slate-300 tabular-nums">{block.gasUsed.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Block Deep Inspector & Transactions (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/70 rounded-xl border border-slate-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-mono text-cyan-400 mb-1">
                Block Height #{selectedBlock.blockHeight}
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Block Cryptographic Header & Merkle Root
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Consensus Finalized</span>
            </div>
          </div>

          {/* Cryptographic Hashes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block mb-1">Block Hash</span>
              <span className="text-cyan-300 break-all select-all font-semibold">
                {selectedBlock.blockHash}
              </span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block mb-1">Previous Hash</span>
              <span className="text-slate-300 break-all select-all">
                {selectedBlock.previousHash}
              </span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block mb-1">Merkle Root</span>
              <span className="text-indigo-300 break-all select-all">
                {selectedBlock.merkleRoot}
              </span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block mb-1">zk-SNARK State Root</span>
              <span className="text-emerald-300 break-all select-all">
                {selectedBlock.zkSnarkProofRoot}
              </span>
            </div>
          </div>

          {/* Transactions in Block */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Transactions ({filteredTransactions.length})
              </h3>
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredTransactions.map(tx => (
                <div
                  key={tx.txHash}
                  className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800/80 hover:border-slate-700 transition-colors flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-semibold">
                        {tx.txHash.slice(0, 14)}...
                      </span>
                      <span className="text-slate-500 font-mono">·</span>
                      <span className="font-mono text-slate-300 font-medium">
                        {tx.type}
                      </span>
                      <span className="text-slate-500 font-mono">·</span>
                      <span className="text-slate-400">
                        {tx.smartContract}.sol
                      </span>
                    </div>
                    <p className="text-slate-300 leading-normal text-xs">{tx.payloadSummary}</p>
                    <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2 pt-0.5">
                      <span>Sender: {tx.senderNodeId}</span>
                      <span>·</span>
                      <span className="text-indigo-400">
                        {tx.privacyParameters.epsilonDP > 0 ? `ε=${tx.privacyParameters.epsilonDP.toFixed(2)}` : 'ε=0.00'}
                      </span>
                      <span>·</span>
                      <span className="text-emerald-400">zk-SNARK Validated</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectTransaction(tx)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                    title="Inspect cryptographic proof"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Smart Contracts Console & Interactive Method Execution */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Smart Contract Execution Console</h2>
            <p className="text-xs text-slate-400">Simulate on-chain calls with client-side zero-knowledge proof checks</p>
          </div>

          {/* Segmented contract selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 self-start">
            <button
              onClick={() => { setSelectedContractTab('IntrusionRegistry'); setContractCallOutput(null); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedContractTab === 'IntrusionRegistry' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              IntrusionRegistry
            </button>
            <button
              onClick={() => { setSelectedContractTab('FederatedConsensus'); setContractCallOutput(null); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedContractTab === 'FederatedConsensus' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              FederatedConsensus
            </button>
            <button
              onClick={() => { setSelectedContractTab('DefenseOrchestrator'); setContractCallOutput(null); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedContractTab === 'DefenseOrchestrator' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DefenseOrchestrator
            </button>
          </div>
        </div>

        {/* Method Execution Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleSimulateContractCall} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-400">
                  function {activeMethod.name}()
                </span>
                <span className="text-xs text-slate-500 font-mono">public returns (bool)</span>
              </div>
              <p className="text-xs text-slate-400">{activeMethod.description}</p>
            </div>

            <div className="space-y-3 pt-2">
              {activeMethod.inputs.map(input => (
                <div key={input.name} className="space-y-1">
                  <label htmlFor={`input-${input.name}`} className="flex items-center justify-between text-xs text-slate-300 font-mono">
                    <span>{input.name}</span>
                    <span className="text-slate-500">{input.type}</span>
                  </label>
                  <input
                    id={`input-${input.name}`}
                    type="text"
                    placeholder={input.placeholder}
                    value={contractInputValues[input.name] || ''}
                    onChange={(e) => setContractInputValues(prev => ({ ...prev, [input.name]: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Broadcast Transaction to Consortium</span>
            </button>
          </form>

          {/* Execution Output Console */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Consensus Execution Terminal
            </span>
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 min-h-[220px] whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {contractCallOutput ? (
                <span className="text-cyan-300">{contractCallOutput}</span>
              ) : (
                <span className="text-slate-600">
                  Ready for contract invocation. Fill in parameters and click &ldquo;Broadcast Transaction to Consortium&rdquo; to test decentralized verification.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
