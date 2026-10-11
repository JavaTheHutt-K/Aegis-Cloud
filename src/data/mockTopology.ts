import { 
  CloudNode, 
  AttackScenario, 
  LedgerBlock, 
  FederatedModelRound, 
  MitigationRule, 
  SmartContractMethod,
  AuditTrailRecord,
  NodeTrainingProfile
} from '../types/framework';

export const INITIAL_CLOUD_NODES: CloudNode[] = [
  {
    id: 'node-core-us-east',
    name: 'Core-Region-US-East',
    tier: 'central_core',
    region: 'us-east-1 (N. Virginia)',
    provider: 'AWS',
    ipAddress: '54.210.88.14',
    status: 'healthy',
    cpuUsage: 42,
    memoryUsage: 64,
    processedPacketsPerSec: 18450,
    privacyBudgetConsumed: 1.2,
    privacyBudgetLimit: 10.0,
    localAnomalyScore: 0.04,
    isValidator: true,
    activeThreatCount: 0
  },
  {
    id: 'node-core-eu-central',
    name: 'Core-Region-EU-Central',
    tier: 'central_core',
    region: 'eu-central-1 (Frankfurt)',
    provider: 'GCP',
    ipAddress: '34.89.120.45',
    status: 'healthy',
    cpuUsage: 38,
    memoryUsage: 58,
    processedPacketsPerSec: 16200,
    privacyBudgetConsumed: 0.9,
    privacyBudgetLimit: 10.0,
    localAnomalyScore: 0.03,
    isValidator: true,
    activeThreatCount: 0
  },
  {
    id: 'node-fog-ap-tokyo',
    name: 'Fog-Gateway-AP-Tokyo',
    tier: 'fog_gateway',
    region: 'ap-northeast-1 (Tokyo)',
    provider: 'Azure',
    ipAddress: '20.189.64.91',
    status: 'healthy',
    cpuUsage: 55,
    memoryUsage: 71,
    processedPacketsPerSec: 24500,
    privacyBudgetConsumed: 2.1,
    privacyBudgetLimit: 10.0,
    localAnomalyScore: 0.08,
    isValidator: true,
    activeThreatCount: 0
  },
  {
    id: 'node-edge-k8s-alpha',
    name: 'Edge-K8s-Cluster-Alpha',
    tier: 'edge_cluster',
    region: 'us-west-2 (Oregon Edge)',
    provider: 'Edge-K8s',
    ipAddress: '198.51.100.22',
    status: 'healthy',
    cpuUsage: 62,
    memoryUsage: 77,
    processedPacketsPerSec: 9800,
    privacyBudgetConsumed: 3.4,
    privacyBudgetLimit: 10.0,
    localAnomalyScore: 0.06,
    isValidator: false,
    activeThreatCount: 0
  },
  {
    id: 'node-edge-k8s-beta',
    name: 'Edge-K8s-Cluster-Beta',
    tier: 'edge_cluster',
    region: 'eu-west-1 (Dublin Edge)',
    provider: 'Edge-K8s',
    ipAddress: '198.51.100.78',
    status: 'healthy',
    cpuUsage: 49,
    memoryUsage: 65,
    processedPacketsPerSec: 8400,
    privacyBudgetConsumed: 2.8,
    privacyBudgetLimit: 10.0,
    localAnomalyScore: 0.05,
    isValidator: false,
    activeThreatCount: 0
  },
  {
    id: 'node-iot-gateway-delta',
    name: 'Edge-IoT-Gateway-Delta',
    tier: 'iot_gateway',
    region: 'sa-east-1 (São Paulo Fog)',
    provider: 'Bare-Metal',
    ipAddress: '203.0.113.104',
    status: 'healthy',
    cpuUsage: 71,
    memoryUsage: 82,
    processedPacketsPerSec: 5200,
    privacyBudgetConsumed: 4.1,
    privacyBudgetLimit: 10.0,
    localAnomalyScore: 0.09,
    isValidator: false,
    activeThreatCount: 0
  }
];

export const ATTACK_SCENARIOS: AttackScenario[] = [
  {
    id: 'ddos_syn_flood',
    name: 'Distributed SYN Flood Exhaustion',
    category: 'Network Flooding',
    severity: 'Critical',
    mitreTechnique: 'T1498.001 - Direct Network Flood',
    description: 'High-volume spoofed TCP SYN packet blast targeting Edge ingress microservices to exhaust connection backlog pools.',
    packetRate: 85000,
    flowEntropy: 7.82,
    targetTier: 'edge_cluster',
    targetNodeId: 'node-edge-k8s-alpha',
    payloadSignature: 'TCP_SYN_NO_ACK_SPOOFED_BURST',
    detectedFeatures: [
      { featureName: 'SYN/ACK Flag Ratio', value: '0.98 (Normal: 0.12)', importance: 0.94 },
      { featureName: 'Flow Duration Mean', value: '42ms (Extremely truncated)', importance: 0.88 },
      { featureName: 'Dst Port 443 Entropy', value: '1.02 bits', importance: 0.79 },
      { featureName: 'Forward Packet Rate', value: '1,420 pkts/s per flow', importance: 0.75 }
    ]
  },
  {
    id: 'sql_injection_exfiltration',
    name: 'Blind SQLi & Tenant Data Exfiltration',
    category: 'Web Application',
    severity: 'High',
    mitreTechnique: 'T1190 - Exploit Public-Facing Application',
    description: 'Targeted evasion payload exploiting REST query endpoints with boolean-based inference to extract database schema.',
    packetRate: 1200,
    flowEntropy: 5.41,
    targetTier: 'fog_gateway',
    targetNodeId: 'node-fog-ap-tokyo',
    payloadSignature: "UNION_SELECT_SLEEP_ENC_PAYLOAD",
    detectedFeatures: [
      { featureName: 'Payload Character Entropy', value: '6.71 (High SQL token variance)', importance: 0.91 },
      { featureName: 'HTTP Request Body Length', value: '2,840 bytes', importance: 0.82 },
      { featureName: 'Response Latency Jitter', value: '5,020ms injected delay', importance: 0.86 },
      { featureName: 'Repeated Error Code Rate', value: '500 Internal / 422 Unprocessable', importance: 0.68 }
    ]
  },
  {
    id: 'ssh_bruteforce_lateral',
    name: 'SSH Distributed Credential Stuffing',
    category: 'Credential Access',
    severity: 'High',
    mitreTechnique: 'T1110.003 - Password Spraying',
    description: 'Synchronized low-and-slow authentication probes cycling known credentials across cloud bastion hosts to bypass simple thresholds.',
    packetRate: 2400,
    flowEntropy: 4.88,
    targetTier: 'edge_cluster',
    targetNodeId: 'node-edge-k8s-beta',
    payloadSignature: 'SSH_AUTH_FAIL_CLUSTER_PATTERN',
    detectedFeatures: [
      { featureName: 'TCP Port 22 Session Count', value: '38 concurrent flows', importance: 0.89 },
      { featureName: 'Encrypted Key Exchange Rate', value: '14 kex/sec', importance: 0.84 },
      { featureName: 'Flow Byte Ratio', value: 'Client:Server 1:4.8', importance: 0.73 },
      { featureName: 'Source IP Geo-Distribution', value: '24 distinct subnets', importance: 0.66 }
    ]
  },
  {
    id: 'byzantine_model_poisoning',
    name: 'Adversarial FL Model Poisoning',
    category: 'Adversarial ML',
    severity: 'Critical',
    mitreTechnique: 'T1565.001 - Data Manipulation / Model Backdoor',
    description: 'Compromised node injecting poisoned weight gradients during federated aggregation round to induce targeted classification blindspots.',
    packetRate: 450,
    flowEntropy: 6.12,
    targetTier: 'iot_gateway',
    targetNodeId: 'node-iot-gateway-delta',
    payloadSignature: 'GRADIENT_SIGN_FLIP_L2_OUTLIER',
    detectedFeatures: [
      { featureName: 'L2 Gradient Norm Distance', value: '||ΔW|| = 18.4 (Mean: 2.1)', importance: 0.99 },
      { featureName: 'Cosine Similarity with Global', value: '-0.74 (Inversion anomaly)', importance: 0.97 },
      { featureName: 'Differential Privacy Claim', value: 'ε claim 0.5 vs verified 4.2', importance: 0.93 },
      { featureName: 'Zero-Knowledge Proof Validity', value: 'Verification Failed (zk-BN254)', importance: 0.95 }
    ]
  },
  {
    id: 'covert_c2_dns',
    name: 'Covert DNS Tunneling & C2 Heartbeat',
    category: 'Command & Control',
    severity: 'Medium',
    mitreTechnique: 'T1071.004 - DNS Data Protocol Tunneling',
    description: 'Low-throughput base32 encoded subdomain queries stealthily routing heartbeat data and command tokens through benign DNS recursors.',
    packetRate: 850,
    flowEntropy: 6.95,
    targetTier: 'central_core',
    targetNodeId: 'node-core-us-east',
    payloadSignature: 'BASE32_SUBDOMAIN_BURST',
    detectedFeatures: [
      { featureName: 'Subdomain String Length', value: '54 chars (Normal avg: 11)', importance: 0.92 },
      { featureName: 'DNS Query Type', value: 'TXT / NULL record burst', importance: 0.85 },
      { featureName: 'Query Frequency Entropy', value: 'Uniform jitter interval 1200ms', importance: 0.78 },
      { featureName: 'Negative Cache (NXDOMAIN)', value: '38% response failure', importance: 0.71 }
    ]
  },
  {
    id: 'benign_baseline',
    name: 'Benign Production Workload',
    category: 'Normal Traffic',
    severity: 'Benign',
    mitreTechnique: 'Normal Operations (Baseline Control)',
    description: 'Legitimate microservice mesh gRPC and REST telemetry with nominal entropy and symmetric handshake patterns.',
    packetRate: 6400,
    flowEntropy: 4.12,
    targetTier: 'central_core',
    targetNodeId: 'node-core-eu-central',
    payloadSignature: 'VALID_TLS_1_3_ESTABLISHED',
    detectedFeatures: [
      { featureName: 'TCP Handshake Completion', value: '100% normal', importance: 0.1 },
      { featureName: 'Payload Content-Type', value: 'application/json + protobuf', importance: 0.08 },
      { featureName: 'Response Code 200 Ratio', value: '99.4%', importance: 0.05 },
      { featureName: 'L2 Gradient Norm', value: '1.82 (Nominal)', importance: 0.06 }
    ]
  }
];

export const INITIAL_BLOCKS: LedgerBlock[] = [
  {
    blockHeight: 1042,
    blockHash: '0x8f4c2198be019f2a715cd388e23f09ab56c12e8a1598f4510b91dce3e479a021',
    previousHash: '0x3a9e104b9015c7e8912ba4d112ef089a456c7102e3b4829f01bc9842a1738d2f',
    timestamp: Date.now() - 360000,
    validatorNodeId: 'node-core-us-east',
    merkleRoot: '0xd7a5e8412bb940182fc092b77a1094ce44e5912a7d81230491823bcde9012411',
    transactionsCount: 3,
    gasUsed: 142850,
    zkSnarkProofRoot: '0x99281a7bce0019284fa9201bdce8910a2839401bdce8192039401bdce8910a28',
    transactions: [
      {
        txHash: '0x101a9f82bce7194012bc091283eacde901923841029384710293847102938471',
        timestamp: Date.now() - 359000,
        type: 'TX_MODEL_UPDATE',
        senderNodeId: 'node-edge-k8s-alpha',
        senderAddress: '0x71C...a829',
        payloadSummary: 'Federated weight delta round #18 committed with ε=0.8, C=2.0',
        zkProofHash: '0x8891230491823bcde9012411d7a5e8412bb940182fc092b77a1094ce44e5912a',
        zkProofVerified: true,
        privacyParameters: {
          epsilonDP: 0.8,
          deltaDP: 1e-5,
          clippingNorm: 2.0,
          noiseScale: 0.65
        },
        smartContract: 'FederatedConsensus'
      },
      {
        txHash: '0x202b8e71ade8205123cd102394fbdef012034952130495821304958213049582',
        timestamp: Date.now() - 355000,
        type: 'TX_INTRUSION_ALERT',
        senderNodeId: 'node-fog-ap-tokyo',
        senderAddress: '0x94D...e411',
        payloadSummary: 'High-entropy SQL payload signature verified & cataloged',
        threatType: 'sql_injection_exfiltration',
        mitreTactic: 'T1190',
        zkProofHash: '0x44e5912a7d81230491823bcde9012411d7a5e8412bb940182fc092b77a1094ce',
        zkProofVerified: true,
        privacyParameters: {
          epsilonDP: 0.5,
          deltaDP: 1e-5,
          clippingNorm: 1.5,
          noiseScale: 0.45
        },
        smartContract: 'IntrusionRegistry'
      },
      {
        txHash: '0x303c7d60bdf9316234de213405gcef1231450632415069324150693241506932',
        timestamp: Date.now() - 350000,
        type: 'TX_DEFENSE_RULE',
        senderNodeId: 'node-core-us-east',
        senderAddress: '0x12A...f902',
        payloadSummary: 'Synchronized eBPF rule #R-401 deployed to 6 cloud endpoints',
        defenseRuleApplied: 'eBPF Filter: DROP src_cidr=198.51.100.0/24 rate > 2k/s',
        zkProofHash: '0x12411d7a5e8412bb940182fc092b77a1094ce44e5912a7d81230491823bcde90',
        zkProofVerified: true,
        privacyParameters: {
          epsilonDP: 0.0,
          deltaDP: 0.0,
          clippingNorm: 0.0,
          noiseScale: 0.0
        },
        smartContract: 'DefenseOrchestrator'
      }
    ]
  },
  {
    blockHeight: 1041,
    blockHash: '0x3a9e104b9015c7e8912ba4d112ef089a456c7102e3b4829f01bc9842a1738d2f',
    previousHash: '0x29184fcde091248ba0182fc092b77a1094ce44e5912a7d81230491823bcde901',
    timestamp: Date.now() - 720000,
    validatorNodeId: 'node-core-eu-central',
    merkleRoot: '0xbb940182fc092b77a1094ce44e5912a7d81230491823bcde9012411d7a5e8412',
    transactionsCount: 2,
    gasUsed: 98200,
    zkSnarkProofRoot: '0x8192039401bdce8910a2899281a7bce0019284fa9201bdce8910a2839401bdce',
    transactions: [
      {
        txHash: '0x404d6c5fae0a427345ef324516hdeg2342561743526170435261704352617043',
        timestamp: Date.now() - 718000,
        type: 'TX_MODEL_UPDATE',
        senderNodeId: 'node-edge-k8s-beta',
        senderAddress: '0x32B...c190',
        payloadSummary: 'Federated weight delta round #17 committed with ε=0.8, C=2.0',
        zkProofHash: '0x9012411d7a5e8412bb940182fc092b77a1094ce44e5912a7d81230491823bcde',
        zkProofVerified: true,
        privacyParameters: {
          epsilonDP: 0.8,
          deltaDP: 1e-5,
          clippingNorm: 2.0,
          noiseScale: 0.65
        },
        smartContract: 'FederatedConsensus'
      },
      {
        txHash: '0x505e5b4ebf1b538456fa435627iehf3453672854637281546372815463728154',
        timestamp: Date.now() - 710000,
        type: 'TX_NODE_QUARANTINE',
        senderNodeId: 'node-core-eu-central',
        senderAddress: '0x55C...b801',
        payloadSummary: 'Consensus voting: Isolated suspect node-sim-rogue due to poisoning variance',
        threatType: 'byzantine_model_poisoning',
        mitreTactic: 'T1565.001',
        zkProofHash: '0x7d81230491823bcde9012411d7a5e8412bb940182fc092b77a1094ce44e5912a',
        zkProofVerified: true,
        privacyParameters: {
          epsilonDP: 0.0,
          deltaDP: 0.0,
          clippingNorm: 0.0,
          noiseScale: 0.0
        },
        smartContract: 'DefenseOrchestrator'
      }
    ]
  }
];

export const INITIAL_FL_ROUNDS: FederatedModelRound[] = [
  {
    roundNumber: 18,
    globalVersion: 'v2.4.1-PPAI',
    timestamp: Date.now() - 180000,
    participatingNodes: ['node-core-us-east', 'node-core-eu-central', 'node-fog-ap-tokyo', 'node-edge-k8s-alpha', 'node-edge-k8s-beta'],
    globalAccuracy: 98.42,
    falsePositiveRate: 0.24,
    f1Score: 0.985,
    noiseMultiplier: 1.15,
    epsilonRound: 0.8,
    cumulativeEpsilon: 3.4,
    byzantineRejectedNodes: [],
    aggregationStatus: 'Aggregated'
  },
  {
    roundNumber: 17,
    globalVersion: 'v2.4.0-PPAI',
    timestamp: Date.now() - 720000,
    participatingNodes: ['node-core-us-east', 'node-core-eu-central', 'node-fog-ap-tokyo', 'node-edge-k8s-beta'],
    globalAccuracy: 97.90,
    falsePositiveRate: 0.38,
    f1Score: 0.978,
    noiseMultiplier: 1.15,
    epsilonRound: 0.8,
    cumulativeEpsilon: 2.6,
    byzantineRejectedNodes: ['node-sim-rogue'],
    aggregationStatus: 'Aggregated'
  },
  {
    roundNumber: 16,
    globalVersion: 'v2.3.9-PPAI',
    timestamp: Date.now() - 1440000,
    participatingNodes: ['node-core-us-east', 'node-core-eu-central', 'node-fog-ap-tokyo', 'node-edge-k8s-alpha', 'node-edge-k8s-beta', 'node-iot-gateway-delta'],
    globalAccuracy: 97.15,
    falsePositiveRate: 0.49,
    f1Score: 0.971,
    noiseMultiplier: 1.20,
    epsilonRound: 0.8,
    cumulativeEpsilon: 1.8,
    byzantineRejectedNodes: [],
    aggregationStatus: 'Aggregated'
  }
];

export const INITIAL_MITIGATION_RULES: MitigationRule[] = [
  {
    id: 'RULE-SEC-401',
    blockHeight: 1042,
    timestamp: Date.now() - 350000,
    ruleType: 'IP_BLOCK_EBPF',
    targetPattern: 'DROP 198.51.100.0/24 SYN flood rate > 2k/s',
    severity: 'Critical',
    enforcedNodesCount: 6,
    status: 'Active',
    originTxHash: '0x303c7d60bdf9316234de213405gcef1231450632415069324150693241506932'
  },
  {
    id: 'RULE-SEC-400',
    blockHeight: 1041,
    timestamp: Date.now() - 710000,
    ruleType: 'MODEL_FILTER',
    targetPattern: 'Krum/Trimmed-Mean filter reject gradient ||ΔW|| > 8.0',
    severity: 'High',
    enforcedNodesCount: 6,
    status: 'Active',
    originTxHash: '0x505e5b4ebf1b538456fa435627iehf3453672854637281546372815463728154'
  },
  {
    id: 'RULE-SEC-399',
    blockHeight: 1039,
    timestamp: Date.now() - 1800000,
    ruleType: 'RATE_LIMIT_FOG',
    targetPattern: 'Limit DNS TXT queries to 15 req/min per tenant',
    severity: 'Medium',
    enforcedNodesCount: 6,
    status: 'Active',
    originTxHash: '0x18923a1029384710293847102938471029384710293847102938471029384710'
  }
];

export const SMART_CONTRACT_METHODS: SmartContractMethod[] = [
  {
    name: 'registerThreatProof',
    contract: 'IntrusionRegistry',
    description: 'Verifies zk-SNARK proof and registers hashed threat vector without revealing raw tenant traffic.',
    inputs: [
      { name: 'threatSignatureHash', type: 'bytes32', placeholder: '0x8f2a...3901' },
      { name: 'mitreTechniqueId', type: 'string', placeholder: 'T1498.001' },
      { name: 'zkProof_pi_a', type: 'uint256[2]', placeholder: '[0x1a..., 0x2b...]' },
      { name: 'epsilonConsumed', type: 'uint256', placeholder: '500 (representing 0.50)' }
    ],
    payable: false
  },
  {
    name: 'submitFederatedUpdate',
    contract: 'FederatedConsensus',
    description: 'Submits DP-perturbed gradient commitment and validates Byzantine distance bounds against peer validators.',
    inputs: [
      { name: 'roundNumber', type: 'uint256', placeholder: '19' },
      { name: 'gradientCommitment', type: 'bytes32', placeholder: '0x99a1...1203' },
      { name: 'clippingNormC', type: 'uint256', placeholder: '2000 (representing 2.0)' },
      { name: 'zkAccuracyProof', type: 'bytes', placeholder: '0x712a...98bf' }
    ],
    payable: false
  },
  {
    name: 'broadcastMitigationRule',
    contract: 'DefenseOrchestrator',
    description: 'Deploys an immutable mitigation rule to all ubiquitous cloud and fog nodes via consensus signature.',
    inputs: [
      { name: 'ruleType', type: 'uint8', placeholder: '1 (IP_BLOCK_EBPF)' },
      { name: 'targetPattern', type: 'string', placeholder: 'DROP 198.51.100.0/24 rate > 2k/s' },
      { name: 'severityLevel', type: 'uint8', placeholder: '3 (Critical)' }
    ],
    payable: false
  }
];

export const INITIAL_AUDIT_RECORDS: AuditTrailRecord[] = [
  {
    id: 'AUDIT-LOG-1042-01',
    blockHeight: 1042,
    txHash: '0x303c7d60bdf9316234de213405gcef1231450632415069324150693241506932',
    timestamp: Date.now() - 350000,
    category: 'access_control',
    action: 'POLICY_ENFORCEMENT_BROADCAST',
    actor: 'node-core-us-east (Validator Consortia #01)',
    summary: 'Immutable eBPF drop rule #RULE-SEC-401 broadcast to 6 cloud endpoints under consensus authorization',
    metadata: {
      targetResource: 'Kernel eBPF XDP Filter on 6 nodes',
      threatSeverity: 'Critical'
    },
    previousRecordHash: '0x7a819bce41029384710293847102938471029384710293847102938471029384',
    recordHash: '0x9b10293847102938471029384710293847102938471029384710293847102938',
    validatorSignature: '0x1c849102938471029384710293847102938471029384710293847102938471023b91',
    isTampered: false
  },
  {
    id: 'AUDIT-LOG-1042-02',
    blockHeight: 1042,
    txHash: '0x202b8e71ade8205123cd102394fbdef012034952130495821304958213049582',
    timestamp: Date.now() - 355000,
    category: 'detected_intrusion',
    action: 'INTRUSION_ZK_PROOF_RECORDED',
    actor: 'node-fog-ap-tokyo',
    summary: 'Detected high-entropy SQL injection probe. zk-SNARK Groth16 proof verified without tenant data disclosure.',
    metadata: {
      mitreTechnique: 'T1190 - Exploit Public-Facing App',
      threatSeverity: 'High',
      ipOrigin: '20.189.64.91 Ingress'
    },
    previousRecordHash: '0x8891230491823bcde9012411d7a5e8412bb940182fc092b77a1094ce44e5912a',
    recordHash: '0x7a819bce41029384710293847102938471029384710293847102938471029384',
    validatorSignature: '0x2d950293847102938471029384710293847102938471029384710293847102934c82',
    isTampered: false
  },
  {
    id: 'AUDIT-LOG-1042-03',
    blockHeight: 1042,
    txHash: '0x101a9f82bce7194012bc091283eacde901923841029384710293847102938471',
    timestamp: Date.now() - 359000,
    category: 'model_training',
    action: 'FEDERATED_UPDATE_COMMIT',
    actor: 'node-edge-k8s-alpha',
    summary: 'Homomorphic Paillier gradient commitment accepted for FL Round #18. (ε=0.8, C=2.0)',
    metadata: {
      flRound: 18,
      modelAccuracy: 98.42,
      epsilonBudgetSpent: 0.8
    },
    previousRecordHash: '0x505e5b4ebf1b538456fa435627iehf3453672854637281546372815463728154',
    recordHash: '0x8891230491823bcde9012411d7a5e8412bb940182fc092b77a1094ce44e5912a',
    validatorSignature: '0x3e061304958213049582130495821304958213049582130495821304958213045d93',
    isTampered: false
  },
  {
    id: 'AUDIT-LOG-1041-01',
    blockHeight: 1041,
    txHash: '0x505e5b4ebf1b538456fa435627iehf3453672854637281546372815463728154',
    timestamp: Date.now() - 710000,
    category: 'access_control',
    action: 'NODE_QUARANTINE_CONSENSUS',
    actor: 'node-core-eu-central',
    summary: 'Consensus voting: Isolated node-sim-rogue following Byzantine gradient variance check (||ΔW|| > 12.0)',
    metadata: {
      targetResource: 'node-sim-rogue isolation from FL aggregator',
      threatSeverity: 'Critical'
    },
    previousRecordHash: '0x404d6c5fae0a427345ef324516hdeg2342561743526170435261704352617043',
    recordHash: '0x505e5b4ebf1b538456fa435627iehf3453672854637281546372815463728154',
    validatorSignature: '0x4f172415069324150693241506932415069324150693241506932415069324156ea4',
    isTampered: false
  },
  {
    id: 'AUDIT-LOG-1041-02',
    blockHeight: 1041,
    txHash: '0x404d6c5fae0a427345ef324516hdeg2342561743526170435261704352617043',
    timestamp: Date.now() - 718000,
    category: 'model_training',
    action: 'FEDERATED_UPDATE_COMMIT',
    actor: 'node-edge-k8s-beta',
    summary: 'Homomorphically encrypted gradient aggregated into global model v2.4.0-PPAI',
    metadata: {
      flRound: 17,
      modelAccuracy: 97.90,
      epsilonBudgetSpent: 0.8
    },
    previousRecordHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    recordHash: '0x404d6c5fae0a427345ef324516hdeg2342561743526170435261704352617043',
    validatorSignature: '0x5a283526170435261704352617043526170435261704352617043526170435267fb5',
    isTampered: false
  }
];

export const INITIAL_NODE_PROFILES: NodeTrainingProfile[] = [
  {
    nodeId: 'node-core-us-east',
    nodeName: 'Core-Region-US-East',
    tier: 'central_core',
    datasetSamples: 124500,
    dataDistribution: 'Non-IID Ingress Flows',
    localEpochs: 5,
    localBatchSize: 64,
    localLoss: 0.042,
    localAccuracy: 98.65,
    gradientNormL2: 1.84,
    encryptedGradientHash: '0x8f2a102938471029384710293847102938471029384710293847102938471029',
    isByzantineSuspect: false,
    uploadStatus: 'Uploaded & Encrypted'
  },
  {
    nodeId: 'node-core-eu-central',
    nodeName: 'Core-Region-EU-Central',
    tier: 'central_core',
    datasetSamples: 98200,
    dataDistribution: 'Non-IID Cloud RPC',
    localEpochs: 5,
    localBatchSize: 64,
    localLoss: 0.048,
    localAccuracy: 98.32,
    gradientNormL2: 1.91,
    encryptedGradientHash: '0x9a3b213049582130495821304958213049582130495821304958213049582130',
    isByzantineSuspect: false,
    uploadStatus: 'Uploaded & Encrypted'
  },
  {
    nodeId: 'node-fog-ap-tokyo',
    nodeName: 'Fog-Gateway-AP-Tokyo',
    tier: 'fog_gateway',
    datasetSamples: 84600,
    dataDistribution: 'Balanced Edge Flows',
    localEpochs: 4,
    localBatchSize: 32,
    localLoss: 0.054,
    localAccuracy: 97.88,
    gradientNormL2: 2.12,
    encryptedGradientHash: '0xab4c324150693241506932415069324150693241506932415069324150693241',
    isByzantineSuspect: false,
    uploadStatus: 'Uploaded & Encrypted'
  },
  {
    nodeId: 'node-edge-k8s-alpha',
    nodeName: 'Edge-K8s-Cluster-Alpha',
    tier: 'edge_cluster',
    datasetSamples: 62100,
    dataDistribution: 'Non-IID Ingress Flows',
    localEpochs: 4,
    localBatchSize: 32,
    localLoss: 0.059,
    localAccuracy: 97.45,
    gradientNormL2: 2.25,
    encryptedGradientHash: '0xbc5d435261704352617043526170435261704352617043526170435261704352',
    isByzantineSuspect: false,
    uploadStatus: 'Uploaded & Encrypted'
  },
  {
    nodeId: 'node-edge-k8s-beta',
    nodeName: 'Edge-K8s-Cluster-Beta',
    tier: 'edge_cluster',
    datasetSamples: 58400,
    dataDistribution: 'Balanced Edge Flows',
    localEpochs: 4,
    localBatchSize: 32,
    localLoss: 0.063,
    localAccuracy: 97.10,
    gradientNormL2: 2.31,
    encryptedGradientHash: '0xcd6e546372815463728154637281546372815463728154637281546372815463',
    isByzantineSuspect: false,
    uploadStatus: 'Uploaded & Encrypted'
  },
  {
    nodeId: 'node-iot-gateway-delta',
    nodeName: 'Edge-IoT-Gateway-Delta',
    tier: 'iot_gateway',
    datasetSamples: 34200,
    dataDistribution: 'Non-IID IoT Protocol',
    localEpochs: 3,
    localBatchSize: 16,
    localLoss: 0.078,
    localAccuracy: 96.50,
    gradientNormL2: 2.68,
    encryptedGradientHash: '0xde7f657483926574839265748392657483926574839265748392657483926574',
    isByzantineSuspect: false,
    uploadStatus: 'Uploaded & Encrypted'
  }
];

