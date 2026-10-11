import React from 'react';
import { CloudNode, LedgerBlock, MitigationRule, BlockchainTransaction, AttackScenario } from '../types/framework';
import { ShieldCheck, Server, Database, Lock, ArrowRight, Play, Eye } from 'lucide-react';
import { ThreatHeatmap24h } from './ThreatHeatmap24h';

interface OverviewViewProps {
  nodes: CloudNode[];
  blocks: LedgerBlock[];
  mitigationRules: MitigationRule[];
  attackScenarios: AttackScenario[];
  onSelectTransaction: (tx: BlockchainTransaction) => void;
  onNavigateTab: (tab: 'topology' | 'federated' | 'homomorphic' | 'audit' | 'ledger' | 'simulator' | 'models') => void;
  onRunAttack: (scenario: AttackScenario) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  nodes,
  blocks,
  mitigationRules,
  attackScenarios,
  onSelectTransaction,
  onNavigateTab,
  onRunAttack
}) => {
  // Aggregate stats
  const totalPackets = nodes.reduce((acc, n) => acc + n.processedPacketsPerSec, 0);
  const avgEpsilon = (nodes.reduce((acc, n) => acc + n.privacyBudgetConsumed, 0) / nodes.length).toFixed(2);
  const recentTransactions = blocks.flatMap(b => b.transactions).slice(0, 5);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-6 py-6">
      {/* Top Banner / Framework Introduction */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <span>AegisCloud Ubiquitous Cyber-Defense Continuum</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white text-balance">
            Privacy-Preserving AI & Consortium Blockchain for Intrusion Detection
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Protecting hybrid multi-tenant cloud, fog gateways, and edge clusters through federated neural anomaly detection, calibrated differential privacy noise, and zero-knowledge immutable ledger consensus.
          </p>
        </div>
        <div className="flex flex-wrap md:flex-col gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('simulator')}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Threat Lab</span>
          </button>
          <button
            onClick={() => onNavigateTab('models')}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <span>Hugging Face Models</span>
          </button>
          <button
            onClick={() => onNavigateTab('homomorphic')}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <span>Homomorphic AI (HE)</span>
          </button>
          <button
            onClick={() => onNavigateTab('audit')}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <span>Blockchain Audit Trail</span>
          </button>
        </div>
      </div>

      {/* 4 Quantitative Rigor Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Ubiquitous Cloud Nodes</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {nodes.filter(n => n.status === 'healthy').length}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {nodes.length} online</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-800/60">
            <span>Throughput:</span>
            <span className="font-mono text-cyan-300 tabular-nums font-medium">
              {totalPackets.toLocaleString()} pkts/s
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Global FL Accuracy</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">98.42%</span>
            <span className="text-xs text-emerald-400 font-mono">F1 0.985</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-800/60">
            <span>FPR:</span>
            <span className="font-mono text-emerald-300 tabular-nums font-medium">0.24% calibrated</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Average Privacy Loss (ε)</span>
            <Lock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">{avgEpsilon}</span>
            <span className="text-xs text-slate-400 font-mono">/ 10.0 max ε</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-800/60">
            <span>Guarantee:</span>
            <span className="font-mono text-indigo-300 font-medium">Zero-Leakage (δ=1e-5)</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Blockchain Rules</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {mitigationRules.filter(r => r.status === 'Active').length}
            </span>
            <span className="text-xs text-slate-400 font-mono">Rules deployed</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-800/60">
            <span>Block Height:</span>
            <span className="font-mono text-cyan-300 tabular-nums font-medium">
              #{blocks[0]?.blockHeight ?? 1042}
            </span>
          </div>
        </div>
      </div>

      {/* 24-Hour Threat Occurrence Heatmap & Recharts Temporal Analytics */}
      <ThreatHeatmap24h nodes={nodes} />

      {/* Mechanism-to-Outcome Pipeline Visualization */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">5-Stage Privacy-Preserving Threat Defense Pipeline</h2>
            <p className="text-xs text-slate-400">Continuous telemetry processing across the ubiquitous cloud-edge continuum</p>
          </div>
          <button
            onClick={() => onNavigateTab('topology')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Inspect Cloud Nodes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {/* Stage 1 */}
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800/80 space-y-2">
            <div className="text-[11px] font-mono text-cyan-400">01. Ingress & Flow Extraction</div>
            <h3 className="text-xs font-semibold text-white">Ubiquitous Cloud Ingress</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              High-frequency packet headers parsed at Edge/Fog without saving user raw payloads or decrypting TLS sessions.
            </p>
            <div className="pt-2 text-[10px] text-slate-500 font-mono">
              Entropy & Flow Durations
            </div>
          </div>

          {/* Stage 2 */}
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800/80 space-y-2">
            <div className="text-[11px] font-mono text-cyan-400">02. On-Device AI</div>
            <h3 className="text-xs font-semibold text-white">Federated Autoencoder</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Lightweight local neural detector calculates reconstruction loss anomalies and updates gradient tensors privately.
            </p>
            <div className="pt-2 text-[10px] text-slate-500 font-mono">
              Inference Latency &lt; 2.5ms
            </div>
          </div>

          {/* Stage 3 */}
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800/80 space-y-2">
            <div className="text-[11px] font-mono text-cyan-400">03. Privacy Guard</div>
            <h3 className="text-xs font-semibold text-white">DP Noise + zk-SNARK</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Norm clipping C + Gaussian noise perturbation applied. Groth16 zk-proof constructed to prove attack fidelity.
            </p>
            <div className="pt-2 text-[10px] text-slate-500 font-mono">
              ε = 0.8 · δ = 1e-5
            </div>
          </div>

          {/* Stage 4 */}
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800/80 space-y-2">
            <div className="text-[11px] font-mono text-cyan-400">04. Consortium Consensus</div>
            <h3 className="text-xs font-semibold text-white">Blockchain Validation</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Byzantine Fault Tolerant consortium verifies zk-proof on-chain; registers threat hash in IntrusionRegistry.sol.
            </p>
            <div className="pt-2 text-[10px] text-slate-500 font-mono">
              PBFT &lt; 150ms Finality
            </div>
          </div>

          {/* Stage 5 */}
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800/80 space-y-2">
            <div className="text-[11px] font-mono text-cyan-400">05. Autonomous Response</div>
            <h3 className="text-xs font-semibold text-white">Global Mitigation Push</h3>
            <p className="text-[11px] text-slate-400 leading-normal">
              Smart contract broadcasts dynamic eBPF drop filters and token revocations to all 6 cloud endpoints instantaneously.
            </p>
            <div className="pt-2 text-[10px] text-slate-500 font-mono">
              Zero-Trust Autonomous Defense
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Active Defenses & Quick Attack Launch Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Synchronized Mitigation Rules */}
        <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-white">Active Cryptographic Defense Policies</h2>
              <p className="text-xs text-slate-400">Immutable eBPF & filter rules enforced across all cloud nodes</p>
            </div>
            <button
              onClick={() => onNavigateTab('ledger')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
            >
              Smart Contracts
            </button>
          </div>

          <div className="space-y-2.5">
            {mitigationRules.map(rule => (
              <div 
                key={rule.id}
                className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800/80 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-cyan-400">{rule.id}</span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="font-mono text-xs text-slate-400">{rule.ruleType}</span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-emerald-400 font-medium">Enforced on {rule.enforcedNodesCount}/6 Nodes</span>
                  </div>
                  <p className="text-xs text-slate-200 font-mono">{rule.targetPattern}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Committed at Block #{rule.blockHeight} · Origin TX {rule.originTxHash.slice(0, 14)}...</p>
                </div>
                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  {rule.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quick Attack Vector Simulation */}
        <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-white">Interactive Attack Simulator</h2>
              <p className="text-xs text-slate-400">Evaluate defense responses against MITRE ATT&CK techniques</p>
            </div>
            <button
              onClick={() => onNavigateTab('simulator')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
            >
              Full Simulator Lab
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {attackScenarios.slice(0, 4).map(scenario => (
              <button
                key={scenario.id}
                onClick={() => onRunAttack(scenario)}
                className="text-left bg-slate-950/80 hover:bg-slate-800/80 p-3 rounded-lg border border-slate-800/80 transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                    {scenario.name}
                  </span>
                  <Play className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {scenario.mitreTechnique.split('-')[0].trim()}
                </div>
                <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1.5">
                  <span>Target:</span>
                  <span className="font-mono text-slate-400">{scenario.targetTier.replace('_', ' ')}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Blockchain Ledger Activity */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Recent Immutable Ledger Activity</h2>
            <p className="text-xs text-slate-400">Real-time smart contract events with verified cryptographic signatures</p>
          </div>
          <button
            onClick={() => onNavigateTab('ledger')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer"
          >
            View All Blocks & TXs
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 pl-2">TX Hash</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Sender Node</th>
                <th className="pb-3">Contract</th>
                <th className="pb-3">Privacy ε</th>
                <th className="pb-3">zk-Proof</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {recentTransactions.map(tx => (
                <tr key={tx.txHash} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 pl-2 text-cyan-300">
                    {tx.txHash.slice(0, 12)}...{tx.txHash.slice(-6)}
                  </td>
                  <td className="py-3 text-slate-200">
                    {tx.type}
                  </td>
                  <td className="py-3 text-slate-400">
                    {tx.senderNodeId}
                  </td>
                  <td className="py-3 text-slate-300">
                    {tx.smartContract}.sol
                  </td>
                  <td className="py-3 text-indigo-300 tabular-nums">
                    {tx.privacyParameters.epsilonDP > 0 ? `ε=${tx.privacyParameters.epsilonDP.toFixed(2)}` : '0.00'}
                  </td>
                  <td className="py-3 text-emerald-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Groth16 Valid</span>
                    </span>
                  </td>
                  <td className="py-3 pr-2 text-right">
                    <button
                      onClick={() => onSelectTransaction(tx)}
                      className="px-2 py-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
