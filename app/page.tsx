'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  AudioLines,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  CloudCog,
  FileAudio,
  LoaderCircle,
  Radio,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
  Waves,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { linesForApproval } from '@/lib/demo-data';
import type { DemoStage } from '@/lib/domain';
import type { LiveCandidate } from '@/lib/live-analysis';
import { evaluateRelease } from '@/lib/release-policy';

type LiveProof = {
  run_id: string;
  model: string;
  runtime: string;
  candidates: LiveCandidate[];
  decision: { status: 'hold' | 'clear'; covered: number; total: number; unresolved_line_ids: string[] };
  usage?: { input_tokens?: number | null; output_tokens?: number | null; total_tokens?: number | null };
};

const lines = [
  { id: 'S12-L3', text: 'I never said I trusted him.', status: 'verified' },
  { id: 'S12-L5', text: 'You heard what you wanted.', status: 'verified' },
  { id: 'S12-L7', text: 'Because he followed you.', status: 'missing' },
  { id: 'S14-L2', text: 'Then we leave before dawn.', status: 'verified' },
  { id: 'S14-L9', text: 'No. We finish this here.', status: 'verified' },
];

const waveform = [20, 38, 56, 31, 68, 42, 78, 53, 88, 39, 64, 29, 72, 48, 82, 34, 58, 25, 46, 18];

export default function Home() {
  const [stage, setStage] = useState<DemoStage>('hold');
  const [selectedLineId, setSelectedLineId] = useState('S12-L7');
  const [liveStatus, setLiveStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [liveDetail, setLiveDetail] = useState('Optional cloud proof');
  const [liveProof, setLiveProof] = useState<LiveProof | null>(null);
  const releaseLines = useMemo(() => linesForApproval(stage === 'clear'), [stage]);
  const decision = useMemo(() => evaluateRelease(releaseLines), [releaseLines]);
  const selectedLine = releaseLines.find((line) => line.id === selectedLineId) ?? releaseLines[2];
  const isClear = decision.status === 'clear';
  const isProblemLine = selectedLine.id === 'S12-L7';

  function resetDemo() {
    setStage('hold');
    setSelectedLineId('S12-L7');
  }

  function advanceDemo() {
    setSelectedLineId('S12-L7');
    setStage((current) => current === 'hold' ? 'recording' : current === 'recording' ? 'review' : current === 'review' ? 'clear' : 'hold');
  }

  async function runLiveGemini() {
    setLiveStatus('running');
    setLiveProof(null);
    setLiveDetail('Gemini is reconciling the synthetic WAV');
    try {
      const audioResponse = await fetch('/demo-maya-wild-line.wav');
      if (!audioResponse.ok) throw new Error('Synthetic demo audio could not be loaded');
      const bytes = new Uint8Array(await audioResponse.arrayBuffer());
      let binary = '';
      for (const byte of bytes) binary += String.fromCharCode(byte);

      const response = await fetch('/api/live-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: { id: 'maya-chen', name: 'Maya Chen' },
          required_lines: [{ id: 'S12-L7', scene: '12', text: 'Because he followed you.' }],
          recordings: [{
            id: 'WL-MAYA-S12-L7-001',
            filename: 'demo-maya-wild-line.wav',
            notes: ['synthetic demonstration audio', 'wild line read 1'],
            audio_base64: btoa(binary),
            mime_type: 'audio/wav',
            human_approved: false,
          }],
        }),
      });
      const result = await response.json() as LiveProof & { detail?: string };
      if (!response.ok) throw new Error(result.detail ?? 'Live analysis failed');
      setLiveStatus('success');
      setLiveProof(result);
      setLiveDetail(`${result.runtime ?? 'Gemini API'} · ${result.candidates?.length ?? 0} candidate · ${result.run_id ?? 'run complete'}`);
    } catch (error) {
      setLiveStatus('error');
      setLiveDetail(error instanceof Error ? error.message : 'Live analysis failed safely');
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/80 bg-surface/90 px-4 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center border border-signal/40 bg-signal/10 text-signal">
              <AudioLines className="size-5" />
            </div>
            <div>
              <p className="font-display text-xl font-bold tracking-[0.12em]">LASTLINE</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Dialogue evidence agent</p>
            </div>
          </div>

          <div className="hidden items-center gap-5 text-xs text-muted-foreground md:flex">
            <span className="flex items-center gap-2"><Radio className="size-3.5 text-clear" /> Stage 04 · Day 12</span>
            <span className="h-4 w-px bg-border" />
            <span className={`flex max-w-[360px] items-center gap-2 ${liveStatus === 'success' ? 'text-clear' : liveStatus === 'error' ? 'text-hold' : ''}`} title={liveDetail}>
              {liveStatus === 'running' ? <LoaderCircle className="size-3.5 animate-spin text-signal" /> : <CircleDot className="size-3.5 text-signal" />}
              <span className="truncate">{liveStatus === 'idle' ? 'Seeded demo ready' : liveDetail}</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="hidden rounded-none border-signal/30 text-signal sm:inline-flex" onClick={runLiveGemini} disabled={liveStatus === 'running'}>
              {liveStatus === 'running' ? <LoaderCircle className="animate-spin" /> : <CloudCog />} Run live Gemini
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={resetDemo}><RotateCcw /> Reset</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-4 p-4 lg:grid-cols-[290px_minmax(0,1fr)_330px] lg:p-6">
        <aside className="panel min-w-0">
          <div className="border-b border-border p-4">
            <p className="eyebrow">Release request</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-full border border-border bg-muted text-muted-foreground"><UserRound className="size-5" /></div>
              <div className="min-w-0">
                <h1 className="truncate font-display text-xl font-semibold">Maya Chen</h1>
                <p className="text-xs text-muted-foreground">Last setup · requested 19:58</p>
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="font-mono text-2xl font-semibold tabular-nums">{decision.covered} / {decision.total}</p>
                <p className="text-xs text-muted-foreground">required lines covered</p>
              </div>
              <span className={`text-xs font-semibold ${isClear ? 'text-clear' : 'text-hold'}`}>{isClear ? 'coverage complete' : `${decision.unresolvedLineIds.length} unresolved`}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden bg-muted"><div className="h-full bg-clear transition-all duration-500" style={{ width: `${(decision.covered / decision.total) * 100}%` }} /></div>
          </div>

          <div className="p-2">
            <p className="eyebrow px-2 pb-2 pt-1">Dialogue coverage</p>
            <div className="space-y-1">
              {lines.map((line) => {
                const selected = line.id === selectedLineId;
                const verified = line.status === 'verified' || (line.id === 'S12-L7' && isClear);
                return (
                  <button key={line.id} type="button" aria-label={`Inspect ${line.id}: ${line.text}`} onClick={() => setSelectedLineId(line.id)} className={`w-full border p-3 text-left transition ${selected ? verified ? 'border-clear/40 bg-clear/8' : 'border-hold/45 bg-hold/8' : 'border-transparent hover:border-border hover:bg-muted/35'}`}>
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${verified ? 'bg-clear/12 text-clear' : 'bg-hold/12 text-hold'}`}>
                        {verified ? <Check className="size-3" /> : <AlertTriangle className="size-3" />}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{line.id}</span>
                          {selected && <ChevronRight className={`size-3.5 ${verified ? 'text-clear' : 'text-hold'}`} />}
                        </span>
                        <span className="mt-1 line-clamp-2 block text-xs leading-5 text-foreground/85">“{line.text}”</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="min-w-0 space-y-4">
          <div className={`border p-5 transition-colors duration-500 md:p-6 ${isClear ? 'border-clear/45 bg-clear/8 shadow-[inset_4px_0_0_var(--clear)]' : 'border-hold/45 bg-hold/8 shadow-[inset_4px_0_0_var(--hold)]'}`}>
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <div className={`flex items-center gap-2 ${isClear ? 'text-clear' : 'text-hold'}`}>{isClear ? <ShieldCheck className="size-5" /> : <AlertTriangle className="size-5" />}<p className={`eyebrow ${isClear ? '!text-clear' : '!text-hold'}`}>{isClear ? 'Release gate passed' : 'Actor release blocked'}</p></div>
                <h2 className={`mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl ${isClear ? 'text-clear' : 'text-hold'}`}>{isClear ? 'SAFE TO RELEASE' : 'HOLD FOR SOUND'}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{isClear ? 'Every required Maya line now has a human-approved production-audio path. Release authorization is logged.' : stage === 'recording' ? 'Wild-line capture is armed for the one unresolved obligation. Record three clean reads before rechecking.' : stage === 'review' ? 'The new wild line maps cleanly to Scene 12 / Line 7. Production sound must approve it before release.' : 'LastLine cannot prove a usable production-audio path for one required line. Keep Maya on set and capture the minimum pickup.'}</p>
              </div>

              <div className="grid shrink-0 grid-cols-2 gap-px border border-border bg-border text-center">
                <div className="bg-surface px-4 py-3"><p className="eyebrow">{isClear ? 'Pickup took' : 'Fix now'}</p><p className="mt-1 font-mono text-xl font-semibold text-clear">00:20</p></div>
                <div className="bg-surface px-4 py-3"><p className="eyebrow">{isClear ? 'Avoided' : 'After release'}</p><p className={`mt-1 font-mono text-xl font-semibold ${isClear ? 'text-clear' : 'text-hold'}`}>{isClear ? 'ADR' : 'ADR'}</p></div>
              </div>
            </div>
          </div>

          <div className="panel p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`rounded-none font-mono text-[10px] ${isClear || !isProblemLine ? 'border-clear/40 bg-clear/8 text-clear' : 'border-hold/40 bg-hold/8 text-hold'}`}>SCENE {selectedLine.scene} · LINE {selectedLine.id.split('-L')[1]}</Badge>
                  <Badge variant="outline" className="rounded-none font-mono text-[10px]">MAYA</Badge>
                </div>
                <blockquote className="mt-4 font-display text-2xl font-medium leading-tight md:text-3xl">“{selectedLine.text}”</blockquote>
              </div>
              <div className={`flex items-center gap-2 border px-3 py-2 text-xs font-semibold ${isClear || !isProblemLine ? 'border-clear/35 bg-clear/8 text-clear' : 'border-review/35 bg-review/8 text-review'}`}>{isClear || !isProblemLine ? <ShieldCheck className="size-4" /> : <Waves className="size-4" />} {isClear || !isProblemLine ? 'Approved audio path' : stage === 'recording' ? 'Recording wild reads' : stage === 'review' ? 'Approval required' : 'Sound check required'}</div>
            </div>

            {isProblemLine ? (
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {stage === 'review' || stage === 'clear' ? <EvidenceCard take="Wild · WL-001" confidence="98%" note="Complete read" issue={stage === 'clear' ? 'Approved by sound' : 'Awaiting approval'} active /> : null}
                <EvidenceCard take="A007 · Take 2" confidence="91%" note="Complete read" issue="Plane over final clause" active={stage === 'hold'} />
                <EvidenceCard take="A007 · Take 4" confidence="78%" note="Complete read" issue="Possible usable alt" />
                {stage === 'hold' || stage === 'recording' ? <EvidenceCard take="A007 · Take 7" confidence="43%" note="Partial read" issue="Line interrupted" /> : null}
              </div>
            ) : (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <EvidenceCard take={selectedLine.evidence[0]?.recordingId.replaceAll('-', ' · ') ?? 'Approved take'} confidence="96%" note="Complete read" issue="Approved by sound" active />
                <article className="border border-border bg-muted/15 p-4 text-xs leading-6 text-muted-foreground">Approval: Nora Patel · Production Sound<br />Source: Sound report A007<br />Policy status: verified</article>
              </div>
            )}

            <div className="mt-5 grid gap-4 border-t border-border pt-5 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center bg-hold/10 text-hold"><FileAudio className="size-5" /></div>
                <div><p className="text-sm font-semibold">{isClear ? 'Release authorization logged' : stage === 'recording' ? 'Capture in progress' : stage === 'review' ? 'New evidence mapped' : isProblemLine ? 'Minimum pickup' : 'Verified production audio'}</p><p className="text-xs leading-5 text-muted-foreground">{isClear ? 'Nora Patel · Production Sound · 20:18:20' : stage === 'recording' ? 'Read 3 of 3 · WL-MAYA-S12-L7-001' : stage === 'review' ? 'Wild line WL-001 · complete · no concern detected' : isProblemLine ? '1 line · 3 wild reads · estimated 20 seconds' : 'Human-approved path satisfies the release policy'}</p></div>
              </div>
              {isProblemLine ? <Button size="lg" onClick={isClear ? resetDemo : advanceDemo} className={`h-11 rounded-none px-5 font-semibold text-white ${isClear ? 'bg-clear text-background hover:bg-clear/85' : stage === 'review' ? 'bg-review text-background hover:bg-review/85' : 'bg-hold hover:bg-hold/85'}`}>{isClear ? <RotateCcw className="size-4" /> : stage === 'review' ? <ShieldCheck className="size-4" /> : <Radio className="size-4" />} {isClear ? 'Run demo again' : stage === 'recording' ? 'Finish reads & recheck' : stage === 'review' ? 'Approve WL-001 & release' : 'Capture wild line'}</Button> : <Button size="lg" variant="outline" className="h-11 rounded-none" onClick={() => setSelectedLineId('S12-L7')}>View unresolved line</Button>}
            </div>
          </div>
        </section>

        <aside className="panel min-w-0">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div><p className="eyebrow">Evidence trace</p><h2 className="mt-1 font-display text-lg font-semibold">Release gate run</h2></div>
            <Badge variant="outline" className="rounded-none border-signal/30 bg-signal/8 font-mono text-[10px] text-signal">RUN 8F2C</Badge>
          </div>

          <div className="p-4">
            <div className="space-y-0">
              <TraceStep title="Resolve script obligation" meta="5 Maya lines · script rev 12" label="DETERMINISTIC" state="done" />
              <TraceStep title="Index production audio" meta="18 takes · sound report A007" label="TOOL" state="done" />
              <TraceStep title="Align dialogue evidence" meta="12 candidate passages" label="GEMINI" state="done" />
              <TraceStep title="Triage acoustic concerns" meta={stage === 'hold' ? 'Plane event · 2 candidates' : 'Wild line · no concern detected'} label="GEMINI" state={stage === 'hold' ? 'review' : 'done'} />
              <TraceStep title="Apply release policy" meta={isClear ? '5 approved paths · release logged' : stage === 'review' ? 'Awaiting sound authorization' : stage === 'recording' ? 'Pickup capture in progress' : '1 line lacks approval'} label="POLICY" state={isClear ? 'done' : stage === 'review' ? 'review' : 'blocked'} last />
            </div>

            <div className="mt-5 border border-border bg-muted/25 p-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-clear" />
                <div><p className="text-xs font-semibold">Human authority preserved</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">Gemini proposes evidence. Release policy requires an approved audio path for every owed line.</p></div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border border-border px-3 py-2.5 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-2"><Sparkles className="size-3.5 text-signal" /> Seeded judge scenario</span><span className="font-mono">{isClear ? '20.0 s' : '1.4 s'}</span>
            </div>

            <div className={`mt-3 border p-3 ${liveStatus === 'success' ? 'border-signal/45 bg-signal/8' : liveStatus === 'error' ? 'border-hold/40 bg-hold/8' : 'border-border bg-muted/15'}`} aria-live="polite">
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow !text-signal">Live Gemini proof</p>
                <span className="font-mono text-[10px] text-muted-foreground">{liveProof?.model ?? 'audio-backed'}</span>
              </div>
              {liveProof ? (
                <div className="mt-2 space-y-2 text-[11px] leading-5">
                  <p className="text-foreground">“{liveProof.candidates[0]?.transcript ?? 'No candidate transcript'}”</p>
                  <div className="grid grid-cols-2 gap-2 border-t border-border/70 pt-2 text-muted-foreground">
                    <span>Candidate <strong className="text-foreground">{liveProof.candidates[0]?.recording_id ?? 'none'}</strong></span>
                    <span>Confidence <strong className="text-foreground">{liveProof.candidates[0] ? `${Math.round(liveProof.candidates[0].confidence * 100)}%` : '—'}</strong></span>
                    <span>Policy <strong className="uppercase text-hold">{liveProof.decision.status}</strong></span>
                    <span>Coverage <strong className="text-foreground">{liveProof.decision.covered}/{liveProof.decision.total}</strong></span>
                  </div>
                  <p className="font-mono text-[9px] text-muted-foreground">{liveProof.run_id} · {liveProof.usage?.total_tokens ?? '—'} tokens</p>
                </div>
              ) : (
                <p className={`mt-2 text-[11px] leading-5 ${liveStatus === 'error' ? 'text-hold' : 'text-muted-foreground'}`}>{liveDetail}</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function EvidenceCard({ take, confidence, note, issue, active = false }: { take: string; confidence: string; note: string; issue: string; active?: boolean }) {
  return (
    <article className={`border p-3 ${active ? 'border-review/45 bg-review/6' : 'border-border bg-muted/15'}`}>
      <div className="flex items-center justify-between gap-2"><p className="font-mono text-[11px] font-semibold uppercase tracking-wide">{take}</p><span className={`font-mono text-[10px] ${active ? 'text-review' : 'text-muted-foreground'}`}>{confidence}</span></div>
      <div className="mt-3 flex h-10 items-center gap-[3px] overflow-hidden" aria-hidden="true">
        {waveform.map((height, index) => <span key={index} className={`w-1 flex-1 ${active ? 'bg-review/70' : 'bg-muted-foreground/35'}`} style={{ height: `${height}%` }} />)}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-[10px]"><span className="text-clear">{note}</span><span className="text-right text-muted-foreground">{issue}</span></div>
    </article>
  );
}

function TraceStep({ title, meta, label, state, last = false }: { title: string; meta: string; label: string; state: 'done' | 'review' | 'blocked'; last?: boolean }) {
  const color = state === 'done' ? 'text-clear border-clear/40 bg-clear/10' : state === 'review' ? 'text-review border-review/40 bg-review/10' : 'text-hold border-hold/40 bg-hold/10';
  return (
    <div className="relative flex gap-3 pb-5 last:pb-0">
      {!last && <span className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-border" />}
      <span className={`relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border ${color}`}>
        {state === 'done' ? <Check className="size-3" /> : state === 'review' ? <Clock3 className="size-3" /> : <AlertTriangle className="size-3" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2"><p className="truncate text-xs font-semibold">{title}</p><span className={`font-mono text-[9px] ${state === 'blocked' ? 'text-hold' : state === 'review' ? 'text-review' : 'text-muted-foreground'}`}>{label}</span></div>
        <p className="mt-1 text-[11px] text-muted-foreground">{meta}</p>
      </div>
    </div>
  );
}
