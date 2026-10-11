import React, { useState } from 'react';
import { FederatedModelRound, CloudNode } from '../types/framework';
import { ShieldCheck, Lock, Sliders, Play, Cpu, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { generateZkProof } from '../utils/crypto';

interface FederatedAIViewProps {
  rounds: FederatedModelRound[];
  nodes: CloudNode[];
  onTriggerFederatedRound: (epsilon: number, clippingNorm: number) => void;
  isProcessingRound: boolean;
}

export const FederatedAIView: React.FC<FederatedAIViewProps> = ({
  rounds,
  nodes,
  onTriggerFederatedRound,
  isProcessingRound
}) => {
  const [epsilonSetting, setEpsilonSetting] = useState<number>(0.8);
  const [clippingNormSetting, setClippingNormSetting] = useState<number>(2.0);
  const [zkVerifiedProof, setZkVerifiedProof] = useState<ReturnType<typeof generateZkProof> | null>(null);

  const deltaSetting = 1e-5;
  // Compute calibrated Gaussian noise scale sigma
  const sigmaScale = (clippingNormSetting * Math.sqrt(2 * Math.log(1.25 / deltaSetting))) / epsilonSetting;
  
  // Theoretical estimated accuracy based on epsilon:
  // higher epsilon -> less noise -> higher accuracy, but less privacy
  const estimatedAccuracy = Math.min(99.6, Math.max(88.0, 99.2 - (0.7 / Math.pow(epsilonSetting, 0.85))));

  const latestRound = rounds[0];

  const handleRunZkProofVerification = () => {
    const proof = generateZkProof(
      `FL_ROUND_${latestRound?.roundNumber || 19}_WEIGHTS`,
      '0x44e5912a7d81230491823bcde9012411d7a5e8412bb940182fc092b77a1094ce',
      epsilonSetting
    );
    setZkVerifiedProof(proof);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-6 py-6">
      {/* Title & Architecture Introduction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Privacy-Preserving Federated Learning & Differential Privacy
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Collaborative intrusion model training without raw telemetry exfiltration. Gradients are clipped, perturbed with Gaussian noise, and validated using zk-SNARKs.
          </p>
        </div>

        <button
          onClick={() => onTriggerFederatedRound(epsilonSetting, clippingNormSetting)}
          disabled={isProcessingRound}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-sm shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isProcessingRound ? 'Aggregating Round...' : 'Execute FL Round'}</span>
        </button>
      </div>

      {/* Interactive Differential Privacy Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Tuners (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/70 rounded-xl border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>(ε, δ)-Differential Privacy Parameter Tuning</span>
            </h2>
            <span className="text-xs font-mono text-cyan-300">Renyi DP Accountant</span>
          </div>

          {/* Slider 1: Epsilon */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="epsilon-slider" className="font-medium text-slate-300">
                Privacy Loss Budget (ε per round)
              </label>
              <span className="font-mono text-cyan-400 font-bold tabular-nums">
                ε = {epsilonSetting.toFixed(2)}
              </span>
            </div>
            <input
              id="epsilon-slider"
              type="range"
              min="0.10"
              max="3.00"
              step="0.05"
              value={epsilonSetting}
              onChange={(e) => setEpsilonSetting(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>0.10 (Strongest Privacy / Higher Noise)</span>
              <span>3.00 (Weaker Privacy / Lower Noise)</span>
            </div>
          </div>

          {/* Slider 2: Clipping Norm */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="clipping-slider" className="font-medium text-slate-300">
                L2 Gradient Clipping Bound (C)
              </label>
              <span className="font-mono text-indigo-400 font-bold tabular-nums">
                C = {clippingNormSetting.toFixed(1)}
              </span>
            </div>
            <input
              id="clipping-slider"
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={clippingNormSetting}
              onChange={(e) => setClippingNormSetting(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>0.5 (Tighter Sensitivity Bound)</span>
              <span>5.0 (Permissive Sensitivity)</span>
            </div>
          </div>

          {/* Mathematical Outputs Strip */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Calibrated Noise Scale (σ)</span>
              <span className="text-lg font-mono font-bold text-white tabular-nums">
                {sigmaScale.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block font-mono mt-0.5">Gaussian Std Dev</span>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Estimated Model Accuracy</span>
              <span className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
                {estimatedAccuracy.toFixed(2)}%
              </span>
              <span className="text-[10px] text-slate-500 block font-mono mt-0.5">Empirical Convergence</span>
            </div>
          </div>

          {/* Theoretical Guarantee Note */}
          <div className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 leading-relaxed">
            <span className="font-semibold text-slate-300">Differential Privacy Guarantee: </span>
            For any two neighboring network traffic flows D, D&apos; differing by a single tenant flow, 
            P[M(D) &isin; S] &le; e<sup>&epsilon;</sup> &middot; P[M(D&apos;) &isin; S] + &delta; with &delta; = 10<sup>-5</sup>.
          </div>
        </div>

        {/* Right Column: Byzantine-Robust Defense & zk-Proof Inspector (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/70 rounded-xl border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Zero-Knowledge Proof Verification & Byzantine Filter</span>
            </h2>
            <button
              onClick={handleRunZkProofVerification}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Test zk-SNARK</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Byzantine Robust Aggregation explanation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Byzantine Fault-Tolerant Aggregator</span>
              <span className="text-emerald-400 text-xs font-mono">Trimmed Mean & Krum Distance</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              When adversarial participants attempt model poisoning (sign-flipping or malicious backdoor injections), the consensus aggregator computes pairwise Euclidean distances:
            </p>
            <div className="bg-slate-950/80 p-3 rounded-lg font-mono text-xs text-cyan-300 border border-slate-800">
              s_i = &Sigma; ||&Delta;W_i - &Delta;W_j||&sup2; &nbsp;&middot;&nbsp; (Outliers automatically dropped)
            </div>
          </div>

          {/* zk-SNARK Output Box */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              zk-SNARK Groth16 Invariant Verifier
            </span>
            <div className="bg-slate-950/90 p-4 rounded-lg border border-slate-800 space-y-2 font-mono text-xs">
              {zkVerifiedProof ? (
                <>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-semibold">Cryptographic Pairing Verified: e(A, B) = e(α, β) · e(C, δ)</span>
                  </div>
                  <div className="text-slate-400 text-[11px] space-y-1 pt-1 border-t border-slate-800">
                    <div>Scheme: {zkVerifiedProof.scheme}</div>
                    <div>Verification Latency: {zkVerifiedProof.verificationLatencyMs}ms (Instant on-chain)</div>
                    <div>Public Input 0: {zkVerifiedProof.publicInputs[0].slice(0, 32)}...</div>
                    <div className="text-cyan-400">Status: Weight gradients satisfy L2 clipping bound without data exposure</div>
                  </div>
                </>
              ) : (
                <div className="text-slate-500 py-3 text-center">
                  Click &ldquo;Test zk-SNARK&rdquo; to simulate on-chain Groth16 zero-knowledge constraint verification.
                </div>
              )}
            </div>
          </div>

          {/* Active Node Contributions */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Eligible FL Contributors ({nodes.filter(n => n.status === 'healthy').length}/{nodes.length} Nodes)
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {nodes.map(n => (
                <span 
                  key={n.id} 
                  className={`px-2 py-1 rounded border text-[11px] ${
                    n.status === 'healthy' 
                      ? 'bg-slate-950 border-slate-800 text-slate-300' 
                      : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                  }`}
                >
                  {n.id.replace('node-', '')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Federated Rounds History Table */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Federated Training Round Audit Log</h2>
            <p className="text-xs text-slate-400">Verifiable history of global model weights and noise multipliers</p>
          </div>
          <span className="text-xs font-mono text-cyan-400">Global Model: {latestRound?.globalVersion}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium font-sans">
                <th className="pb-3 pl-2">Round</th>
                <th className="pb-3">Model Version</th>
                <th className="pb-3">Accuracy</th>
                <th className="pb-3">F1-Score</th>
                <th className="pb-3">Noise (σ)</th>
                <th className="pb-3">Round ε</th>
                <th className="pb-3">Cumulative ε</th>
                <th className="pb-3">Byzantine Rejected</th>
                <th className="pb-3 text-right pr-2">Consensus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rounds.map(r => (
                <tr key={r.roundNumber} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 pl-2 text-cyan-300 font-semibold">#{r.roundNumber}</td>
                  <td className="py-3 text-slate-200">{r.globalVersion}</td>
                  <td className="py-3 text-emerald-400 font-bold tabular-nums">{r.globalAccuracy.toFixed(2)}%</td>
                  <td className="py-3 text-slate-300 tabular-nums">{r.f1Score.toFixed(3)}</td>
                  <td className="py-3 text-slate-400 tabular-nums">{r.noiseMultiplier.toFixed(2)}</td>
                  <td className="py-3 text-indigo-300 tabular-nums">ε={r.epsilonRound.toFixed(2)}</td>
                  <td className="py-3 text-indigo-400 font-semibold tabular-nums">ε={r.cumulativeEpsilon.toFixed(2)}</td>
                  <td className="py-3 text-slate-400">
                    {r.byzantineRejectedNodes.length > 0 ? (
                      <span className="text-rose-400">{r.byzantineRejectedNodes.join(', ')}</span>
                    ) : (
                      <span className="text-slate-600">None (All Valid)</span>
                    )}
                  </td>
                  <td className="py-3 pr-2 text-right text-emerald-400">
                    <span className="inline-flex items-center gap-1 font-sans text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{r.aggregationStatus}</span>
                    </span>
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
