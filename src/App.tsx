import React, { useState, useEffect } from 'react';
import { ActiveTab, Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { TopologyView } from './components/TopologyView';
import { FederatedLearningModule } from './components/FederatedLearningModule';
import { HomomorphicEncryptionView } from './components/HomomorphicEncryptionView';
import { AuditTrailView } from './components/AuditTrailView';
import { BlockchainLedgerView } from './components/BlockchainLedgerView';
import { AttackSimulatorView } from './components/AttackSimulatorView';
import { ThreatDetailModal } from './components/ThreatDetailModal';
import { HuggingFaceModelsView, CURATED_HF_MODELS } from './components/HuggingFaceModelsView';

import {
  CloudNode,
  LedgerBlock,
  FederatedModelRound,
  MitigationRule,
  AttackScenario,
  BlockchainTransaction,
  TelemetryPacket,
  AuditTrailRecord,
  NodeTrainingProfile,
  HuggingFaceModel
} from './types/framework';

import {
  INITIAL_CLOUD_NODES,
  INITIAL_BLOCKS,
  INITIAL_FL_ROUNDS,
  INITIAL_MITIGATION_RULES,
  INITIAL_AUDIT_RECORDS,
  INITIAL_NODE_PROFILES,
  ATTACK_SCENARIOS
} from './data/mockTopology';

import { computeMerkleRoot, sampleGaussianNoise, generateZkProof } from './utils/crypto';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  logoutUser, 
  testConnection, 
  handleFirestoreError, 
  OperationType, 
  FirebaseUser 
} from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [nodes, setNodes] = useState<CloudNode[]>(INITIAL_CLOUD_NODES);
  const [blocks, setBlocks] = useState<LedgerBlock[]>(INITIAL_BLOCKS);
  const [rounds, setRounds] = useState<FederatedModelRound[]>(INITIAL_FL_ROUNDS);
  const [mitigationRules, setMitigationRules] = useState<MitigationRule[]>(INITIAL_MITIGATION_RULES);
  const [auditRecords, setAuditRecords] = useState<AuditTrailRecord[]>(INITIAL_AUDIT_RECORDS);
  const [nodeProfiles, setNodeProfiles] = useState<NodeTrainingProfile[]>(INITIAL_NODE_PROFILES);
  const [importedModels, setImportedModels] = useState<HuggingFaceModel[]>(CURATED_HF_MODELS.slice(0, 2));

  // Firebase auth & cloud connection state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(false);

  const [selectedTransaction, setSelectedTransaction] = useState<BlockchainTransaction | null>(null);

  // Simulation pipeline state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [activeSimulationScenario, setActiveSimulationScenario] = useState<AttackScenario | null>(null);
  const [latestMitigationMessage, setLatestMitigationMessage] = useState<string | null>(null);
  const [isProcessingRound, setIsProcessingRound] = useState<boolean>(false);
  const [isDeployingModel, setIsDeployingModel] = useState<boolean>(false);

  // Initial telemetry packets
  const [simulationPackets, setSimulationPackets] = useState<TelemetryPacket[]>(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: `FLW-1042-${i + 1}`,
      timestamp: Date.now() - (i * 12000),
      sourceIp: `198.51.100.${10 + i * 4}`,
      destinationIp: '54.210.88.14',
      protocol: i % 2 === 0 ? 'TCP' : 'HTTP',
      length: 512 + (i * 128),
      flowDurationMs: 42 + (i * 15),
      synFlagRatio: 0.12,
      anomalyScore: 0.04 + (i * 0.01),
      isAnomaly: false,
      privacyProtected: true,
      nodeId: 'node-core-us-east'
    }));
  });

  // Verify connection to Firestore & listen to Firebase Auth state
  useEffect(() => {
    testConnection().then((connected) => {
      setIsFirestoreConnected(connected);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Sync user profile in Firestore
        try {
          await setDoc(doc(db, 'users', user.uid), {
            id: user.uid,
            email: user.email || 'user@aegiscloud.internal',
            displayName: user.displayName || 'Cloud Operator',
            photoURL: user.photoURL || '',
            role: 'operator',
            createdAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn('Could not sync user profile to Firestore:', err);
        }

        // Try to fetch persisted Hugging Face models from Firestore
        try {
          const snapshot = await getDocs(collection(db, 'hf_models'));
          if (!snapshot.empty) {
            const loadedModels: HuggingFaceModel[] = [];
            snapshot.forEach(docSnap => {
              loadedModels.push(docSnap.data() as HuggingFaceModel);
            });
            if (loadedModels.length > 0) {
              setImportedModels(prev => {
                const map = new Map<string, HuggingFaceModel>();
                prev.forEach(m => map.set(m.id, m));
                loadedModels.forEach(m => map.set(m.id, m));
                return Array.from(map.values());
              });
            }
          }
        } catch {
          // Fall back gracefully if offline
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In & Sign-Out handlers
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign-in failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };

  // Import Hugging Face model and persist to Google Cloud Firestore
  const handleImportHfModel = async (model: HuggingFaceModel) => {
    setImportedModels(prev => {
      const exists = prev.some(m => m.id === model.id);
      return exists ? prev.map(m => m.id === model.id ? model : m) : [model, ...prev];
    });

    // Persist to Google Cloud Firestore if connected
    if (currentUser) {
      const path = 'hf_models';
      try {
        await setDoc(doc(db, path, model.id), {
          ...model,
          importedByUid: currentUser.uid
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }

    // Add record to Audit Trail
    const newAuditRecord: AuditTrailRecord = {
      id: `AUDIT-LOG-${Date.now().toString().slice(-6)}`,
      blockHeight: blocks[0]?.blockHeight ?? 1042,
      txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      timestamp: Date.now(),
      category: 'model_training',
      action: 'HUGGING_FACE_MODEL_IMPORTED',
      actor: currentUser?.email || 'authenticated-operator',
      summary: `Imported Hugging Face model ${model.modelId} (${model.architecture}, Accuracy: ${model.benchmarkAccuracy}%) into Google Cloud Firestore.`,
      metadata: {
        modelAccuracy: model.benchmarkAccuracy,
        targetResource: model.pipelineTag
      },
      previousRecordHash: auditRecords[0]?.recordHash || '0x0000000000000000000000000000000000000000000000000000000000000000',
      recordHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      validatorSignature: '0x88f2' + Array.from({ length: 60 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      isTampered: false
    };

    setAuditRecords(prev => [newAuditRecord, ...prev]);
  };

  // Deploy imported Hugging Face model weights to cloud nodes
  const handleDeployHfModelToEdge = (model: HuggingFaceModel) => {
    setIsDeployingModel(true);
    setTimeout(() => {
      // Update nodes detection score & accuracy
      setNodes(prev => prev.map(n => ({
        ...n,
        localAnomalyScore: Number(Math.max(0.02, n.localAnomalyScore - 0.01).toFixed(3))
      })));

      setNodeProfiles(prev => prev.map(p => ({
        ...p,
        localAccuracy: Number(Math.min(99.8, Math.max(p.localAccuracy, model.benchmarkAccuracy)).toFixed(2)),
        localLoss: Number(Math.max(0.015, p.localLoss * 0.85).toFixed(3))
      })));

      const nextRoundNum = (rounds[0]?.roundNumber ?? 18) + 1;
      const updatedRound: FederatedModelRound = {
        roundNumber: nextRoundNum,
        globalVersion: `hf-${model.id}-v1.0`,
        timestamp: Date.now(),
        participatingNodes: nodes.map(n => n.id),
        globalAccuracy: model.benchmarkAccuracy,
        falsePositiveRate: 0.18,
        f1Score: 0.991,
        noiseMultiplier: 1.12,
        epsilonRound: 0.8,
        cumulativeEpsilon: Number(((rounds[0]?.cumulativeEpsilon ?? 3.4) + 0.8).toFixed(2)),
        byzantineRejectedNodes: [],
        aggregationStatus: 'Aggregated'
      };
      setRounds(prev => [updatedRound, ...prev]);

      setIsDeployingModel(false);
      setActiveTab('topology');
    }, 700);
  };

  // Execute full 5-stage attack detection & consensus defense simulation
  const handleExecuteSimulation = async (scenario: AttackScenario) => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveSimulationScenario(scenario);
    setLatestMitigationMessage(null);
    setSimulationStep(1);

    // Step 1: Telemetry Ingestion (400ms)
    await new Promise(r => setTimeout(r, 400));
    const isMalicious = scenario.severity !== 'Benign';
    const anomalyScore = isMalicious ? 0.94 : 0.04;

    const newPackets: TelemetryPacket[] = Array.from({ length: 8 }, (_, i) => ({
      id: `FLW-${Date.now().toString().slice(-4)}-${i + 1}`,
      timestamp: Date.now() - (i * 1000),
      sourceIp: isMalicious ? `198.51.100.${100 + i}` : `10.0.4.${20 + i}`,
      destinationIp: '54.210.88.14',
      protocol: scenario.id.includes('dns') ? 'DNS' : scenario.id.includes('syn') ? 'TCP' : 'HTTP',
      length: isMalicious ? 1420 : 640,
      flowDurationMs: isMalicious ? 35 : 420,
      synFlagRatio: scenario.id.includes('syn') ? 0.98 : 0.12,
      anomalyScore: isMalicious ? Math.min(0.99, anomalyScore + (i * 0.005)) : 0.04,
      isAnomaly: isMalicious,
      privacyProtected: true,
      nodeId: scenario.targetNodeId
    }));
    setSimulationPackets(newPackets);

    // Update target node stats
    setNodes(prev => prev.map(n => {
      if (n.id === scenario.targetNodeId) {
        return {
          ...n,
          cpuUsage: Math.min(96, n.cpuUsage + (isMalicious ? 28 : 5)),
          localAnomalyScore: isMalicious ? 0.92 : 0.04,
          activeThreatCount: isMalicious ? n.activeThreatCount + 1 : n.activeThreatCount
        };
      }
      return n;
    }));

    // Step 2: Local PPAI Anomaly Detection (600ms)
    setSimulationStep(2);
    await new Promise(r => setTimeout(r, 600));

    // Step 3: DP Noise & zk-SNARK Groth16 Proof (600ms)
    setSimulationStep(3);
    const noise = sampleGaussianNoise(1.0, 0.8);
    const zkProof = generateZkProof(scenario.id, scenario.payloadSignature, 0.8);
    await new Promise(r => setTimeout(r, 600));

    // Step 4: Consortium PBFT Consensus & Block Mining (600ms)
    setSimulationStep(4);
    const newTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newBlockHeight = (blocks[0]?.blockHeight ?? 1042) + 1;

    const alertTx: BlockchainTransaction = {
      txHash: newTxHash,
      timestamp: Date.now(),
      type: isMalicious ? 'TX_INTRUSION_ALERT' : 'TX_MODEL_UPDATE',
      senderNodeId: scenario.targetNodeId,
      senderAddress: '0x71C...a829',
      payloadSummary: isMalicious
        ? `Cryptographic proof of ${scenario.name} [${scenario.mitreTechnique}] confirmed without plaintext exposure.`
        : 'Benign baseline operational telemetry validated.',
      threatType: scenario.id,
      mitreTactic: scenario.mitreTechnique.split('-')[0].trim(),
      zkProofHash: zkProof.publicInputs[0],
      zkProofVerified: true,
      privacyParameters: {
        epsilonDP: 0.8,
        deltaDP: 1e-5,
        clippingNorm: 2.0,
        noiseScale: 0.65 + Math.abs(noise * 0.1)
      },
      smartContract: isMalicious ? 'IntrusionRegistry' : 'FederatedConsensus',
      defenseRuleApplied: isMalicious ? `eBPF Filter: DROP signature=${scenario.payloadSignature}` : undefined
    };

    const newBlock: LedgerBlock = {
      blockHeight: newBlockHeight,
      blockHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      previousHash: blocks[0]?.blockHash ?? '0x00000000',
      timestamp: Date.now(),
      validatorNodeId: 'node-core-us-east',
      merkleRoot: computeMerkleRoot([alertTx.txHash]),
      transactionsCount: 1,
      transactions: [alertTx],
      gasUsed: 112400,
      zkSnarkProofRoot: zkProof.publicInputs[1]
    };

    setBlocks(prev => [newBlock, ...prev]);

    // Persist to Google Cloud Firestore if user is authenticated
    if (isMalicious && currentUser) {
      try {
        await setDoc(doc(db, 'threats', `threat-${newBlockHeight}`), {
          id: `threat-${newBlockHeight}`,
          threatType: scenario.id,
          mitreTactic: scenario.mitreTechnique.split('-')[0].trim(),
          severity: scenario.severity,
          nodeId: scenario.targetNodeId,
          zkProofHash: zkProof.publicInputs[0],
          txHash: newTxHash,
          timestamp: Date.now(),
          reporterUid: currentUser.uid
        });
      } catch (err) {
        console.warn('Could not persist threat to Firestore:', err);
      }
    }

    // Record intrusion event in the blockchain audit trail
    if (isMalicious) {
      const newAuditRecord: AuditTrailRecord = {
        id: `AUDIT-LOG-${newBlockHeight}-01`,
        blockHeight: newBlockHeight,
        txHash: newTxHash,
        timestamp: Date.now(),
        category: 'detected_intrusion',
        action: 'INTRUSION_ZK_PROOF_RECORDED',
        actor: scenario.targetNodeId,
        summary: `Detected ${scenario.name} (${scenario.mitreTechnique}). Paillier HE & zk-SNARK Groth16 verified without raw payload exposure.`,
        metadata: {
          mitreTechnique: scenario.mitreTechnique,
          threatSeverity: scenario.severity,
          targetResource: scenario.targetTier
        },
        previousRecordHash: auditRecords[0]?.recordHash || '0x0000000000000000000000000000000000000000000000000000000000000000',
        recordHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        validatorSignature: '0x9c41' + Array.from({ length: 60 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        isTampered: false
      };
      setAuditRecords(prev => [newAuditRecord, ...prev]);
    }

    // Step 5: Global Ubiquitous Cloud Defense Enforcement (500ms)
    setSimulationStep(5);
    await new Promise(r => setTimeout(r, 500));

    if (isMalicious) {
      const newRule: MitigationRule = {
        id: `RULE-SEC-${402 + mitigationRules.length}`,
        blockHeight: newBlockHeight,
        timestamp: Date.now(),
        ruleType: scenario.id.includes('model') ? 'MODEL_FILTER' : 'IP_BLOCK_EBPF',
        targetPattern: `DROP payload_sig=${scenario.payloadSignature} at Edge Ingress`,
        severity: scenario.severity === 'Critical' ? 'Critical' : 'High',
        enforcedNodesCount: 6,
        status: 'Active',
        originTxHash: newTxHash
      };
      setMitigationRules(prev => [newRule, ...prev]);
      setLatestMitigationMessage(
        `Immutable Rule ${newRule.id} synchronized across all 6 AWS, GCP, Azure & Edge nodes in 84ms via smart contract.`
      );
    } else {
      setLatestMitigationMessage(
        'Traffic verified as benign baseline. Zero false-positive mitigation rules created.'
      );
    }

    setIsSimulating(false);
  };

  // Collaborative Training Round Handler
  const handleExecuteCollaborativeRound = ({
    epochs,
    batchSize,
    injectByzantine
  }: {
    epochs: number;
    batchSize: number;
    injectByzantine: boolean;
  }) => {
    setIsProcessingRound(true);

    const nextRoundNum = (rounds[0]?.roundNumber ?? 18) + 1;
    const baseAcc = 98.42 + (epochs * 0.08) - (injectByzantine ? 0.15 : 0);
    const newAccuracy = Number(Math.min(99.65, Math.max(94.0, baseAcc)).toFixed(2));
    const newVersion = `v2.4.${nextRoundNum - 16}-PPAI`;

    const rejectedNodes = injectByzantine ? ['node-iot-gateway-delta'] : [];

    const newRound: FederatedModelRound = {
      roundNumber: nextRoundNum,
      globalVersion: newVersion,
      timestamp: Date.now(),
      participatingNodes: nodes.filter(n => n.status === 'healthy' && !rejectedNodes.includes(n.id)).map(n => n.id),
      globalAccuracy: newAccuracy,
      falsePositiveRate: Number((0.21 - (epochs * 0.005)).toFixed(2)),
      f1Score: Number((newAccuracy / 100 * 0.998).toFixed(3)),
      noiseMultiplier: 1.15,
      epsilonRound: 0.8,
      cumulativeEpsilon: Number(((rounds[0]?.cumulativeEpsilon ?? 3.4) + 0.8).toFixed(2)),
      byzantineRejectedNodes: rejectedNodes,
      aggregationStatus: 'Aggregated'
    };

    setRounds(prev => [newRound, ...prev]);

    // Update node profiles
    setNodeProfiles(prev => prev.map(p => {
      const isSuspect = injectByzantine && p.nodeId === 'node-iot-gateway-delta';
      return {
        ...p,
        localEpochs: epochs,
        localBatchSize: batchSize,
        localAccuracy: isSuspect ? 84.2 : Number(Math.min(99.4, p.localAccuracy + 0.25).toFixed(2)),
        localLoss: isSuspect ? 0.241 : Number(Math.max(0.02, p.localLoss - 0.004).toFixed(3)),
        uploadStatus: isSuspect ? 'Rejected (Byzantine)' : 'Aggregated'
      };
    }));

    // Record on-chain block
    const updateTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newBlockHeight = (blocks[0]?.blockHeight ?? 1042) + 1;

    const updateTx: BlockchainTransaction = {
      txHash: updateTxHash,
      timestamp: Date.now(),
      type: 'TX_MODEL_UPDATE',
      senderNodeId: 'node-core-us-east',
      senderAddress: '0x12A...f902',
      payloadSummary: `Collaborative FL Round #${nextRoundNum} aggregated with Paillier HE. Byzantine Rejected: ${rejectedNodes.length}`,
      zkProofHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      zkProofVerified: true,
      privacyParameters: {
        epsilonDP: 0.8,
        deltaDP: 1e-5,
        clippingNorm: 2.0,
        noiseScale: 0.72
      },
      smartContract: 'FederatedConsensus'
    };

    const newBlock: LedgerBlock = {
      blockHeight: newBlockHeight,
      blockHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      previousHash: blocks[0]?.blockHash ?? '0x00000000',
      timestamp: Date.now(),
      validatorNodeId: 'node-core-us-east',
      merkleRoot: computeMerkleRoot([updateTx.txHash]),
      transactionsCount: 1,
      transactions: [updateTx],
      gasUsed: 94200,
      zkSnarkProofRoot: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };

    setBlocks(prev => [newBlock, ...prev]);

    // Record training event in Audit Trail
    const newAuditRecord: AuditTrailRecord = {
      id: `AUDIT-LOG-${newBlockHeight}-01`,
      blockHeight: newBlockHeight,
      txHash: updateTxHash,
      timestamp: Date.now(),
      category: 'model_training',
      action: 'FEDERATED_UPDATE_COMMIT',
      actor: 'Consortium Model Aggregator',
      summary: `Collaborative round #${nextRoundNum} committed. 6 nodes shared encrypted gradients (Paillier HE). Byzantine rejected: ${rejectedNodes.length > 0 ? rejectedNodes.join(', ') : 'None'}. Global Accuracy: ${newAccuracy}%.`,
      metadata: {
        flRound: nextRoundNum,
        modelAccuracy: newAccuracy,
        epsilonBudgetSpent: 0.8
      },
      previousRecordHash: auditRecords[0]?.recordHash || '0x0000000000000000000000000000000000000000000000000000000000000000',
      recordHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      validatorSignature: '0x7b19' + Array.from({ length: 60 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      isTampered: false
    };

    setAuditRecords(prev => [newAuditRecord, ...prev]);
    setIsProcessingRound(false);
  };

  // Tampering simulation handlers for Audit Trail
  const handleSimulateTamper = (recordId: string) => {
    setAuditRecords(prev => prev.map(r => {
      if (r.id === recordId) {
        return {
          ...r,
          summary: 'MALICIOUS ALTERATION: Attacker tried to erase recorded SQL injection incident!',
          isTampered: true
        };
      }
      return r;
    }));
  };

  const handleRestoreTamper = () => {
    setAuditRecords(prev => prev.map(r => ({ ...r, isTampered: false })));
  };

  // Toggle quarantine for a node
  const handleToggleQuarantine = (nodeId: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        const nextStatus = n.status === 'quarantined' ? 'healthy' : 'quarantined';
        return { ...n, status: nextStatus };
      }
      return n;
    }));

    const qTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const qBlockHeight = (blocks[0]?.blockHeight ?? 1042) + 1;
    const qRecord: AuditTrailRecord = {
      id: `AUDIT-LOG-${qBlockHeight}-01`,
      blockHeight: qBlockHeight,
      txHash: qTxHash,
      timestamp: Date.now(),
      category: 'access_control',
      action: 'NODE_QUARANTINE_CONSENSUS',
      actor: 'node-core-us-east',
      summary: `Consensus quorum quarantined node ${nodeId} to isolate compromised perimeter.`,
      metadata: {
        targetResource: nodeId,
        threatSeverity: 'High'
      },
      previousRecordHash: auditRecords[0]?.recordHash || '0x0000000000000000000000000000000000000000000000000000000000000000',
      recordHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      validatorSignature: '0x44a1' + Array.from({ length: 60 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      isTampered: false
    };
    setAuditRecords(prev => [qRecord, ...prev]);
  };

  const handleResetPrivacyBudget = (nodeId: string) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, privacyBudgetConsumed: 0.0 } : n));
  };

  const handleQuickSimulate = () => {
    setActiveTab('simulator');
    handleExecuteSimulation(ATTACK_SCENARIOS[0]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickSimulate={handleQuickSimulate}
        isSimulating={isSimulating}
        currentUser={currentUser}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        isFirestoreConnected={isFirestoreConnected}
      />

      <main className="flex-1 pb-12">
        {activeTab === 'overview' && (
          <OverviewView
            nodes={nodes}
            blocks={blocks}
            mitigationRules={mitigationRules}
            attackScenarios={ATTACK_SCENARIOS}
            onSelectTransaction={setSelectedTransaction}
            onNavigateTab={(tab) => {
              setActiveTab(tab as ActiveTab);
            }}
            onRunAttack={(scenario) => {
              setActiveTab('simulator');
              handleExecuteSimulation(scenario);
            }}
          />
        )}

        {activeTab === 'models' && (
          <HuggingFaceModelsView
            importedModels={importedModels}
            onImportModel={handleImportHfModel}
            onDeployModelToEdge={handleDeployHfModelToEdge}
            isDeploying={isDeployingModel}
            userEmail={currentUser?.email || null}
          />
        )}

        {activeTab === 'federated' && (
          <FederatedLearningModule
            nodes={nodes}
            nodeProfiles={nodeProfiles}
            rounds={rounds}
            onExecuteCollaborativeRound={handleExecuteCollaborativeRound}
            isTraining={isProcessingRound}
          />
        )}

        {activeTab === 'homomorphic' && (
          <HomomorphicEncryptionView />
        )}

        {activeTab === 'audit' && (
          <AuditTrailView
            records={auditRecords}
            onSimulateTamper={handleSimulateTamper}
            onRestoreTamper={handleRestoreTamper}
          />
        )}

        {activeTab === 'topology' && (
          <TopologyView
            nodes={nodes}
            onToggleQuarantine={handleToggleQuarantine}
            onResetPrivacyBudget={handleResetPrivacyBudget}
          />
        )}

        {activeTab === 'ledger' && (
          <BlockchainLedgerView
            blocks={blocks}
            onSelectTransaction={setSelectedTransaction}
          />
        )}

        {activeTab === 'simulator' && (
          <AttackSimulatorView
            scenarios={ATTACK_SCENARIOS}
            activeSimulationScenario={activeSimulationScenario}
            onExecuteSimulation={handleExecuteSimulation}
            isSimulating={isSimulating}
            simulationStep={simulationStep}
            simulationPackets={simulationPackets}
            latestMitigationMessage={latestMitigationMessage}
          />
        )}
      </main>

      {/* Transaction & Proof Details Modal */}
      <ThreatDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">AegisCloud Framework</span>
            <span>·</span>
            <span>Google Cloud Firestore Connected</span>
            <span>·</span>
            <span>Hugging Face Model Hub</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Paillier HE / CKKS</span>
            <span>·</span>
            <span>Immutable Audit Trail</span>
            <span>·</span>
            <span>Federated Learning Non-IID</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
