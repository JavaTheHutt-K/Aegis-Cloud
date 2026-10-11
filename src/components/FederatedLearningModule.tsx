import React, { useState } from 'react';
import { NodeTrainingProfile, CloudNode, FederatedModelRound } from '../types/framework';
import { Play, ShieldCheck, Cpu, Database, AlertTriangle, Layers, CheckCircle2, RotateCw, ArrowRight } from 'lucide-react';

interface FederatedLearningModuleProps {
  nodes: CloudNode[];
  nodeProfiles: NodeTrainingProfile[];
  rounds: FederatedModelRound[];
  onExecuteCollaborativeRound: (params: { epochs: number; batchSize: number; injectByzantine: boolean }) => void;
  isTraining: boolean;
}

export const FederatedLearningModule: React.FC<FederatedLearningModuleProps> = ({
  nodes,
  nodeProfiles,
  rounds,
  onExecuteCollaborativeRound,
  isTraining
}) => {
  const [localEpochs, setLocalEpochs] = useState<number>(5);
  const [localBatchSize, setLocalBatchSize] = useState<number>(32);
  const [injectByzantine, setInjectByzantine] = useState<boolean>(false);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);

  const latestRound = rounds[0];

  const handleStartCollaborativeRound = () => {
    setActiveStageIndex(1);
    setTimeout(() => {
      setActiveStageIndex(2);
      setTimeout(() => {
        setActiveStageIndex(3);
        setTimeout(() => {
          setActiveStageIndex(4);
          setTimeout(() => {
            setActiveStageIndex(5);
            onExecuteCollaborativeRound({
              epochs: localEpochs,
              batchSize: localBatchSize,
              injectByzantine
            });
            setActiveStageIndex(0);
          }, 600);
        }, 600);
      }, 600);
    }, 600);
  };

  const stages = [
    { num: 1, title: 'Local Model Training', desc: 'Nodes run SGD on local non-IID telemetry data without sharing raw packets.' },
    { num: 2, title: 'Encrypted Gradient Upload', desc: 'Weight deltas are encrypted via Paillier HE and paired with zk-SNARK accuracy proofs.' },
    { num: 3, title: 'Byzantine Distance Check', desc: 'Consensus filters outliers with high Euclidean variance (||ΔW|| > threshold).' },
    { num: 4, title: 'Homomorphic Aggregation', desc: 'Encrypted gradients are aggregated homomorphically without decryption.' },
    { num: 5, title: 'Consortium Block Commit', desc: 'New global model parameters broadcast to all 6 cloud endpoints on-chain.' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-6 py-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>Decentralized Collaborative Intelligence</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Collaborative Federated Learning Module
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multiple ubiquitous cloud nodes collaboratively train the intrusion detection neural model by sharing encrypted model updates rather than raw network telemetry.
          </p>
        </div>

        <button
          onClick={handleStartCollaborativeRound}
          disabled={isTraining || activeStageIndex > 0}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-sm shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isTraining || activeStageIndex > 0 ? 'Executing Collaborative Round...' : 'Start Collaborative Training Round'}</span>
        </button>
      </div>

      {/* Global Model Performance Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 block mb-1">Master Model Version</span>
          <span className="text-2xl font-bold text-white font-mono">{latestRound?.globalVersion || 'v2.4.1-PPAI'}</span>
          <span className="text-xs text-cyan-400 font-mono mt-2">Round #{latestRound?.roundNumber || 18} Active</span>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 block mb-1">Global Detection Accuracy</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">{latestRound?.globalAccuracy.toFixed(2)}%</span>
          <span className="text-xs text-emerald-300 font-mono mt-2">F1 Score: {latestRound?.f1Score.toFixed(3)}</span>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 block mb-1">Participating Nodes</span>
          <span className="text-2xl font-bold text-white font-mono">{nodes.filter(n => n.status === 'healthy').length} / {nodes.length}</span>
          <span className="text-xs text-slate-400 font-mono mt-2">100% Data Kept On-Premise</span>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-400 block mb-1">Differential Privacy &sigma;</span>
          <span className="text-2xl font-bold text-indigo-400 font-mono tabular-nums">{latestRound?.noiseMultiplier.toFixed(2)}</span>
          <span className="text-xs text-indigo-300 font-mono mt-2">Cumulative &epsilon; = {latestRound?.cumulativeEpsilon.toFixed(2)}</span>
        </div>
      </div>

      {/* Interactive Collaborative Training Stepper */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">5-Phase Secure Federated Aggregation Protocol</h2>
            <p className="text-xs text-slate-400">Zero raw packet exchange across the cloud-fog-edge continuum</p>
          </div>
          {activeStageIndex > 0 && (
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Executing Phase {activeStageIndex} of 5</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {stages.map((st) => {
            const isCurrent = activeStageIndex === st.num;
            const isCompleted = activeStageIndex > st.num || (activeStageIndex === 0 && !isTraining);
            return (
              <div
                key={st.num}
                className={`p-3.5 rounded-lg border transition-all text-xs space-y-1.5 ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/80 text-cyan-200 ring-1 ring-cyan-500/30'
                    : isCompleted
                    ? 'bg-slate-950/80 border-slate-800/80 text-slate-300'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span>Phase 0{st.num}</span>
                  {isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : null}
                </div>
                <div className="font-semibold text-white text-xs">{st.title}</div>
                <p className="text-[11px] text-slate-400 leading-normal">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collaborative Training Configuration & Byzantine Fault Tolerance Toggle */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6 space-y-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
          Collaborative Training Round Parameters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Local Training Epochs:</span>
              <span className="font-mono text-cyan-400 font-bold">{localEpochs}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={localEpochs}
              onChange={(e) => setLocalEpochs(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Local Batch Size:</span>
              <span className="font-mono text-indigo-400 font-bold">{localBatchSize}</span>
            </div>
            <select
              value={localBatchSize}
              onChange={(e) => setLocalBatchSize(parseInt(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value={16}>16 flows/batch</option>
              <option value={32}>32 flows/batch</option>
              <option value={64}>64 flows/batch</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-lg border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-white block">Byzantine Injection Test</span>
              <span className="text-[11px] text-slate-400 block">Inject rogue poisoned gradient</span>
            </div>
            <input
              type="checkbox"
              checked={injectByzantine}
              onChange={(e) => setInjectByzantine(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-400 bg-slate-900 border-slate-700 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Node Collaborative Training Matrix */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Distributed Node Dataset & Gradient Matrix</h2>
            <p className="text-xs text-slate-400">Non-IID telemetry datasets across heterogeneous ubiquitous cloud tiers</p>
          </div>
          <span className="text-xs font-mono text-cyan-400">{nodeProfiles.length} Nodes Synchronized</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium font-sans">
                <th className="pb-3 pl-2">Node Name</th>
                <th className="pb-3">Data Distribution</th>
                <th className="pb-3">Dataset Size</th>
                <th className="pb-3">Local Loss</th>
                <th className="pb-3">Local Accuracy</th>
                <th className="pb-3">L2 Norm (||&Delta;W||)</th>
                <th className="pb-3">Encrypted Gradient Commitment</th>
                <th className="pb-3 text-right pr-2">Upload Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {nodeProfiles.map(profile => {
                const isSuspect = injectByzantine && profile.nodeId === 'node-iot-gateway-delta';
                return (
                  <tr key={profile.nodeId} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 pl-2 text-white font-medium font-sans">
                      {profile.nodeName}
                    </td>
                    <td className="py-3 text-slate-300 font-sans">
                      {profile.dataDistribution}
                    </td>
                    <td className="py-3 text-slate-400 tabular-nums">
                      {profile.datasetSamples.toLocaleString()} flows
                    </td>
                    <td className="py-3 text-cyan-300 tabular-nums">
                      {isSuspect ? '0.241 (Anomaly)' : profile.localLoss.toFixed(3)}
                    </td>
                    <td className="py-3 text-emerald-400 tabular-nums font-bold">
                      {isSuspect ? '84.20%' : `${profile.localAccuracy.toFixed(2)}%`}
                    </td>
                    <td className="py-3 tabular-nums">
                      <span className={isSuspect ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {isSuspect ? '18.4 (Byzantine)' : profile.gradientNormL2.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 text-indigo-300 truncate max-w-[160px]">
                      {profile.encryptedGradientHash.slice(0, 16)}...
                    </td>
                    <td className="py-3 pr-2 text-right">
                      {isSuspect ? (
                        <span className="text-rose-400 font-sans font-medium flex items-center justify-end gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Rejected (Byzantine)</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-sans font-medium flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aggregated</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
