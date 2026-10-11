import React, { useState } from 'react';
import { CloudNode, CloudTier } from '../types/framework';
import { Server, Activity, Lock, Cpu, Globe, AlertTriangle, CheckCircle, RotateCw } from 'lucide-react';

interface TopologyViewProps {
  nodes: CloudNode[];
  onToggleQuarantine: (nodeId: string) => void;
  onResetPrivacyBudget: (nodeId: string) => void;
}

export const TopologyView: React.FC<TopologyViewProps> = ({
  nodes,
  onToggleQuarantine,
  onResetPrivacyBudget
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodes[0]?.id || 'node-core-us-east');
  const [tierFilter, setTierFilter] = useState<'all' | CloudTier>('all');

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  const filteredNodes = tierFilter === 'all' 
    ? nodes 
    : nodes.filter(n => n.tier === tierFilter);

  const getTierLabel = (tier: CloudTier) => {
    switch (tier) {
      case 'central_core': return 'Central Hyperscale Core';
      case 'fog_gateway': return 'Regional Fog Gateway';
      case 'edge_cluster': return 'Edge Kubernetes Cluster';
      case 'iot_gateway': return 'Edge IoT Micro-Gateway';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-6 py-6">
      {/* Header and Filter Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Ubiquitous Cloud Infrastructure Topology
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hybrid continuum spanning Central Cloud hyperscalers, Fog aggregation gateways, and distributed Edge compute nodes.
          </p>
        </div>

        {/* Functional segmented filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 self-start">
          <button
            onClick={() => setTierFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              tierFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Tiers ({nodes.length})
          </button>
          <button
            onClick={() => setTierFilter('central_core')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              tierFilter === 'central_core' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Central Core
          </button>
          <button
            onClick={() => setTierFilter('fog_gateway')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              tierFilter === 'fog_gateway' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fog Gateway
          </button>
          <button
            onClick={() => setTierFilter('edge_cluster')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              tierFilter === 'edge_cluster' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Edge K8s
          </button>
          <button
            onClick={() => setTierFilter('iot_gateway')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              tierFilter === 'iot_gateway' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            IoT Gateway
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Node Map (Left) & Node Deep Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Node Directory & Health Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Continuum Compute Nodes ({filteredNodes.length})</span>
            <span className="text-slate-500 font-mono">Consensus Quorum: 3/3 Validators Active</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredNodes.map(node => {
              const isSelected = node.id === selectedNode.id;
              const isQuarantined = node.status === 'quarantined';
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected 
                      ? 'bg-slate-900 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30' 
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="space-y-0.5">
                      <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
                        <Server className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="truncate">{node.name}</span>
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">{node.region}</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {node.provider}
                    </span>
                  </div>

                  <div className="space-y-2 mt-3 pt-3 border-t border-slate-800/60 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Tier</span>
                      <span className="font-mono text-slate-300">{getTierLabel(node.tier).split(' ')[0]} Tier</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>Throughput</span>
                      <span className="font-mono text-slate-200 tabular-nums">
                        {node.processedPacketsPerSec.toLocaleString()} pkts/s
                      </span>
                    </div>

                    {/* Privacy Budget Progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Privacy Budget (ε)</span>
                        <span className="font-mono text-indigo-300 tabular-nums">
                          {node.privacyBudgetConsumed.toFixed(1)} / {node.privacyBudgetLimit.toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${(node.privacyBudgetConsumed / node.privacyBudgetLimit) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Status & Validator tag */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        {isQuarantined ? (
                          <span className="text-rose-400 font-medium flex items-center gap-1 text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Quarantined</span>
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Healthy</span>
                          </span>
                        )}
                        {node.isValidator && (
                          <span className="text-slate-400 text-[11px] font-mono">
                            · Validator
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        Anomaly: {(node.localAnomalyScore * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Node Telemetry & Privacy Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 rounded-xl border border-slate-800 p-6 space-y-6">
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-mono text-cyan-400 mb-1">
                Node ID: {selectedNode.id}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {selectedNode.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {getTierLabel(selectedNode.tier)} · {selectedNode.region}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-400 block">IP Address</span>
              <span className="text-xs font-mono text-cyan-300 font-semibold select-all">
                {selectedNode.ipAddress}
              </span>
            </div>
          </div>

          {/* Vitals Telemetry */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>CPU Load</span>
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white tabular-nums">
                {selectedNode.cpuUsage}%
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
                <div 
                  className="bg-cyan-400 h-1 rounded-full transition-all"
                  style={{ width: `${selectedNode.cpuUsage}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Memory Allocation</span>
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-xl font-bold font-mono text-white tabular-nums">
                {selectedNode.memoryUsage}%
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
                <div 
                  className="bg-indigo-400 h-1 rounded-full transition-all"
                  style={{ width: `${selectedNode.memoryUsage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Privacy Loss & Differential Privacy Status */}
          <div className="space-y-3 bg-slate-950/70 p-4 rounded-lg border border-slate-800/80">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Local Privacy Budget Meter</span>
              </h3>
              <span className="text-xs font-mono text-indigo-300 tabular-nums">
                {((selectedNode.privacyBudgetConsumed / selectedNode.privacyBudgetLimit) * 100).toFixed(0)}% Consumed
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>Consumed: ε={selectedNode.privacyBudgetConsumed.toFixed(2)}</span>
                <span>Limit: ε={selectedNode.privacyBudgetLimit.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${(selectedNode.privacyBudgetConsumed / selectedNode.privacyBudgetLimit) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal pt-1">
              Differential Privacy guarantees no individual tenant session or network packet can be reconstructed by observing weight gradient updates.
            </p>
          </div>

          {/* Local Intrusion Detector Score */}
          <div className="space-y-2 bg-slate-950/70 p-4 rounded-lg border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Local Autoencoder Reconstruction Loss</span>
              <span className="text-xs font-mono text-cyan-300 font-semibold tabular-nums">
                Anomaly Score: {selectedNode.localAnomalyScore.toFixed(3)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Threshold: θ = 0.450. Any reconstructed flow exceeding this limit triggers zero-knowledge proof generation and blockchain consensus submission.
            </p>
          </div>

          {/* Node Operations Handlers */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleQuarantine(selectedNode.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedNode.status === 'quarantined'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  {selectedNode.status === 'quarantined' ? 'Restore & Re-integrate Node' : 'Quarantine Node'}
                </span>
              </button>

              <button
                onClick={() => onResetPrivacyBudget(selectedNode.id)}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Reset Privacy Budget Allocation"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Reset ε Budget</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
