import {Composition, Series} from 'remotion';
import {ExactAnchor, InlineCitations, ProfitBridge, SourceLadder, SplitThreshold} from './solution2';
import {AddLinkedCase, Counterevidence, CoverageMatrix, LabPipeline, PrecisionControls} from './auditTestLab';
import {BenchmarkScore, ConsensusMatrix, DecoyPrecision, FourDetectors, SourcedVerdict} from './benchmarkStudio';
import {
  ConfusionGrid,
  CountercheckBalance,
  CutoffTimeline,
  DetectorRadar,
  EditorialRedline,
  EvidenceConstellation,
  EvidenceFunnel,
  MethodRace,
  ProofCollage,
  RepairStack,
  RuleCardDeck,
  TerminalTestRun,
} from './experiments';
import {
  GraphCutoffJoin,
  GraphMissingEdge,
  GraphPaymentChain,
  MemoryPipeline,
  MemoryProvenanceRepair,
  MemoryRecallGraph,
  PublicAuthorityRouter,
  PublicReplayLedger,
  PublicSourceBoundary,
  ReviewerApprovalGate,
  ReviewerPatchDiff,
  ReviewerReadOnlyRun,
  RouterFindingRoutes,
  RouterStopRule,
  RouterTransitMap,
  SkepticBalanceSheet,
  SkepticCrossExamination,
  SkepticVerdictStamp,
} from './latestSolutions';
import {
  CitationZine,
  ControlPinball,
  DecisionMaze,
  DetectorPrism,
  EscalationElevator,
  EvidenceConveyor,
  HumanLoopStoryboard,
  LedgerSubway,
  MemorySolarSystem,
  NegativeSpaceGraph,
  PatchTypewriter,
  ProvenanceDNA,
  RedThreadBoard,
  RegistryPassport,
  SignalMixingBoard,
  SplitScreenDebate,
  TestOscilloscope,
  TrustTopography,
} from './creativeWave';
import {
  SilentAuthorityAltitude,
  SilentCitationFocus,
  SilentCitationMagnet,
  SilentClaimCounterclaim,
  SilentConfidenceStop,
  SilentConsensusBloom,
  SilentCounterweight,
  SilentEvidenceBoundary,
  SilentGraphPulse,
  SilentHumanGate,
  SilentMemoryOrbit,
  SilentMissingShadow,
  SilentPatchChoice,
  SilentPrecisionSieve,
  SilentProvenanceThread,
  SilentRouterBranches,
  SilentRuleLocks,
  SilentSpectrumMerge,
} from './silentWave';

const FPS = 30;
const SCENE = 240;
const VIDEO = {fps: FPS, width: 1920, height: 1080, durationInFrames: SCENE};

const CitedMemoReel = () => <Series>
  <Series.Sequence durationInFrames={SCENE}><InlineCitations/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><SourceLadder/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><ExactAnchor/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><ProfitBridge/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><SplitThreshold/></Series.Sequence>
</Series>;

const AuditTestLabReel = () => <Series>
  <Series.Sequence durationInFrames={SCENE}><LabPipeline/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><CoverageMatrix/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><Counterevidence/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><AddLinkedCase/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><PrecisionControls/></Series.Sequence>
</Series>;

const BenchmarkStudioReel = () => <Series>
  <Series.Sequence durationInFrames={SCENE}><FourDetectors/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><ConsensusMatrix/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><BenchmarkScore/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><DecoyPrecision/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><SourcedVerdict/></Series.Sequence>
</Series>;

const CitedMemoAlternativesReel = () => <Series>
  <Series.Sequence durationInFrames={SCENE}><EditorialRedline/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><EvidenceConstellation/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><CutoffTimeline/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><RepairStack/></Series.Sequence>
</Series>;

const AuditTestLabAlternativesReel = () => <Series>
  <Series.Sequence durationInFrames={SCENE}><TerminalTestRun/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><EvidenceFunnel/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><RuleCardDeck/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><CountercheckBalance/></Series.Sequence>
</Series>;

const BenchmarkStudioAlternativesReel = () => <Series>
  <Series.Sequence durationInFrames={SCENE}><DetectorRadar/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><ConfusionGrid/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><MethodRace/></Series.Sequence>
  <Series.Sequence durationInFrames={SCENE}><ProofCollage/></Series.Sequence>
</Series>;

const EvidenceGraphReel = () => <Series><Series.Sequence durationInFrames={SCENE}><GraphPaymentChain/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><GraphMissingEdge/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><GraphCutoffJoin/></Series.Sequence></Series>;
const DetectorSkepticReel = () => <Series><Series.Sequence durationInFrames={SCENE}><SkepticCrossExamination/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><SkepticBalanceSheet/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><SkepticVerdictStamp/></Series.Sequence></Series>;
const PublicChecksReel = () => <Series><Series.Sequence durationInFrames={SCENE}><PublicAuthorityRouter/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><PublicSourceBoundary/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><PublicReplayLedger/></Series.Sequence></Series>;
const EvidenceMemoryReel = () => <Series><Series.Sequence durationInFrames={SCENE}><MemoryPipeline/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><MemoryRecallGraph/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><MemoryProvenanceRepair/></Series.Sequence></Series>;
const LocalReviewerReel = () => <Series><Series.Sequence durationInFrames={SCENE}><ReviewerReadOnlyRun/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><ReviewerPatchDiff/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><ReviewerApprovalGate/></Series.Sequence></Series>;
const AdaptiveRouterReel = () => <Series><Series.Sequence durationInFrames={SCENE}><RouterTransitMap/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><RouterStopRule/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><RouterFindingRoutes/></Series.Sequence></Series>;
const CreativeEvidenceReel = () => <Series><Series.Sequence durationInFrames={SCENE}><CitationZine/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><EvidenceConveyor/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><TestOscilloscope/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><ControlPinball/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><LedgerSubway/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><NegativeSpaceGraph/></Series.Sequence></Series>;
const CreativeChallengeReel = () => <Series><Series.Sequence durationInFrames={SCENE}><SplitScreenDebate/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><RedThreadBoard/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><DetectorPrism/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><SignalMixingBoard/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><RegistryPassport/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><TrustTopography/></Series.Sequence></Series>;
const CreativeIntelligenceReel = () => <Series><Series.Sequence durationInFrames={SCENE}><MemorySolarSystem/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><ProvenanceDNA/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><HumanLoopStoryboard/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><PatchTypewriter/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><EscalationElevator/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><DecisionMaze/></Series.Sequence></Series>;
const SilentEvidenceReel = () => <Series><Series.Sequence durationInFrames={SCENE}><SilentCitationMagnet/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><SilentCitationFocus/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><SilentRuleLocks/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><SilentPrecisionSieve/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><SilentGraphPulse/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><SilentMissingShadow/></Series.Sequence></Series>;
const SilentChallengeReel = () => <Series><Series.Sequence durationInFrames={SCENE}><SilentClaimCounterclaim/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><SilentCounterweight/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><SilentSpectrumMerge/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><SilentConsensusBloom/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><SilentAuthorityAltitude/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><SilentEvidenceBoundary/></Series.Sequence></Series>;
const SilentControlReel = () => <Series><Series.Sequence durationInFrames={SCENE}><SilentMemoryOrbit/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><SilentProvenanceThread/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><SilentHumanGate/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><SilentPatchChoice/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><SilentRouterBranches/></Series.Sequence><Series.Sequence durationInFrames={SCENE}><SilentConfidenceStop/></Series.Sequence></Series>;

export const Root = () => <>
  <Composition id="Cited-Memo-Inline-Citations" component={InlineCitations} {...VIDEO}/>
  <Composition id="Cited-Memo-Source-Ladder" component={SourceLadder} {...VIDEO}/>
  <Composition id="Cited-Memo-Exact-Anchor" component={ExactAnchor} {...VIDEO}/>
  <Composition id="Cited-Memo-Profit-Bridge" component={ProfitBridge} {...VIDEO}/>
  <Composition id="Cited-Memo-Split-Threshold" component={SplitThreshold} {...VIDEO}/>
  <Composition id="Audit-Test-Lab-Pipeline" component={LabPipeline} {...VIDEO}/>
  <Composition id="Audit-Test-Lab-Coverage-Matrix" component={CoverageMatrix} {...VIDEO}/>
  <Composition id="Audit-Test-Lab-Counterevidence" component={Counterevidence} {...VIDEO}/>
  <Composition id="Audit-Test-Lab-Add-Linked-Case" component={AddLinkedCase} {...VIDEO}/>
  <Composition id="Audit-Test-Lab-Precision-Controls" component={PrecisionControls} {...VIDEO}/>
  <Composition id="Benchmark-Studio-Four-Detectors" component={FourDetectors} {...VIDEO}/>
  <Composition id="Benchmark-Studio-Consensus-Matrix" component={ConsensusMatrix} {...VIDEO}/>
  <Composition id="Benchmark-Studio-Score" component={BenchmarkScore} {...VIDEO}/>
  <Composition id="Benchmark-Studio-Decoy-Precision" component={DecoyPrecision} {...VIDEO}/>
  <Composition id="Benchmark-Studio-Sourced-Verdict" component={SourcedVerdict} {...VIDEO}/>
  <Composition id="Alt-Cited-Editorial-Redline" component={EditorialRedline} {...VIDEO}/>
  <Composition id="Alt-Cited-Evidence-Constellation" component={EvidenceConstellation} {...VIDEO}/>
  <Composition id="Alt-Cited-Cutoff-Timeline" component={CutoffTimeline} {...VIDEO}/>
  <Composition id="Alt-Cited-Repair-Stack" component={RepairStack} {...VIDEO}/>
  <Composition id="Alt-Lab-Forensic-Terminal" component={TerminalTestRun} {...VIDEO}/>
  <Composition id="Alt-Lab-Evidence-Funnel" component={EvidenceFunnel} {...VIDEO}/>
  <Composition id="Alt-Lab-Rule-Card-Deck" component={RuleCardDeck} {...VIDEO}/>
  <Composition id="Alt-Lab-Countercheck-Balance" component={CountercheckBalance} {...VIDEO}/>
  <Composition id="Alt-Benchmark-Detector-Radar" component={DetectorRadar} {...VIDEO}/>
  <Composition id="Alt-Benchmark-Confusion-Grid" component={ConfusionGrid} {...VIDEO}/>
  <Composition id="Alt-Benchmark-Method-Race" component={MethodRace} {...VIDEO}/>
  <Composition id="Alt-Benchmark-Proof-Collage" component={ProofCollage} {...VIDEO}/>
  <Composition id="Evidence-Graph-Payment-Chain" component={GraphPaymentChain} {...VIDEO}/>
  <Composition id="Evidence-Graph-Missing-Edge" component={GraphMissingEdge} {...VIDEO}/>
  <Composition id="Evidence-Graph-Cutoff-Join" component={GraphCutoffJoin} {...VIDEO}/>
  <Composition id="Detector-Skeptic-Cross-Examination" component={SkepticCrossExamination} {...VIDEO}/>
  <Composition id="Detector-Skeptic-Balance" component={SkepticBalanceSheet} {...VIDEO}/>
  <Composition id="Detector-Skeptic-Verdict-Stamp" component={SkepticVerdictStamp} {...VIDEO}/>
  <Composition id="Public-Checks-Authority-Router" component={PublicAuthorityRouter} {...VIDEO}/>
  <Composition id="Public-Checks-Evidence-Boundary" component={PublicSourceBoundary} {...VIDEO}/>
  <Composition id="Public-Checks-Replay-Provenance" component={PublicReplayLedger} {...VIDEO}/>
  <Composition id="Evidence-Memory-Pipeline" component={MemoryPipeline} {...VIDEO}/>
  <Composition id="Evidence-Memory-Recall-Graph" component={MemoryRecallGraph} {...VIDEO}/>
  <Composition id="Evidence-Memory-Provenance-Repair" component={MemoryProvenanceRepair} {...VIDEO}/>
  <Composition id="Local-Reviewer-Read-Only-Run" component={ReviewerReadOnlyRun} {...VIDEO}/>
  <Composition id="Local-Reviewer-Patch-Diff" component={ReviewerPatchDiff} {...VIDEO}/>
  <Composition id="Local-Reviewer-Approval-Gate" component={ReviewerApprovalGate} {...VIDEO}/>
  <Composition id="Adaptive-Router-Transit-Map" component={RouterTransitMap} {...VIDEO}/>
  <Composition id="Adaptive-Router-Stop-Rule" component={RouterStopRule} {...VIDEO}/>
  <Composition id="Adaptive-Router-Route-Matrix" component={RouterFindingRoutes} {...VIDEO}/>
  <Composition id="Creative-Cited-Citation-Zine" component={CitationZine} {...VIDEO}/>
  <Composition id="Creative-Cited-Evidence-Conveyor" component={EvidenceConveyor} {...VIDEO}/>
  <Composition id="Creative-Test-Oscilloscope" component={TestOscilloscope} {...VIDEO}/>
  <Composition id="Creative-Test-Control-Pinball" component={ControlPinball} {...VIDEO}/>
  <Composition id="Creative-Graph-Ledger-Subway" component={LedgerSubway} {...VIDEO}/>
  <Composition id="Creative-Graph-Negative-Space" component={NegativeSpaceGraph} {...VIDEO}/>
  <Composition id="Creative-Skeptic-Split-Screen" component={SplitScreenDebate} {...VIDEO}/>
  <Composition id="Creative-Skeptic-Red-Thread" component={RedThreadBoard} {...VIDEO}/>
  <Composition id="Creative-Ensemble-Detector-Prism" component={DetectorPrism} {...VIDEO}/>
  <Composition id="Creative-Ensemble-Mixing-Board" component={SignalMixingBoard} {...VIDEO}/>
  <Composition id="Creative-Public-Registry-Passport" component={RegistryPassport} {...VIDEO}/>
  <Composition id="Creative-Public-Trust-Topography" component={TrustTopography} {...VIDEO}/>
  <Composition id="Creative-Memory-Solar-System" component={MemorySolarSystem} {...VIDEO}/>
  <Composition id="Creative-Memory-Provenance-DNA" component={ProvenanceDNA} {...VIDEO}/>
  <Composition id="Creative-Reviewer-Storyboard" component={HumanLoopStoryboard} {...VIDEO}/>
  <Composition id="Creative-Reviewer-Patch-Typewriter" component={PatchTypewriter} {...VIDEO}/>
  <Composition id="Creative-Router-Escalation-Elevator" component={EscalationElevator} {...VIDEO}/>
  <Composition id="Creative-Router-Decision-Maze" component={DecisionMaze} {...VIDEO}/>
  <Composition id="Silent-Cited-Citation-Magnet" component={SilentCitationMagnet} {...VIDEO}/>
  <Composition id="Silent-Cited-Citation-Focus" component={SilentCitationFocus} {...VIDEO}/>
  <Composition id="Silent-Tests-Rule-Locks" component={SilentRuleLocks} {...VIDEO}/>
  <Composition id="Silent-Tests-Precision-Sieve" component={SilentPrecisionSieve} {...VIDEO}/>
  <Composition id="Silent-Graph-Pulse" component={SilentGraphPulse} {...VIDEO}/>
  <Composition id="Silent-Graph-Missing-Shadow" component={SilentMissingShadow} {...VIDEO}/>
  <Composition id="Silent-Skeptic-Claim-Counterclaim" component={SilentClaimCounterclaim} {...VIDEO}/>
  <Composition id="Silent-Skeptic-Counterweight" component={SilentCounterweight} {...VIDEO}/>
  <Composition id="Silent-Ensemble-Spectrum-Merge" component={SilentSpectrumMerge} {...VIDEO}/>
  <Composition id="Silent-Ensemble-Consensus-Bloom" component={SilentConsensusBloom} {...VIDEO}/>
  <Composition id="Silent-Public-Authority-Altitude" component={SilentAuthorityAltitude} {...VIDEO}/>
  <Composition id="Silent-Public-Evidence-Boundary" component={SilentEvidenceBoundary} {...VIDEO}/>
  <Composition id="Silent-Memory-Orbit" component={SilentMemoryOrbit} {...VIDEO}/>
  <Composition id="Silent-Memory-Provenance-Thread" component={SilentProvenanceThread} {...VIDEO}/>
  <Composition id="Silent-Reviewer-Human-Gate" component={SilentHumanGate} {...VIDEO}/>
  <Composition id="Silent-Reviewer-Patch-Choice" component={SilentPatchChoice} {...VIDEO}/>
  <Composition id="Silent-Router-Branches" component={SilentRouterBranches} {...VIDEO}/>
  <Composition id="Silent-Router-Confidence-Stop" component={SilentConfidenceStop} {...VIDEO}/>
  <Composition id="Cited-Memo-Reel" component={CitedMemoReel} {...VIDEO} durationInFrames={SCENE*5}/>
  <Composition id="Audit-Test-Lab-Reel" component={AuditTestLabReel} {...VIDEO} durationInFrames={SCENE*5}/>
  <Composition id="Benchmark-Studio-Reel" component={BenchmarkStudioReel} {...VIDEO} durationInFrames={SCENE*5}/>
  <Composition id="Cited-Memo-Alternatives-Reel" component={CitedMemoAlternativesReel} {...VIDEO} durationInFrames={SCENE*4}/>
  <Composition id="Audit-Test-Lab-Alternatives-Reel" component={AuditTestLabAlternativesReel} {...VIDEO} durationInFrames={SCENE*4}/>
  <Composition id="Benchmark-Studio-Alternatives-Reel" component={BenchmarkStudioAlternativesReel} {...VIDEO} durationInFrames={SCENE*4}/>
  <Composition id="Evidence-Graph-Reel" component={EvidenceGraphReel} {...VIDEO} durationInFrames={SCENE*3}/>
  <Composition id="Detector-Skeptic-Reel" component={DetectorSkepticReel} {...VIDEO} durationInFrames={SCENE*3}/>
  <Composition id="Public-Checks-Reel" component={PublicChecksReel} {...VIDEO} durationInFrames={SCENE*3}/>
  <Composition id="Evidence-Memory-Reel" component={EvidenceMemoryReel} {...VIDEO} durationInFrames={SCENE*3}/>
  <Composition id="Local-Reviewer-Reel" component={LocalReviewerReel} {...VIDEO} durationInFrames={SCENE*3}/>
  <Composition id="Adaptive-Router-Reel" component={AdaptiveRouterReel} {...VIDEO} durationInFrames={SCENE*3}/>
  <Composition id="Creative-Evidence-Anthology" component={CreativeEvidenceReel} {...VIDEO} durationInFrames={SCENE*6}/>
  <Composition id="Creative-Challenge-Anthology" component={CreativeChallengeReel} {...VIDEO} durationInFrames={SCENE*6}/>
  <Composition id="Creative-Intelligence-Anthology" component={CreativeIntelligenceReel} {...VIDEO} durationInFrames={SCENE*6}/>
  <Composition id="Silent-Evidence-Anthology" component={SilentEvidenceReel} {...VIDEO} durationInFrames={SCENE*6}/>
  <Composition id="Silent-Challenge-Anthology" component={SilentChallengeReel} {...VIDEO} durationInFrames={SCENE*6}/>
  <Composition id="Silent-Control-Anthology" component={SilentControlReel} {...VIDEO} durationInFrames={SCENE*6}/>
</>;
