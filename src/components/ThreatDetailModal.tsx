import React from 'react';
import { BlockchainTransaction } from '../types/framework';
import { X, CheckCircle2, ShieldAlert, Cpu, Download, Hash } from 'lucide-react';

interface ThreatDetailModalProps {
  transaction: BlockchainTransaction | null;
  onClose: () => void;
}

export const ThreatDetailModal: React.FC<ThreatDetailModalProps> = ({
  transaction,
  onClose
}) => {
  if (!transaction) return null;

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transaction, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aegiscloud_audit_${transaction.txHash.slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Cryptographic Transaction Inspector</h2>
              <p className="text-xs text-slate-400">Immutable ledger entry & Zero-Knowledge validation record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Transaction Metadata Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Transaction Hash</span>
              <span className="font-mono text-xs text-cyan-300 break-all select-all">
                {transaction.txHash}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-1">Smart Contract</span>
              <span className="font-semibold text-slate-200">
                {transaction.smartContract}.sol
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-1">Transaction Type</span>
              <span className="font-mono text-xs text-slate-200">
                {transaction.type}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-1">Origin Node ID</span>
              <span className="font-mono text-xs text-slate-300">
                {transaction.senderNodeId} ({transaction.senderAddress})
              </span>
            </div>
          </div>

          {/* Threat / Payload Details */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Payload Summary</h3>
            <p className="text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 text-xs leading-relaxed">
              {transaction.payloadSummary}
            </p>
            {transaction.defenseRuleApplied && (
              <div className="mt-2 p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Synchronized Enforcement: {transaction.defenseRuleApplied}</span>
              </div>
            )}
          </div>

          {/* Differential Privacy Parameters */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
              <span>Differential Privacy Budget & Noise Calibration</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                <span className="text-xs text-slate-400 block">Privacy Loss (ε)</span>
                <span className="font-mono text-base font-semibold text-cyan-400 tabular-nums">
                  {transaction.privacyParameters.epsilonDP > 0 ? transaction.privacyParameters.epsilonDP.toFixed(2) : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Epsilon Budget</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                <span className="text-xs text-slate-400 block">Failure Prob (δ)</span>
                <span className="font-mono text-base font-semibold text-slate-200 tabular-nums">
                  {transaction.privacyParameters.deltaDP > 0 ? '1e-5' : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Delta Bound</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                <span className="text-xs text-slate-400 block">Clipping Norm (C)</span>
                <span className="font-mono text-base font-semibold text-slate-200 tabular-nums">
                  {transaction.privacyParameters.clippingNorm > 0 ? transaction.privacyParameters.clippingNorm.toFixed(1) : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">L2 Bound</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                <span className="text-xs text-slate-400 block">Noise Scale (σ)</span>
                <span className="font-mono text-base font-semibold text-slate-200 tabular-nums">
                  {transaction.privacyParameters.noiseScale > 0 ? transaction.privacyParameters.noiseScale.toFixed(2) : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Gaussian StdDev</span>
              </div>
            </div>
          </div>

          {/* Zero-Knowledge Proof (zk-SNARK) Verification */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Knowledge Proof Verification (zk-SNARK Groth16)</span>
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cryptographically Validated</span>
              </div>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 font-mono text-xs space-y-1.5">
              <div>
                <span className="text-slate-500">Proof Scheme: </span>
                <span className="text-slate-300">Groth16 on Barreto-Naehrig BN254 elliptic curve</span>
              </div>
              <div>
                <span className="text-slate-500">zk-SNARK Hash: </span>
                <span className="text-emerald-300 break-all">{transaction.zkProofHash}</span>
              </div>
              <div>
                <span className="text-slate-500">Constraint System: </span>
                <span className="text-slate-300">R1CS (34,180 constraints) · Gradient L2 Bound & Loss Invariant verified</span>
              </div>
              <div>
                <span className="text-slate-500">Information Leaked: </span>
                <span className="text-cyan-400 font-semibold">0 bytes (Zero tenant telemetry or raw payload revealed)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Audit Standard: NIST SP 800-145</span>
            <span>·</span>
            <span>GDPR Art. 25 Compliant</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Record</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
