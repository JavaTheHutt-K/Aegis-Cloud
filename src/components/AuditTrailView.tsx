import React, { useState } from 'react';
import { AuditTrailRecord, AuditCategory } from '../types/framework';
import { verifyAuditTrailChain } from '../utils/crypto';
import { ShieldCheck, AlertTriangle, Search, Download, CheckCircle2, RotateCcw, Lock, FileText, Cpu, Key } from 'lucide-react';

interface AuditTrailViewProps {
  records: AuditTrailRecord[];
  onSimulateTamper: (recordId: string) => void;
  onRestoreTamper: () => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  records,
  onSimulateTamper,
  onRestoreTamper
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | AuditCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<ReturnType<typeof verifyAuditTrailChain> | null>(null);

  const filteredRecords = records.filter(r => {
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    if (!matchesCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.id.toLowerCase().includes(q) ||
           r.action.toLowerCase().includes(q) ||
           r.actor.toLowerCase().includes(q) ||
           r.summary.toLowerCase().includes(q) ||
           r.txHash.toLowerCase().includes(q);
  });

  const handleVerifyChain = () => {
    const res = verifyAuditTrailChain(records);
    setVerificationResult(res);
  };

  const handleExportAuditCertificate = () => {
    const exportData = {
      complianceStandard: 'NIST SP 800-53 / GDPR Art. 30 & 32',
      framework: 'AegisCloud Immutable Blockchain Audit Trail',
      exportedAt: new Date().toISOString(),
      totalRecords: records.length,
      cryptographicIntegrity: verifyAuditTrailChain(records).isValid ? 'VERIFIED_VALID' : 'TAMPER_DETECTED',
      records: records
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aegiscloud_audit_trail_certificate_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getCategoryIcon = (category: AuditCategory) => {
    switch (category) {
      case 'detected_intrusion': return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      case 'model_training': return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
      case 'access_control': return <Key className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const getCategoryLabel = (category: AuditCategory) => {
    switch (category) {
      case 'detected_intrusion': return 'Intrusion Detection';
      case 'model_training': return 'Model Training Process';
      case 'access_control': return 'Privileged Access & Policy';
    }
  };

  const hasTamperedRecord = records.some(r => r.isTampered);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-6 py-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Immutable Distributed Ledger Audit</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Blockchain-Based Audit Trail System
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-proof, cryptographically linked record of all detected intrusions, federated model training cycles, and privileged access events.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleVerifyChain}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 fill-current" />
            <span>Verify Hash Chain Integrity</span>
          </button>

          {hasTamperedRecord ? (
            <button
              onClick={onRestoreTamper}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/60 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Ledger Integrity</span>
            </button>
          ) : (
            <button
              onClick={() => onSimulateTamper(records[1]?.id || records[0]?.id)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 rounded-lg transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Tampering Attempt</span>
            </button>
          )}

          <button
            onClick={handleExportAuditCertificate}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Certificate</span>
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-xs ${
          verificationResult.isValid
            ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300'
            : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm">
              {verificationResult.isValid ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Hash Chain Integrity Verified: All {records.length} Audit Blocks Untampered</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Cryptographic Discrepancy Detected at Record #{verificationResult.brokenIndex! + 1}!</span>
                </>
              )}
            </div>
            <p className="font-mono text-[11px] leading-relaxed">
              {verificationResult.isValid
                ? 'SHA-256 recursive link H_i = SHA256(H_{i-1} || payload_i) and ECDSA validator signatures validated with zero discrepancy.'
                : `Tampering Alert: Hash mismatch detected. Record was altered without valid validator re-signature. The immutable blockchain immediately isolates this node.`
              }
            </p>
          </div>
          <span className="font-mono text-[11px] uppercase shrink-0 pt-0.5">
            {verificationResult.isValid ? 'Status: Valid' : 'Status: Compromised'}
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Segmented Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 self-start">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              categoryFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Audit Records ({records.length})
          </button>
          <button
            onClick={() => setCategoryFilter('detected_intrusion')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              categoryFilter === 'detected_intrusion' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Detected Intrusions
          </button>
          <button
            onClick={() => setCategoryFilter('model_training')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              categoryFilter === 'model_training' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Model Training Cycles
          </button>
          <button
            onClick={() => setCategoryFilter('access_control')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              categoryFilter === 'access_control' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Access & Policies
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>
      </div>

      {/* Audit Log Entries List */}
      <div className="space-y-3">
        {filteredRecords.map((record) => {
          return (
            <div
              key={record.id}
              className={`p-4 rounded-xl border transition-all text-xs ${
                record.isTampered
                  ? 'bg-rose-950/20 border-rose-600/80 shadow-md ring-1 ring-rose-500/40'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900/90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    {getCategoryIcon(record.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{record.id}</span>
                      <span className="text-slate-500 font-mono">·</span>
                      <span className="font-mono text-cyan-400 font-medium">{record.action}</span>
                      {record.isTampered && (
                        <span className="text-rose-400 font-bold ml-2">
                          [TAMPER DETECTED: Hash Discrepancy]
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {getCategoryLabel(record.category)} · Actor: {record.actor}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-slate-500 shrink-0">
                  <span>Block #{record.blockHeight}</span>
                  <span className="mx-1">·</span>
                  <span>{new Date(record.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Summary */}
              <p className="text-slate-300 font-sans mt-2 mb-3 bg-slate-950/50 p-2.5 rounded border border-slate-800/60 leading-relaxed">
                {record.summary}
              </p>

              {/* Cryptographic Link Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-slate-800/60 text-slate-400">
                <div className="truncate">
                  Record Hash: <span className="text-indigo-300 select-all">{record.recordHash}</span>
                </div>
                <div className="truncate">
                  Prev Link Hash: <span className="text-slate-500 select-all">{record.previousRecordHash}</span>
                </div>
                <div className="truncate">
                  Origin TX: <span className="text-cyan-300 select-all">{record.txHash}</span>
                </div>
                <div className="truncate">
                  Signature: <span className="text-emerald-400 select-all">{record.validatorSignature.slice(0, 32)}...</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
