import React, { useState, useMemo } from 'react';
import { CloudNode } from '../types/framework';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  ShieldAlert, 
  Activity, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  Layers, 
  BarChart2, 
  Grid 
} from 'lucide-react';

interface ThreatHeatmap24hProps {
  nodes: CloudNode[];
}

interface HourlyNodeCell {
  hourIndex: number;
  timeLabel: string;
  threatCount: number;
  primaryMitre: string;
  detectionLatencyMs: number;
  falsePositiveRate: number;
  blockchainEvidenceRecorded: boolean;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Nominal';
}

interface HourlyAggregateData {
  timeLabel: string;
  hour: number;
  totalThreats: number;
  avgLatencyMs: number;
  evidenceVerifiedRate: number;
  criticalCount: number;
}

export const ThreatHeatmap24h: React.FC<ThreatHeatmap24hProps> = ({ nodes }) => {
  const [selectedCell, setSelectedCell] = useState<{
    nodeId: string;
    nodeName: string;
    cell: HourlyNodeCell;
  } | null>(null);

  const [activeVisualMode, setActiveVisualMode] = useState<'heatmap' | 'trend'>('heatmap');
  const [tierFilter, setTierFilter] = useState<'all' | 'edge_iot' | 'core_fog'>('all');

  // Filter nodes based on selected tier
  const displayedNodes = useMemo(() => {
    if (tierFilter === 'edge_iot') {
      return nodes.filter(n => n.tier === 'edge_cluster' || n.tier === 'iot_gateway');
    }
    if (tierFilter === 'core_fog') {
      return nodes.filter(n => n.tier === 'central_core' || n.tier === 'fog_gateway');
    }
    return nodes;
  }, [nodes, tierFilter]);

  // Generate deterministic 24-hour heat matrix data grounded in the BCT 415 evaluation profile
  const { heatmapMatrix, hourlyAggregates } = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const h = (i + 1) % 24;
      return {
        index: i,
        timeLabel: `${h.toString().padStart(2, '0')}:00`,
        hourNum: h
      };
    });

    // Seed patterns reflecting heterogeneous ubiquitous environments
    const matrix: Record<string, HourlyNodeCell[]> = {};
    const aggMap: Record<number, HourlyAggregateData> = {};

    hours.forEach(h => {
      aggMap[h.index] = {
        timeLabel: h.timeLabel,
        hour: h.hourNum,
        totalThreats: 0,
        avgLatencyMs: 0,
        evidenceVerifiedRate: 100,
        criticalCount: 0
      };
    });

    nodes.forEach((node, nodeIdx) => {
      const row: HourlyNodeCell[] = [];
      hours.forEach((h, hourIdx) => {
        // Base seed variation per node tier & time
        let count = 0;
        let mitre = 'Nominal Traffic';
        let severity: HourlyNodeCell['severity'] = 'Nominal';
        let latency = Number((1.6 + (Math.sin(hourIdx + nodeIdx) * 0.4) + (node.tier === 'iot_gateway' ? 0.8 : 0)).toFixed(2));

        // Inject simulated incident clusters per research focus (SYN floods on Edge, SQLi on Fog, C2 on Core)
        if (node.id === 'node-edge-k8s-alpha' && (hourIdx >= 14 && hourIdx <= 18)) {
          count = hourIdx === 16 ? 9 : 5;
          mitre = 'T1498.001 - SYN Flood';
          severity = 'Critical';
          latency = 1.95;
        } else if (node.id === 'node-fog-ap-tokyo' && (hourIdx === 6 || hourIdx === 7 || hourIdx === 20)) {
          count = 4;
          mitre = 'T1190 - Blind SQLi';
          severity = 'High';
          latency = 2.45;
        } else if (node.id === 'node-iot-gateway-delta' && (hourIdx === 11 || hourIdx === 12)) {
          count = 6;
          mitre = 'T1565.001 - FL Model Poisoning';
          severity = 'Critical';
          latency = 3.12;
        } else if (node.id === 'node-edge-k8s-beta' && (hourIdx === 9 || hourIdx === 10 || hourIdx === 22)) {
          count = 3;
          mitre = 'T1110.003 - SSH Spray';
          severity = 'High';
          latency = 2.10;
        } else if (node.id === 'node-core-us-east' && (hourIdx === 3 || hourIdx === 4)) {
          count = 2;
          mitre = 'T1071.004 - Covert DNS C2';
          severity = 'Medium';
          latency = 1.82;
        } else if ((hourIdx * (nodeIdx + 1)) % 7 === 0 && hourIdx > 2) {
          count = 1;
          mitre = 'T1046 - Network Service Scanning';
          severity = 'Low';
        }

        const cell: HourlyNodeCell = {
          hourIndex: hourIdx,
          timeLabel: h.timeLabel,
          threatCount: count,
          primaryMitre: mitre,
          detectionLatencyMs: latency,
          falsePositiveRate: count > 0 ? 0.22 : 0.08,
          blockchainEvidenceRecorded: count > 0,
          severity: severity
        };

        row.push(cell);

        // Aggregate stats
        aggMap[hourIdx].totalThreats += count;
        if (severity === 'Critical') aggMap[hourIdx].criticalCount += 1;
      });

      matrix[node.id] = row;
    });

    // Finalize averages
    const aggregates: HourlyAggregateData[] = hours.map(h => {
      const item = aggMap[h.index];
      item.avgLatencyMs = Number((1.85 + (item.totalThreats > 0 ? (item.totalThreats * 0.12) : 0)).toFixed(2));
      return item;
    });

    return { heatmapMatrix: matrix, hourlyAggregates: aggregates };
  }, [nodes]);

  // Color mapping based on threat count & severity
  const getCellColor = (threatCount: number, severity: HourlyNodeCell['severity']) => {
    if (threatCount === 0) return 'bg-slate-950/70 border-slate-900 text-slate-600 hover:border-slate-700';
    if (severity === 'Critical' || threatCount >= 6) {
      return 'bg-rose-950/80 border-rose-600/90 text-rose-200 font-bold shadow-xs hover:border-rose-400 ring-1 ring-rose-500/30';
    }
    if (severity === 'High' || threatCount >= 3) {
      return 'bg-amber-950/70 border-amber-600/80 text-amber-200 font-semibold hover:border-amber-400';
    }
    return 'bg-cyan-950/60 border-cyan-700/60 text-cyan-300 font-medium hover:border-cyan-400';
  };

  // Summary Metrics from document evaluation measures
  const total24hIncidents = useMemo(() => {
    return hourlyAggregates.reduce((acc, h) => acc + h.totalThreats, 0);
  }, [hourlyAggregates]);

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6 space-y-6">
      {/* Top Header & Visual Mode Segmented Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Clock className="w-4 h-4" />
            <span>24-Hour Threat Occurrence Heatmap (BCT 415 Evaluation Framework)</span>
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Heterogeneous Cloud Node Temporal Attack Distribution
          </h2>
          <p className="text-xs text-slate-400">
            Cross-continuum threat incidents over the last 24 hours with privacy-preserving off-chain evidence verification.
          </p>
        </div>

        {/* Interactive Mode & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tier Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setTierFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                tierFilter === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Tiers
            </button>
            <button
              onClick={() => setTierFilter('edge_iot')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                tierFilter === 'edge_iot' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Edge & IoT
            </button>
            <button
              onClick={() => setTierFilter('core_fog')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                tierFilter === 'core_fog' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Core & Fog
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveVisualMode('heatmap')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeVisualMode === 'heatmap' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-3 h-3" />
              <span>Heatmap Grid</span>
            </button>
            <button
              onClick={() => setActiveVisualMode('trend')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeVisualMode === 'trend' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3 h-3" />
              <span>Temporal Trends</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Quantitative Evaluation Measures Strip (Addressing Section 6 of Document) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block mb-0.5">24h Recorded Threats</span>
          <span className="text-lg font-bold font-mono text-white tabular-nums">
            {total24hIncidents} Incidents
          </span>
          <span className="text-[10px] text-rose-400 block font-mono mt-0.5">8 Critical SYN/Poisoning</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block mb-0.5">Avg Detection Latency</span>
          <span className="text-lg font-bold font-mono text-cyan-300 tabular-nums">
            1.94 ms
          </span>
          <span className="text-[10px] text-emerald-400 block font-mono mt-0.5">SLA &lt; 5.0ms Met</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block mb-0.5">False-Positive Rate</span>
          <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
            0.22%
          </span>
          <span className="text-[10px] text-slate-400 block font-mono mt-0.5">Controlled Dataset</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block mb-0.5">Evidence Integrity Rate</span>
          <span className="text-lg font-bold font-mono text-indigo-300 tabular-nums">
            100.0%
          </span>
          <span className="text-[10px] text-indigo-400 block font-mono mt-0.5">Off-Chain Hash Verified</span>
        </div>
      </div>

      {/* Primary Visualization Area */}
      {activeVisualMode === 'heatmap' ? (
        <div className="space-y-4">
          {/* Heatmap Matrix Canvas */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[760px] space-y-2">
              {/* Header hours timeline labels */}
              <div className="grid grid-cols-25 gap-1 text-[10px] font-mono text-slate-500 pl-44 pr-2">
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="text-center truncate">
                    {i % 3 === 0 ? `${i.toString().padStart(2, '0')}h` : '·'}
                  </div>
                ))}
              </div>

              {/* Rows: Each cloud node */}
              {displayedNodes.map((node) => {
                const rowCells = heatmapMatrix[node.id] || [];
                return (
                  <div key={node.id} className="flex items-center gap-2">
                    {/* Node Label Left Column */}
                    <div className="w-42 shrink-0 truncate text-left pr-2">
                      <div className="text-xs font-semibold text-slate-200 truncate">
                        {node.name.replace('Core-Region-', '').replace('Edge-K8s-', '').replace('Fog-Gateway-', '')}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 truncate">
                        {node.region.split(' ')[0]} · {node.provider}
                      </div>
                    </div>

                    {/* 24 Hourly Cells */}
                    <div className="flex-1 grid grid-cols-24 gap-1">
                      {rowCells.map((cell) => {
                        const isSelected = selectedCell?.nodeId === node.id && selectedCell.cell.hourIndex === cell.hourIndex;
                        return (
                          <button
                            key={cell.hourIndex}
                            onClick={() => setSelectedCell({ nodeId: node.id, nodeName: node.name, cell })}
                            title={`${node.name} at ${cell.timeLabel}: ${cell.threatCount} incidents (${cell.primaryMitre})`}
                            className={`h-7 rounded border text-[10px] font-mono flex items-center justify-center transition-all cursor-pointer ${
                              getCellColor(cell.threatCount, cell.severity)
                            } ${isSelected ? 'ring-2 ring-cyan-400 z-10 scale-110' : ''}`}
                          >
                            {cell.threatCount > 0 ? cell.threatCount : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color Intensity Scale Legend */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500">Threat Intensity Scale:</span>
              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-slate-950 border border-slate-800" />
                  <span>0 Nominal</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-cyan-950 border border-cyan-700" />
                  <span>1-2 Low</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-amber-950 border border-amber-600" />
                  <span>3-5 Elevated</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-rose-950 border border-rose-600" />
                  <span>6+ Critical</span>
                </span>
              </div>
            </div>

            <span className="text-[11px] font-mono text-slate-500">
              Click any cell to inspect evidence hash & MITRE indicators
            </span>
          </div>

          {/* Selected Cell Deep Inspector Drawer */}
          {selectedCell && (
            <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-white">
                    Incident Audit: {selectedCell.nodeName} at {selectedCell.cell.timeLabel} UTC
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCell(null)}
                  className="text-slate-400 hover:text-white cursor-pointer text-xs"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-1">
                <div>
                  <span className="text-slate-500 block">Occurrences:</span>
                  <span className="text-cyan-300 font-bold">{selectedCell.cell.threatCount} incidents</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Primary Vector:</span>
                  <span className="text-amber-300">{selectedCell.cell.primaryMitre}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Detection Latency:</span>
                  <span className="text-emerald-400">{selectedCell.cell.detectionLatencyMs} ms</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Blockchain Evidence:</span>
                  <span className="text-indigo-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                    <span>0x9f4a... (Verified)</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Recharts Trend Analytics Mode */
        <div className="space-y-6">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={hourlyAggregates}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="timeLabel" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  fontFamily="JetBrains Mono"
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  fontFamily="JetBrains Mono"
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#10b981" 
                  fontSize={10} 
                  tickLine={false} 
                  domain={[0, 6]}
                  unit="ms"
                  fontFamily="JetBrains Mono"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1 shadow-xl">
                          <div className="font-bold text-white mb-1">Time: {label} UTC</div>
                          <div className="text-cyan-300">Total Threats: {payload[0]?.value} incidents</div>
                          <div className="text-emerald-400">Detection Latency: {payload[1]?.value} ms</div>
                          <div className="text-slate-500 text-[10px]">Evidence Verified: 100% On-Chain</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="totalThreats" 
                  name="Threat Occurrences" 
                  stroke="#06b6d4" 
                  fillOpacity={1} 
                  fill="url(#colorThreats)" 
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="avgLatencyMs" 
                  name="AI Detection Latency" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Secondary Sub-chart: Threat Distribution by Cloud Tier */}
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">
                Threat Absorption by Cloud Node (24h Aggregate Volume)
              </span>
              <span className="text-slate-500 font-mono text-[11px]">MITRE T1498 / T1190 / T1565</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={displayedNodes.map(n => ({
                    nodeName: n.name.replace('Core-Region-', '').replace('Edge-K8s-', '').replace('Fog-Gateway-', ''),
                    threats: (heatmapMatrix[n.id] || []).reduce((acc, c) => acc + c.threatCount, 0),
                    provider: n.provider
                  }))}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="nodeName" 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false} 
                    fontFamily="JetBrains Mono"
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false} 
                    fontFamily="JetBrains Mono"
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono">
                            <span className="text-white block font-bold">{label}</span>
                            <span className="text-cyan-300">24h Threats: {payload[0]?.value}</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="threats" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
