import React, { useState } from 'react';
import { HomomorphicScheme, HomomorphicInferenceResult } from '../types/framework';
import { runHomomorphicInference } from '../utils/crypto';
import { Lock, Cpu, Play, CheckCircle2, ShieldCheck, Key, Zap, Layers } from 'lucide-react';

export const HomomorphicEncryptionView: React.FC = () => {
  const [selectedScheme, setSelectedScheme] = useState<HomomorphicScheme>('Paillier_Additive');
  
  // Interactive flow telemetry input features
  const [packetRate, setPacketRate] = useState<number>(65000);
  const [flowEntropy, setFlowEntropy] = useState<number>(7.20);
  const [synRatio, setSynRatio] = useState<number>(0.92);
  const [flowDuration, setFlowDuration] = useState<number>(45);

  const [inferenceResult, setInferenceResult] = useState<HomomorphicInferenceResult>(() => 
    runHomomorphicInference(65000, 7.20, 0.92, 45, 'Paillier_Additive')
  );

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [aggregationStep, setAggregationStep] = useState<string | null>(null);

  const handleRunInference = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      const res = runHomomorphicInference(packetRate, flowEntropy, synRatio, flowDuration, selectedScheme);
      setInferenceResult(res);
      setIsEvaluating(false);
    }, 450);
  };

  const handleSimulateHomomorphicAggregation = () => {
    setAggregationStep('Encrypting node weight deltas with Paillier 2048-bit key...');
    setTimeout(() => {
      setAggregationStep('Executing modular exponentiation multiplication: E(W_global) = ∏ E(ΔW_i)^α_i mod n²...');
      setTimeout(() => {
        setAggregationStep('Homomorphic aggregation complete! Master model updated with zero weight leakage to parameter server.');
      }, 700);
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-6 py-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
            <Lock className="w-4 h-4" />
            <span>Ciphertext Domain AI Inference</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Homomorphic Encryption (HE) Intrusion Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enables neural intrusion models to compute anomaly predictions directly over encrypted telemetry without plaintext exposure.
          </p>
        </div>

        {/* Scheme Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 self-start">
          <button
            onClick={() => setSelectedScheme('Paillier_Additive')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              selectedScheme === 'Paillier_Additive' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Paillier (Additive HE)
          </button>
          <button
            onClick={() => setSelectedScheme('CKKS_Approximate')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              selectedScheme === 'CKKS_Approximate' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CKKS (Approximate HE)
          </button>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Telemetry Feature Input & Key Parameters (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/70 rounded-xl border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>Input Telemetry & Key Setup</span>
            </h2>
            <span className="text-xs font-mono text-cyan-300">2048-bit Modulus</span>
          </div>

          {/* Feature 1: Packet Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label htmlFor="he-pkt-rate" className="text-slate-300">Packet Rate (pkts/s)</label>
              <span className="font-mono text-cyan-400 font-bold tabular-nums">{packetRate.toLocaleString()}</span>
            </div>
            <input
              id="he-pkt-rate"
              type="range"
              min="500"
              max="100000"
              step="500"
              value={packetRate}
              onChange={(e) => setPacketRate(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Feature 2: Flow Entropy */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label htmlFor="he-entropy" className="text-slate-300">Shannon Flow Entropy (bits)</label>
              <span className="font-mono text-indigo-400 font-bold tabular-nums">{flowEntropy.toFixed(2)}</span>
            </div>
            <input
              id="he-entropy"
              type="range"
              min="1.0"
              max="8.0"
              step="0.1"
              value={flowEntropy}
              onChange={(e) => setFlowEntropy(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          {/* Feature 3: SYN/ACK Ratio */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label htmlFor="he-syn" className="text-slate-300">SYN/ACK Ratio</label>
              <span className="font-mono text-cyan-400 font-bold tabular-nums">{synRatio.toFixed(2)}</span>
            </div>
            <input
              id="he-syn"
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={synRatio}
              onChange={(e) => setSynRatio(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Feature 4: Flow Duration */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label htmlFor="he-duration" className="text-slate-300">Flow Duration (ms)</label>
              <span className="font-mono text-indigo-400 font-bold tabular-nums">{flowDuration} ms</span>
            </div>
            <input
              id="he-duration"
              type="range"
              min="10"
              max="2000"
              step="10"
              value={flowDuration}
              onChange={(e) => setFlowDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          {/* Cryptographic Parameters Info */}
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 font-mono text-xs space-y-1.5 text-slate-400">
            <div>Scheme: <span className="text-slate-200">{selectedScheme}</span></div>
            <div>Public Key (n, g): <span className="text-cyan-300 truncate block">0xa98f4102938471029384...</span></div>
            <div>Security Parameter: <span className="text-emerald-400">λ = 128-bit quantum-resilient</span></div>
          </div>

          <button
            onClick={handleRunInference}
            disabled={isEvaluating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isEvaluating ? 'Evaluating on Ciphertext...' : 'Run Homomorphic AI Inference'}</span>
          </button>
        </div>

        {/* Right Column: Encrypted Computation Pipeline & Proof of Correctness (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/70 rounded-xl border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Ciphertext Domain Neural Evaluation</span>
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero Plaintext Exposure</span>
            </div>
          </div>

          {/* Ciphertext Features Table */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Encrypted Feature Ciphertexts (E(x_i) &isin; &Zopf;<sub>n&sup2;</sub>)
            </span>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-sans">
                    <th className="pb-2">Feature Name</th>
                    <th className="pb-2">Plaintext Value</th>
                    <th className="pb-2">Ciphertext Snippet (2048-bit)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {inferenceResult.features.map(f => (
                    <tr key={f.name}>
                      <td className="py-2 text-slate-300 font-sans">{f.name}</td>
                      <td className="py-2 text-cyan-300 tabular-nums">{f.plaintextValue} {f.unit}</td>
                      <td className="py-2 text-indigo-300 truncate max-w-[200px]">{f.ciphertextSnippet}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Homomorphic Transformation Equation */}
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Homomorphic Linear Forward Pass:</span>
            </div>
            <div className="font-mono text-xs text-cyan-300 bg-slate-900/60 p-2.5 rounded border border-slate-800/80 overflow-x-auto">
              E(y) = [E(x_1)]<sup>w_1</sup> &middot; [E(x_2)]<sup>w_2</sup> &middot; [E(x_3)]<sup>w_3</sup> &middot; [E(x_4)]<sup>w_4</sup> &middot; E(b) mod n&sup2;
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              The neural model evaluates inference weights using modular exponentiations and products over encrypted ciphertext without knowing the actual traffic values.
            </p>
          </div>

          {/* Result & Decryption Comparison Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Plaintext Baseline</span>
              <span className="text-base font-mono font-bold text-slate-200 tabular-nums">
                {inferenceResult.plaintextBaselineScore.toFixed(4)}
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">Unencrypted score</span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Decrypted HE Score</span>
              <span className="text-base font-mono font-bold text-cyan-400 tabular-nums">
                {inferenceResult.decryptedAnomalyScore.toFixed(4)}
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">Dec(E(y))</span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Numerical Error (&Delta;)</span>
              <span className="text-base font-mono font-bold text-emerald-400 tabular-nums">
                {inferenceResult.accuracyDelta.toFixed(6)}
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">Precision gap</span>
            </div>
          </div>

          {/* Classification Banner */}
          <div className={`p-3.5 rounded-lg border text-xs flex items-center justify-between ${
            inferenceResult.isAnomaly
              ? 'bg-rose-950/30 border-rose-800/60 text-rose-300'
              : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
          }`}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-semibold">
                Ciphertext Prediction: {inferenceResult.isAnomaly ? 'Intrusion Attack Confirmed' : 'Benign Traffic Nominal'}
              </span>
            </div>
            <span className="font-mono text-[11px]">Threshold &theta; = 0.450</span>
          </div>

          {/* Performance & Overhead Metrics */}
          <div className="space-y-2 pt-1 border-t border-slate-800 text-xs">
            <div className="flex justify-between text-slate-400 font-mono text-[11px]">
              <span>Encryption: {inferenceResult.timings.encryptionTimeMs}ms</span>
              <span>HE Evaluation: {inferenceResult.timings.homomorphicEvaluationTimeMs}ms</span>
              <span>Decryption: {inferenceResult.timings.decryptionTimeMs}ms</span>
              <span>Total: {inferenceResult.timings.totalMs}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Homomorphic Model Weight Aggregation Section */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Homomorphic Federated Gradient Aggregation</span>
            </h2>
            <p className="text-xs text-slate-400">
              Multiple cloud nodes encrypt their local neural weight updates so the central server aggregates them without observing individual node gradients.
            </p>
          </div>
          <button
            onClick={handleSimulateHomomorphicAggregation}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulate Encrypted Aggregation</span>
          </button>
        </div>

        {aggregationStep && (
          <div className="p-3 bg-slate-950/90 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300">
            {aggregationStep}
          </div>
        )}
      </div>
    </div>
  );
};
