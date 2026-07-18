import {Composition, Series} from 'remotion';
import {ExactAnchor, InlineCitations, ProfitBridge, SourceLadder, SplitThreshold} from './solution2';
import {AddLinkedCase, Counterevidence, CoverageMatrix, LabPipeline, PrecisionControls} from './auditTestLab';
import {BenchmarkScore, ConsensusMatrix, DecoyPrecision, FourDetectors, SourcedVerdict} from './benchmarkStudio';

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
  <Composition id="Cited-Memo-Reel" component={CitedMemoReel} {...VIDEO} durationInFrames={SCENE*5}/>
  <Composition id="Audit-Test-Lab-Reel" component={AuditTestLabReel} {...VIDEO} durationInFrames={SCENE*5}/>
  <Composition id="Benchmark-Studio-Reel" component={BenchmarkStudioReel} {...VIDEO} durationInFrames={SCENE*5}/>
</>;
