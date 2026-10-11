export type CloudTier = 'central_core' | 'fog_gateway' | 'edge_cluster' | 'iot_gateway';

export type NodeStatus = 'healthy' | 'investigating' | 'quarantined' | 'syncing';

export interface CloudNode {
  id: string;
  name: string;
  tier: CloudTier;
  region: string;
  provider: 'AWS' | 'GCP' | 'Azure' | 'Bare-Metal' | 'Edge-K8s';
  ipAddress: string;
  status: NodeStatus;
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  processedPacketsPerSec: number;
  privacyBudgetConsumed: number; // epsilon used
  privacyBudgetLimit: number; // total epsilon
  localAnomalyScore: number; // 0 to 1
  isValidator: boolean;
  activeThreatCount: number;
}

export type AttackType = 
  | 'ddos_syn_flood'
  | 'sql_injection_exfiltration'
  | 'ssh_bruteforce_lateral'
  | 'byzantine_model_poisoning'
  | 'covert_c2_dns'
  | 'benign_baseline';

export interface AttackScenario {
  id: AttackType;
  name: string;
  category: 'Network Flooding' | 'Web Application' | 'Credential Access' | 'Adversarial ML' | 'Command & Control' | 'Normal Traffic';
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Benign';
  mitreTechnique: string;
  description: string;
  packetRate: number; // packets/sec
  flowEntropy: number; // shannon entropy 0-8
  targetTier: CloudTier;
  targetNodeId: string;
  payloadSignature: string;
  detectedFeatures: {
    featureName: string;
    value: string;
    importance: number; // 0-1
  }[];
}

export interface TelemetryPacket {
  id: string;
  timestamp: number;
  sourceIp: string;
  destinationIp: string;
  protocol: 'TCP' | 'UDP' | 'HTTP' | 'DNS' | 'ICMP';
  length: number;
  flowDurationMs: number;
  synFlagRatio: number;
  anomalyScore: number;
  isAnomaly: boolean;
  privacyProtected: boolean;
  nodeId: string;
}

export type TransactionType = 'TX_INTRUSION_ALERT' | 'TX_MODEL_UPDATE' | 'TX_DEFENSE_RULE' | 'TX_NODE_QUARANTINE' | 'TX_AUDIT_LOG';

export interface BlockchainTransaction {
  txHash: string;
  timestamp: number;
  type: TransactionType;
  senderNodeId: string;
  senderAddress: string;
  payloadSummary: string;
  threatType?: AttackType;
  mitreTactic?: string;
  zkProofHash: string;
  zkProofVerified: boolean;
  privacyParameters: {
    epsilonDP: number;
    deltaDP: number;
    clippingNorm: number;
    noiseScale: number;
  };
  smartContract: 'IntrusionRegistry' | 'FederatedConsensus' | 'DefenseOrchestrator' | 'AuditRegistry';
  defenseRuleApplied?: string;
}

export interface LedgerBlock {
  blockHeight: number;
  blockHash: string;
  previousHash: string;
  timestamp: number;
  validatorNodeId: string;
  merkleRoot: string;
  transactionsCount: number;
  transactions: BlockchainTransaction[];
  gasUsed: number;
  zkSnarkProofRoot: string;
}

export interface FederatedModelRound {
  roundNumber: number;
  globalVersion: string;
  timestamp: number;
  participatingNodes: string[];
  globalAccuracy: number; // 0 - 100%
  falsePositiveRate: number; // percentage
  f1Score: number;
  noiseMultiplier: number;
  epsilonRound: number;
  cumulativeEpsilon: number;
  byzantineRejectedNodes: string[];
  aggregationStatus: 'Aggregated' | 'Validating Proofs' | 'Active';
}

export interface MitigationRule {
  id: string;
  blockHeight: number;
  timestamp: number;
  ruleType: 'IP_BLOCK_EBPF' | 'RATE_LIMIT_FOG' | 'TOKEN_REVOCATION' | 'MODEL_FILTER';
  targetPattern: string;
  severity: 'Critical' | 'High' | 'Medium';
  enforcedNodesCount: number;
  status: 'Active' | 'Superseded' | 'Testing';
  originTxHash: string;
}

export interface SmartContractMethod {
  name: string;
  contract: 'IntrusionRegistry' | 'FederatedConsensus' | 'DefenseOrchestrator' | 'AuditRegistry';
  description: string;
  inputs: { name: string; type: string; placeholder: string }[];
  payable: boolean;
}

export interface HuggingFaceModel {
  id: string;
  modelId: string;
  author: string;
  pipelineTag: string;
  downloads: number;
  architecture: string;
  benchmarkAccuracy: number;
  quantizedSizeMb: number;
  importedAt: number;
  importedByUid: string;
}

/* ====================================================================
   HOMOMORPHIC ENCRYPTION (HE) SUBSYSTEM
   ==================================================================== */

export type HomomorphicScheme = 'Paillier_Additive' | 'CKKS_Approximate';

export interface HomomorphicKeyPair {
  scheme: HomomorphicScheme;
  keySizeBits: number;
  publicKeyFingerprint: string;
  privateKeyAuthorizedRole: string;
}

export interface HomomorphicInferenceResult {
  features: {
    name: string;
    plaintextValue: number;
    ciphertextSnippet: string;
    unit: string;
  }[];
  encryptedPredictionCiphertext: string;
  decryptedAnomalyScore: number;
  plaintextBaselineScore: number;
  accuracyDelta: number; // numerical approximation error
  isAnomaly: boolean;
  timings: {
    encryptionTimeMs: number;
    homomorphicEvaluationTimeMs: number;
    decryptionTimeMs: number;
    totalMs: number;
  };
  computationalMetrics: {
    ciphertextExpansionFactor: number; // e.g. 16x
    multiplicationsCount: number;
    additionsCount: number;
    securityBits: number;
  };
}

/* ====================================================================
   BLOCKCHAIN-BASED AUDIT TRAIL SYSTEM
   ==================================================================== */

export type AuditCategory = 'detected_intrusion' | 'model_training' | 'access_control';

export interface AuditTrailRecord {
  id: string;
  blockHeight: number;
  txHash: string;
  timestamp: number;
  category: AuditCategory;
  action: string;
  actor: string; // Node ID or admin address
  summary: string;
  metadata: {
    mitreTechnique?: string;
    threatSeverity?: string;
    flRound?: number;
    modelAccuracy?: number;
    epsilonBudgetSpent?: number;
    targetResource?: string;
    ipOrigin?: string;
  };
  previousRecordHash: string;
  recordHash: string;
  validatorSignature: string;
  isTampered?: boolean;
}

/* ====================================================================
   FEDERATED LEARNING COLLABORATIVE WORKBENCH
   ==================================================================== */

export interface NodeTrainingProfile {
  nodeId: string;
  nodeName: string;
  tier: CloudTier;
  datasetSamples: number;
  dataDistribution: string;
  localEpochs: number;
  localBatchSize: number;
  localLoss: number;
  localAccuracy: number;
  gradientNormL2: number;
  encryptedGradientHash: string;
  isByzantineSuspect: boolean;
  uploadStatus: 'Uploaded & Encrypted' | 'Training Local Epochs' | 'Aggregated' | 'Rejected (Byzantine)';
}
