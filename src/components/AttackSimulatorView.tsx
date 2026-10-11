import React, { useState } from 'react';
import { AttackScenario, AttackType, TelemetryPacket } from '../types/framework';
import { Play, ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight, Activity, Terminal, RotateCw, CheckCircle2 } from 'lucide-react';

interface AttackSimulatorViewProps {
  scenarios: AttackScenario[];
  activeSimulationScenario: AttackScenario | null;
  onExecuteSimulation: (scenario: AttackScenario) => void;
  isSimulating: boolean;
  simulationStep: number; // 0 to 5
  simulationPackets: TelemetryPacket[];
  latestMitigationMessage: string | null;
}

export const AttackSimulatorView: React.FC<AttackSimulatorViewProps> = ({
  scenarios,
  activeSimulationScenario,
  onExecuteSimulation,
  isSimulating,
  simulationStep,
  simulationPackets,
  latestMitigationMessage
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<AttackType>(scenarios[0].id);

  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];

  const getSeverityBadgeColor = (severity: AttackScenario['severity']) => {
    switch (severity) {
      case 'Critical': return 'text-rose-400 font-semibold';
      case 'High': return 'text-amber-400 font-semibold';
      case 'Medium': return 'text-cyan-400 font-semibold';
      case 'Low': return 'text-slate-400 font-medium';
      case 'Benign': return 'text-emerald-400 font-medium';
    }
  };

  const steps = [
    { num: 1, label: 'Traffic Ingestion & Flow Extraction' },
    { num: 2, label: 'Local PPAI Anomaly Detection' },
    { num: 3, label: 'DP Noise & zk-SNARK Proof' },
    { num: 4, label: 'Consortium Block Mining' },
    { num: 5, label: 'Ubiquitous Cloud Defense Push' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-6 py-6">
      {/* Title & Introduction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Interactive Intrusion Detection & Attack Simulation Lab
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate privacy-preserving detection against MITRE ATT&CK techniques across multi-tier cloud and edge environments.
          </p>
        </div>

        <button
          onClick={() => onExecuteSimulation(selectedScenario)}
          disabled={isSimulating}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-sm shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isSimulating ? 'Executing Pipeline...' : `Execute Attack: ${selectedScenario.name}`}</span>
        </button>
      </div>

      {/* Scenario Selector & Scenario Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Attack Vector Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <span>Attack Scenarios ({scenarios.length})</span>
            <span className="text-slate-500 font-mono">MITRE ATT&CK</span>
          </div>

          <div className="space-y-2.5">
            {scenarios.map(scenario => {
              const isSelected = scenario.id === selectedScenario.id;
              return (
                <div
                  key={scenario.id}
                  onClick={() => setSelectedScenarioId(scenario.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-white truncate mr-2">
                      {scenario.name}
                    </span>
                    <span className={`text-[11px] font-mono shrink-0 ${getSeverityBadgeColor(scenario.severity)}`}>
                      {scenario.severity}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono truncate">
                    {scenario.mitreTechnique}
                  </div>

                  <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/60 font-mono">
                    <span>Target: {scenario.targetTier.replace('_', ' ')}</span>
                    <span>Entropy: {scenario.flowEntropy.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Scenario Mechanics & Feature Attribution (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/70 rounded-xl border border-slate-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-mono text-cyan-400 mb-1">
                Category: {selectedScenario.category}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {selectedScenario.name}
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {selectedScenario.mitreTechnique}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className={`text-xs font-mono uppercase tracking-wider block ${getSeverityBadgeColor(selectedScenario.severity)}`}>
                Severity: {selectedScenario.severity}
              </span>
              <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                Target Node: {selectedScenario.targetNodeId}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
            {selectedScenario.description}
          </p>

          {/* Technical Telemetry Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block mb-1">Attack Packet Rate</span>
              <span className="text-cyan-300 font-bold tabular-nums">
                {selectedScenario.packetRate.toLocaleString()} pkts/s
              </span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block mb-1">Shannon Flow Entropy</span>
              <span className="text-indigo-300 font-bold tabular-nums">
                {selectedScenario.flowEntropy.toFixed(2)} bits
              </span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-500 block mb-1">Payload Hash Fingerprint</span>
              <span className="text-slate-300 truncate block font-mono">
                {selectedScenario.payloadSignature}
              </span>
            </div>
          </div>

          {/* Neural Feature Importance & Detection Indicators */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>Local AI Model Anomaly Indicators (SHAP Feature Importance)</span>
              <span className="text-slate-500 font-mono text-[11px]">Normalized [0-1]</span>
            </h3>

            <div className="space-y-2">
              {selectedScenario.detectedFeatures.map(feat => (
                <div key={feat.featureName} className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{feat.featureName}</span>
                    <span className="font-mono text-cyan-300 text-[11px]">{feat.value}</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-1.5 rounded-full"
                      style={{ width: `${feat.importance * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time 5-Step Pipeline Execution Tracker */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Live Pipeline Execution Stepper</h2>
            <p className="text-xs text-slate-400">Step-by-step trace of how intrusion packets trigger zero-knowledge consensus defense</p>
          </div>
          {isSimulating && (
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Step {simulationStep} of 5 Active</span>
            </div>
          )}
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {steps.map(s => {
            const isCompleted = simulationStep > s.num;
            const isCurrent = simulationStep === s.num;
            return (
              <div
                key={s.num}
                className={`p-3.5 rounded-lg border transition-all text-xs ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/80 text-cyan-200 ring-1 ring-cyan-500/30'
                    : isCompleted
                    ? 'bg-slate-950/80 border-emerald-800/80 text-slate-300'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 font-mono text-[11px]">
                  <span>Step 0{s.num}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  ) : null}
                </div>
                <div className="font-medium text-xs text-slate-200 leading-snug">
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Mitigation Outcome banner */}
        {latestMitigationMessage && (
          <div className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-lg text-xs text-emerald-300 space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Autonomous Defense Enforced: Consensus Transaction Confirmed</span>
            </div>
            <p className="font-mono text-[11px] text-emerald-200/90 pl-6">
              {latestMitigationMessage}
            </p>
          </div>
        )}
      </div>

      {/* Live Ingress Telemetry Stream Table */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Ingress Flow Telemetry Stream</h2>
            <p className="text-xs text-slate-400">Sample of real-time flow features analyzed without plaintext content exposure</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{simulationPackets.length} Flows Inspected</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium font-sans">
                <th className="pb-3 pl-2">Flow ID</th>
                <th className="pb-3">Source &rarr; Dst</th>
                <th className="pb-3">Proto</th>
                <th className="pb-3">Duration</th>
                <th className="pb-3">SYN Ratio</th>
                <th className="pb-3">Anomaly Score</th>
                <th className="pb-3">Privacy Guard</th>
                <th className="pb-3 text-right pr-2">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {simulationPackets.slice(0, 8).map(pkt => (
                <tr key={pkt.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-2.5 pl-2 text-cyan-300">{pkt.id}</td>
                  <td className="py-2.5 text-slate-300">{pkt.sourceIp} &rarr; {pkt.destinationIp}</td>
                  <td className="py-2.5 text-slate-400">{pkt.protocol}</td>
                  <td className="py-2.5 text-slate-300 tabular-nums">{pkt.flowDurationMs}ms</td>
                  <td className="py-2.5 text-slate-300 tabular-nums">{pkt.synFlagRatio.toFixed(2)}</td>
                  <td className="py-2.5 tabular-nums">
                    <span className={pkt.anomalyScore > 0.45 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {pkt.anomalyScore.toFixed(3)}
                    </span>
                  </td>
                  <td className="py-2.5 text-indigo-300">
                    <span>DP-Noised</span>
                  </td>
                  <td className="py-2.5 pr-2 text-right">
                    {pkt.isAnomaly ? (
                      <span className="text-rose-400 font-medium font-sans">Intrusion Detected</span>
                    ) : (
                      <span className="text-emerald-400 font-medium font-sans">Benign</span>
                    )}
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
