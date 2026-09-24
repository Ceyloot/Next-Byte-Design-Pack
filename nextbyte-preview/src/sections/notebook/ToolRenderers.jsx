import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Headphones, Presentation, Brain, ClipboardList, Layers, CircleHelp, BarChart, Table2, ChevronRight, Check, X, RotateCcw, ChevronDown, Play, Pause, Loader2, Volume2, SkipBack, SkipForward, Download, Trophy, RefreshCw, Maximize2, ArrowLeft, ArrowRight } from 'lucide-react';
import { BarChart as ReBarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GlassCard, GlassButton, GlassBadge, GlassAlert, GlassSpinner } from '@/components/glass';

// ─── Inline markdown helper ───────────────────────────────────
function renderMd(text) {
  if (!text) return text;
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} className="font-semibold text-foreground/90">{p.slice(2,-2)}</strong>;
    if (p.startsWith('*') && p.endsWith('*'))   return <em key={i}>{p.slice(1,-1)}</em>;
    if (p.startsWith('`') && p.endsWith('`'))   return <code key={i} className="text-[11px] bg-foreground/10 px-1 rounded font-mono">{p.slice(1,-1)}</code>;
    return p;
  });
}

// ─── Audio IndexedDB cache ─────────────────────────────────────
function strHash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
  return h.toString(36);
}

function openAudioCacheDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('ns-audio-cache', 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore('segs');
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

async function loadCachedAudio(key) {
  try {
    const db = await openAudioCacheDB();
    return await new Promise((resolve) => {
      const tx = db.transaction('segs', 'readonly');
      const req = tx.objectStore('segs').get(key);
      req.onsuccess = (e) => resolve(e.target.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

async function saveCachedAudio(key, data) {
  try {
    const db = await openAudioCacheDB();
    await new Promise((resolve) => {
      const tx = db.transaction('segs', 'readwrite');
      tx.objectStore('segs').put(data, key);
      tx.oncomplete = resolve;
      tx.onerror = resolve;
    });
  } catch { /* ignore cache write errors */ }
}

function parseExchanges(content) {
  const lines = content.split('\n').filter(l => l.trim());
  const exchanges = [];
  let currentSpeaker = null;
  let currentText = [];
  for (const line of lines) {
    const match = line.match(/^(PREZENTER\s*[12])\s*:\s*(.*)/i);
    if (match) {
      if (currentSpeaker) exchanges.push({ speaker: currentSpeaker, text: currentText.join(' ') });
      currentSpeaker = match[1].toUpperCase();
      currentText = [match[2]];
    } else if (currentSpeaker) {
      currentText.push(line.trim());
    }
  }
  if (currentSpeaker) exchanges.push({ speaker: currentSpeaker, text: currentText.join(' ') });
  return exchanges;
}

function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numSamples = buffer.length;
  const dataSize = numSamples * numChannels * 2;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);
  const ws = (pos, str) => { for (let i = 0; i < str.length; i++) view.setUint8(pos + i, str.charCodeAt(i)); };
  ws(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true);
  ws(8, 'WAVE'); ws(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true); view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true); ws(36, 'data'); view.setUint32(40, dataSize, true);
  let pos = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < numChannels; c++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i]));
      view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      pos += 2;
    }
  }
  return ab;
}

async function downloadPodcast(segments) {
  const ctx = new AudioContext();
  const buffers = await Promise.all(
    segments.map(async seg => {
      const res = await fetch(seg.audioUrl);
      const ab = await res.arrayBuffer();
      return ctx.decodeAudioData(ab);
    })
  );
  const nCh = Math.max(...buffers.map(b => b.numberOfChannels));
  const sr = buffers[0].sampleRate;
  const totalLen = buffers.reduce((s, b) => s + b.length, 0);
  const combined = ctx.createBuffer(nCh, totalLen, sr);
  let offset = 0;
  for (const buf of buffers) {
    for (let c = 0; c < nCh; c++) {
      const src = buf.getChannelData(Math.min(c, buf.numberOfChannels - 1));
      combined.getChannelData(c).set(src, offset);
    }
    offset += buf.length;
  }
  const wav = audioBufferToWav(combined);
  const blob = new Blob([wav], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'podcast.wav'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function fmtTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Audio Overview ───────────────────────────────────────────
function AudioRenderer({ content, elevenlabsKey, voiceV1 = 'iP95p4xoKVk53GoZ742B', voiceV2 = 'cgSgspJ2msm6clMCkdW9' }) {
  const exchanges = parseExchanges(content);
  const [phase, setPhase] = useState('idle'); // idle | loading | generating | merging | ready | error
  const [genProgress, setGenProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const [wavUrl, setWavUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef(null);
  const startedRef = useRef(false);

  const cacheKey = `wav_${strHash(content)}_${voiceV1}_${voiceV2}`;

  const applyWav = (blob) => {
    const url = URL.createObjectURL(blob);
    setWavUrl(url);
    setPhase('ready');
  };

  const runGenerate = useCallback(async (forceRegen = false) => {
    if (!elevenlabsKey || exchanges.length < 2) return;

    // Load from cache unless forced
    if (!forceRegen) {
      setPhase('loading');
      const cached = await loadCachedAudio(cacheKey);
      if (cached?.wav) { applyWav(cached.wav); return; }
    }

    setPhase('generating');
    setError(null);
    setGenProgress({ current: 0, total: exchanges.length });
    try {
      const blobs = [];
      for (let i = 0; i < exchanges.length; i++) {
        setGenProgress({ current: i + 1, total: exchanges.length });
        const voiceId = exchanges[i].speaker.includes('1') ? voiceV1 : voiceV2;
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: { 'xi-api-key': elevenlabsKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: exchanges[i].text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: { stability: 0.35, similarity_boost: 0.8, style: 0.45, use_speaker_boost: true },
          }),
        });
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          throw new Error(res.status === 401 ? 'Nieprawidłowy klucz API' : res.status === 429 ? 'Limit API wyczerpany' : `Błąd ${res.status}: ${errText.slice(0, 100)}`);
        }
        blobs.push(await res.blob());
      }

      // Merge all segments into single WAV
      setPhase('merging');
      const ctx = new AudioContext();
      const buffers = await Promise.all(blobs.map(async b => ctx.decodeAudioData(await b.arrayBuffer())));
      const nCh = Math.max(...buffers.map(b => b.numberOfChannels));
      const sr = buffers[0].sampleRate;
      const totalLen = buffers.reduce((s, b) => s + b.length, 0);
      const combined = ctx.createBuffer(nCh, totalLen, sr);
      let offset = 0;
      for (const buf of buffers) {
        for (let c = 0; c < nCh; c++) combined.getChannelData(c).set(buf.getChannelData(Math.min(c, buf.numberOfChannels - 1)), offset);
        offset += buf.length;
      }
      const wavBlob = new Blob([audioBufferToWav(combined)], { type: 'audio/wav' });

      // Persist to IndexedDB
      saveCachedAudio(cacheKey, { wav: wavBlob });


      applyWav(wavBlob);
    } catch (err) {
      setError(err.message);
      setPhase('error');
    }
  }, [elevenlabsKey, exchanges.length, voiceV1, voiceV2, cacheKey]);

  useEffect(() => {
    if (elevenlabsKey && exchanges.length >= 2 && !startedRef.current) {
      startedRef.current = true;
      runGenerate(false);
    }
  }, [elevenlabsKey, exchanges.length, runGenerate]);

  // Audio element event handlers
  const onTimeUpdate = () => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime); };
  const onLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };
  const onEnded = () => setIsPlaying(false);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) { a.pause(); setIsPlaying(false); }
    else { a.play(); setIsPlaying(true); }
  };

  const handleSeekChange = (e) => {
    const t = Number(e.target.value);
    setCurrentTime(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  };

  const handleDownload = () => {
    if (!wavUrl) return;
    const a = document.createElement('a');
    a.href = wavUrl; a.download = 'podcast.wav'; a.click();
  };

  if (exchanges.length < 2) return null;

  if (!elevenlabsKey) {
    return (
      <div>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
            <Headphones size={15} className="text-purple-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-purple-400/70 font-semibold">Audio Overview</div>
            <div className="text-sm font-semibold text-foreground">Skrypt podkastu</div>
          </div>
        </div>
        <div className="space-y-2">
          {exchanges.map((ex, i) => {
            const is1 = ex.speaker.includes('1');
            return (
              <div key={i} className={`flex gap-2.5 ${is1 ? '' : 'flex-row-reverse'}`}>
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                  is1 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>{is1 ? 'P1' : 'P2'}</div>
                <div className={`px-3 py-2 rounded-2xl text-[13px] leading-relaxed max-w-[85%] ${
                  is1 ? 'bg-purple-500/10 border border-purple-500/20 rounded-tl-sm text-foreground/90'
                       : 'bg-blue-500/10 border border-blue-500/20 rounded-tr-sm text-foreground/90'
                }`}>{ex.text}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 px-3 py-2 rounded-lg bg-purple-500/5 border border-purple-500/15 text-[11px] text-purple-300/70 text-center">
          Dodaj klucz ElevenLabs w ustawieniach, aby automatycznie generować audio
        </div>
      </div>
    );
  }

  if (phase === 'loading' || phase === 'generating' || phase === 'merging') {
    const isGen = phase === 'generating';
    const isMerge = phase === 'merging';
    const pct = isGen && genProgress.total > 0 ? Math.round((genProgress.current / genProgress.total) * 100) : isMerge ? 100 : 5;
    const label = phase === 'loading' ? 'Ładowanie…' : isMerge ? 'Łączenie plików…' : `Synteza głosu ${genProgress.current} z ${genProgress.total}`;
    return (
      <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/[0.06] to-blue-500/[0.04] overflow-hidden">
        <div className="p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
            <Loader2 size={24} className="text-purple-400 animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-purple-400/70 font-semibold mb-0.5">Generowanie podkastu</div>
            <div className="text-sm font-semibold text-foreground mb-2">{label}</div>
            <div className="w-full h-1.5 rounded-full bg-foreground/5 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <GlassAlert intent="danger" title="Błąd generowania">
        {error}
        <div className="mt-2">
          <GlassButton onClick={() => { startedRef.current = false; runGenerate(true); }} variant="danger" size="sm">
            <RotateCcw size={14} />
            Spróbuj ponownie
          </GlassButton>
        </div>
      </GlassAlert>
    );
  }

  // Ready — single WAV player
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  return (
    <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/[0.06] to-blue-500/[0.04] overflow-hidden">
      {/* Hidden audio element */}
      {wavUrl && (
        <audio ref={audioRef} src={wavUrl} onTimeUpdate={onTimeUpdate} onLoadedMetadata={onLoadedMetadata} onEnded={onEnded} preload="metadata" />
      )}

      {/* Header */}
      <div className="p-5 pb-3 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
          <Headphones size={24} className="text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-purple-400/70 font-semibold mb-0.5">Podcast</div>
          <div className="text-sm font-semibold text-foreground">{exchanges.length} wymian · {fmtTime(duration)}</div>
        </div>
        <GlassButton
          onClick={handleDownload}
          disabled={!wavUrl}
          title="Pobierz jako WAV"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 border border-purple-500/25 text-purple-400/70 hover:text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/40"
        >
          <Download size={16} />
        </GlassButton>
      </div>

      {/* Seek slider */}
      <div className="px-5 pb-1">
        <style>{`
          .audio-seek::-webkit-slider-thumb{width:14px;height:14px;border-radius:50%;background:#a855f7;-webkit-appearance:none;cursor:pointer;margin-top:-5px;box-shadow:0 0 0 3px rgba(168,85,247,0.2);}
          .audio-seek::-webkit-slider-runnable-track{height:4px;border-radius:2px;}
          .audio-seek::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#a855f7;border:none;cursor:pointer;}
          .audio-seek::-moz-range-track{height:4px;border-radius:2px;}
        `}</style>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={currentTime}
          onChange={handleSeekChange}
          className="audio-seek w-full appearance-none bg-transparent cursor-pointer"
          style={{ background: `linear-gradient(to right, #a855f7 ${pct}%, rgba(255,255,255,0.08) ${pct}%)` }}
        />
        <div className="flex justify-between text-[10px] text-foreground/30 mt-0.5 select-none">
          <span>{fmtTime(currentTime)}</span>
          <span>{fmtTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-5 py-2 flex items-center justify-center gap-3">
        <button onClick={() => { if (audioRef.current) { audioRef.current.currentTime = Math.max(0, currentTime - 10); } }} disabled={!wavUrl} className="p-2 rounded-full text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all disabled:opacity-30" title="-10s">
          <SkipBack size={16} />
        </button>
        <button onClick={togglePlay} disabled={!wavUrl}
          className="w-11 h-11 rounded-full bg-primary hover:brightness-110 text-primary-foreground flex items-center justify-center transition-all shadow-glow-primary disabled:opacity-30">
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>
        <button onClick={() => { if (audioRef.current) { audioRef.current.currentTime = Math.min(duration, currentTime + 10); } }} disabled={!wavUrl} className="p-2 rounded-full text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all disabled:opacity-30" title="+10s">
          <SkipForward size={16} />
        </button>
      </div>

      {/* Transcript toggle */}
      <div className="border-t border-foreground/5">
        <button
          onClick={() => setShowTranscript(v => !v)}
          className="w-full px-5 py-2.5 flex items-center justify-between text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Transkrypcja</span>
          <ChevronDown size={12} className={`transition-transform duration-200 ${showTranscript ? 'rotate-180' : ''}`} />
        </button>
        {showTranscript && (
          <div className="px-5 pb-4 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-200">
            {exchanges.map((ex, i) => {
              const is1 = ex.speaker.includes('1');
              return (
                <div key={i} className={`flex gap-2.5 ${is1 ? '' : 'flex-row-reverse'}`}>
                  <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5 ${
                    is1 ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>{is1 ? '1' : '2'}</div>
                  <div className="px-2.5 py-1.5 rounded-xl text-[12px] leading-relaxed max-w-[85%] text-foreground/70">{ex.text}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Parsuje inline cytaty [N] lub [N, 00:32]; usuwa UUIDs i inne artefakty embeddingów
const UUID_RE = /\[[0-9a-f]{8}-[^\]]*\]/gi;
function renderWithCitations(text) {
  const cleaned = text.replace(UUID_RE, '').replace(/\s{2,}/g, ' ').trim();
  const parts = cleaned.split(/(\[\d+(?:[,\s]+[\d:]+)?\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[(\d+)(?:[,\s]+([\d:]+))?\]$/);
    if (!m) return part;
    const label = m[2] ? m[2] : m[1];
    return (
      <span key={i} className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 mx-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-bold leading-none align-middle select-none" title={`Źródło ${m[1]}${m[2] ? ` · ${m[2]}` : ''}`}>
        {label}
      </span>
    );
  });
}

// ─── Slide Deck ───────────────────────────────────────────────
function parseSlides(content) {
  const slides = [];
  const blocks = content.split(/(?=#{2,4}\s+Slajd\s+\d+)/i);
  for (const block of blocks) {
    const titleMatch = block.match(/#{2,4}\s+Slajd\s*\d+\s*[:\-]\s*(.+)/i);
    if (!titleMatch) continue;
    const title = titleMatch[1].trim();
    const lines = block.split('\n').slice(1);
    const bullets = [];
    let notes = '';
    let inNotes = false;
    for (const line of lines) {
      const lt = line.trim();
      if (/^\*?Notatki\s+prelegenta\s*[:\-]/i.test(lt) || /^\*?Speaker\s+notes?\s*[:\-]/i.test(lt)) {
        inNotes = true;
        const after = lt.replace(/^\*?(?:Notatki\s+prelegenta|Speaker\s+notes?)\s*[:\-]\s*/i, '').replace(/\*$/, '').trim();
        if (after) notes = after;
      } else if (inNotes) {
        const cleaned = lt.replace(/^\*|^\*\*|\*$|\*\*$/g, '').replace(/^_|_$/g, '').trim();
        if (cleaned) notes += (notes ? ' ' : '') + cleaned;
      } else if (/^[-•*]\s+/.test(lt)) {
        bullets.push(lt.replace(/^[-•*]\s+/, '').replace(/\*\*(.*?)\*\*/g, '$1'));
      }
    }
    slides.push({ title, bullets, notes });
  }
  return slides;
}

// Topic → theme palette
const SLIDE_THEMES = {
  tech:     { accent: '#70BEFA', bg: '#0B0C12', card: '#13141C', border: 'rgba(112,190,250,0.12)', text: '#E8EAF0', sub: 'rgba(232,234,240,0.6)' },
  nature:   { accent: '#34d399', bg: '#05110D', card: '#0C1A14', border: 'rgba(52,211,153,0.12)',  text: '#E6F5EF', sub: 'rgba(230,245,239,0.6)' },
  history:  { accent: '#FBBF24', bg: '#110C05', card: '#1A1207', border: 'rgba(251,191,36,0.12)',  text: '#FEF3C7', sub: 'rgba(254,243,199,0.6)' },
  science:  { accent: '#a78bfa', bg: '#0D0A15', card: '#141020', border: 'rgba(167,139,250,0.12)', text: '#EDE9FE', sub: 'rgba(237,233,254,0.6)' },
  business: { accent: '#60a5fa', bg: '#080E14', card: '#0D1520', border: 'rgba(96,165,250,0.12)',  text: '#DBEAFE', sub: 'rgba(219,234,254,0.6)' },
  art:      { accent: '#f472b6', bg: '#14080F', card: '#1F0D17', border: 'rgba(244,114,182,0.12)', text: '#FCE7F3', sub: 'rgba(252,231,243,0.6)' },
  food:     { accent: '#fb923c', bg: '#130A05', card: '#1E1008', border: 'rgba(251,146,60,0.12)',  text: '#FEF3E2', sub: 'rgba(254,243,226,0.6)' },
  default:  { accent: '#70BEFA', bg: '#0B0C12', card: '#13141C', border: 'rgba(112,190,250,0.12)', text: '#E8EAF0', sub: 'rgba(232,234,240,0.6)' },
};

function detectSlideTheme(slides) {
  const txt = slides.map(s => `${s.title} ${s.bullets.join(' ')}`).join(' ').toLowerCase();
  const rules = [
    ['tech',     /tech|software|kod|code|ai |algorytm|program|komputer|digital|web|api|\bdata\b|machine|sieć|system|cyber/],
    ['nature',   /natura|przyroda|roślin|zwierz|\blas\b|ocean|środowisko|klimat|ekolog|planet|\bbio\b|roślina|fauna/],
    ['history',  /histori|folklor|tradycj|kultura|\bwiek\b|dawny|przodek|legend|mitologi|średniow|korzenie|zabytek/],
    ['science',  /nauk|fizyk|chemi|biolog|kosmos|\batom\b|cząstk|badani|eksperym|laborat|astronomi|kwant/],
    ['business', /biznes|firma|rynek|strateg|finans|marketing|sprzedaż|zysk|inwestycj|zarządzani|klient|revenue/],
    ['art',      /sztuk|muzyk|malarst|\bfilm\b|kreatyw|design|architektur|taniec|teatr|literatura|artyst|galeri/],
    ['food',     /jedzeni|kuchni|przepis|smak|restauracj|gotowani|danie|kulinarn|\bfood\b|recipe|składnik/],
  ];
  for (const [key, re] of rules) if (re.test(txt)) return SLIDE_THEMES[key];
  return SLIDE_THEMES.default;
}

// Single slide card — rich layout, NextByte dark, topic-aware accent
function SlideCard({ slide, index, total, theme }) {
  const t = theme || SLIDE_THEMES.default;
  // First bullet can act as a subtitle if very short (≤ 80 chars, no sub-sentence)
  const hasSubtitle = slide.bullets.length > 0 && slide.bullets[0].length <= 80 && !/[:,;]/.test(slide.bullets[0]);
  const subtitle = hasSubtitle ? slide.bullets[0] : null;
  const bullets = hasSubtitle ? slide.bullets.slice(1) : slide.bullets;

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden" style={{
      fontFamily: "'Space Grotesk', Inter, system-ui, sans-serif",
      background: t.card,
    }}>
      {/* ── Decorative bg shape (top-right glow) ── */}
      <div style={{
        position: 'absolute', top: '-30%', right: '-15%',
        width: '55%', height: '80%', borderRadius: '50%',
        background: `radial-gradient(circle, ${t.accent}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      {/* ── Bottom-left accent blob ── */}
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-10%',
        width: '40%', height: '60%', borderRadius: '50%',
        background: `radial-gradient(circle, ${t.accent}0C 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* ── Top accent bar ── */}
      <div style={{ height: '3px', background: `linear-gradient(90deg,${t.accent},${t.accent}44,transparent)`, flexShrink: 0 }} />

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-8 pt-5 pb-0 relative">
        {/* slide badge */}
        <div className="flex items-center gap-2 mb-3">
          <span style={{
            fontSize: 'clamp(7px,0.7vw,9px)', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: t.accent, opacity: 0.7,
          }}>
            Slajd {index} / {total}
          </span>
          <div style={{ flex: 1, height: '1px', background: `${t.accent}25` }} />
        </div>

        {/* title */}
        <h2 style={{
          fontSize: 'clamp(13px, 2.1vw, 24px)',
          fontWeight: 700,
          color: t.text,
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          marginBottom: subtitle ? 'clamp(4px,0.6vw,8px)' : 'clamp(8px,1vw,14px)',
        }}>
          {slide.title}
        </h2>

        {/* subtitle */}
        {subtitle && (
          <p style={{
            fontSize: 'clamp(9px,1.1vw,13px)',
            color: t.accent,
            fontWeight: 500,
            opacity: 0.85,
            marginBottom: 'clamp(6px,0.8vw,10px)',
            letterSpacing: '0.01em',
          }}>
            {subtitle}
          </p>
        )}

        {/* rule */}
        <div style={{ height: '1px', background: `linear-gradient(90deg,${t.accent}40,transparent)` }} />
      </div>

      {/* ── Content bullets ── */}
      <div className="flex-1 px-8 pt-4 pb-4 min-h-0 overflow-hidden relative">
        {bullets.length > 0 ? (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(5px,0.8vw,10px)' }}>
            {bullets.map((b, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(6px,0.8vw,10px)' }}>
                {/* number badge */}
                <span style={{
                  flexShrink: 0,
                  width: 'clamp(14px,1.6vw,20px)',
                  height: 'clamp(14px,1.6vw,20px)',
                  borderRadius: '5px',
                  background: `${t.accent}20`,
                  border: `1px solid ${t.accent}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 'clamp(7px,0.75vw,9px)',
                  fontWeight: 700,
                  color: t.accent,
                  marginTop: '0.15em',
                }}>
                  {i + 1}
                </span>
                <span style={{
                  fontSize: 'clamp(10px,1.2vw,14px)',
                  color: t.sub,
                  lineHeight: 1.5,
                  flex: 1,
                }}>
                  {b}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* ── Footer ── */}
      <div className="flex-shrink-0 px-8 pb-3 flex items-center justify-between relative">
        <div style={{ height: '1px', flex: 1, background: `${t.accent}18` }} />
        <span style={{
          marginLeft: 'clamp(6px,0.6vw,8px)',
          fontSize: 'clamp(7px,0.65vw,9px)',
          fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: t.accent, opacity: 0.3,
        }}>
          NextByte
        </span>
      </div>
    </div>
  );
}

function SlideRenderer({ content }) {
  const slides = useMemo(() => parseSlides(content), [content]);
  const theme = useMemo(() => detectSlideTheme(slides), [slides]);
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [animDir, setAnimDir] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const go = useCallback((dir) => {
    const next = current + dir;
    if (next < 0 || next >= slides.length) return;
    setAnimDir(dir);
    setAnimKey(k => k + 1);
    setCurrent(next);
  }, [current, slides.length]);

  // Keyboard nav
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen, go]);

  if (slides.length === 0) return null;

  const slide = slides[current];
  const t = theme;

  const cardStyle = {
    background: t.card,
    border: `1px solid ${t.border}`,
    boxShadow: `0 4px 32px rgba(0,0,0,0.4)`,
  };

  const toolbarStyle = { background: t.bg, borderColor: t.border };

  // Fullscreen portal
  const fullscreenPortal = fullscreen ? ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: t.bg }}>
      {/* toolbar */}
      <div className="flex items-center justify-between px-5 py-2.5 flex-shrink-0"
        style={{ ...toolbarStyle, borderBottom: `1px solid ${t.border}` }}>
        <div className="flex items-center gap-3">
          <Presentation size={14} style={{ color: t.accent }} />
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Grotesk',system-ui,sans-serif" }}>
            {slides[0]?.title || 'Prezentacja'}
          </span>
        </div>
        <button onClick={() => setFullscreen(false)}
          className="p-1.5 rounded-lg transition-colors hover:bg-foreground/10"
          style={{ color: 'rgba(255,255,255,0.4)' }} title="Wyjdź (Esc)">
          <X size={16} />
        </button>
      </div>

      {/* slide area */}
      <div className="flex-1 flex items-center justify-center p-10 min-h-0">
        <div className="w-full max-w-5xl" style={{ aspectRatio: '16/9' }}>
          <div key={animKey} className="w-full h-full rounded-xl overflow-hidden"
            style={{
              ...cardStyle,
              animation: animKey > 0 ? `slideIn${animDir > 0 ? 'Right' : 'Left'} 0.25s ease` : undefined,
            }}>
            <SlideCard slide={slide} index={current + 1} total={slides.length} theme={t} />
          </div>
        </div>
      </div>

      {/* notes */}
      {slide.notes && (
        <div className="flex-shrink-0 px-8 py-2.5 max-h-20 overflow-y-auto"
          style={{ ...toolbarStyle, borderTop: `1px solid ${t.border}` }}>
          <span className="text-[10px] uppercase tracking-wider font-semibold mr-2" style={{ color: t.accent, opacity: 0.6 }}>Notatki:</span>
          <span className="text-xs italic" style={{ color: 'rgba(255,255,255,0.4)' }}>{slide.notes}</span>
        </div>
      )}

      {/* navigation */}
      <div className="flex-shrink-0 flex items-center justify-between px-8 py-3"
        style={{ ...toolbarStyle, borderTop: `1px solid ${t.border}` }}>
        <button onClick={() => go(-1)} disabled={current === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-25"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
          <ArrowLeft size={15} /> Wstecz
        </button>

        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => { setAnimDir(i > current ? 1 : -1); setAnimKey(k=>k+1); setCurrent(i); }}
              className="rounded-full transition-all"
              style={{ width: i === current ? '20px' : '5px', height: '5px', background: i === current ? t.accent : 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>

        <button onClick={() => go(1)} disabled={current === slides.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-25"
          style={{ background: `${t.accent}22`, color: t.accent, border: `1px solid ${t.accent}44` }}>
          Dalej <ArrowRight size={15} />
        </button>
      </div>

      <style>{`
        @keyframes slideInRight { from { opacity:0; transform:translateX(40px) } to { opacity:1; transform:none } }
        @keyframes slideInLeft  { from { opacity:0; transform:translateX(-40px) } to { opacity:1; transform:none } }
      `}</style>
    </div>,
    document.body
  ) : null;

  return (
    <div>
      {/* ── Single card with overlaid controls ── */}
      <div className="relative group rounded-xl overflow-hidden" style={{ ...cardStyle, aspectRatio: '16/9', cursor: 'pointer' }}
        onClick={() => { setCurrent(current); setFullscreen(true); }}>

        <SlideCard slide={slide} index={current + 1} total={slides.length} theme={t} />

        {/* Left arrow — stops click-through */}
        {current > 0 && (
          <button onClick={e => { e.stopPropagation(); go(-1); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.45)', color: '#fff', backdropFilter: 'blur(4px)' }}>
            <ArrowLeft size={13} />
          </button>
        )}

        {/* Right arrow */}
        {current < slides.length - 1 && (
          <button onClick={e => { e.stopPropagation(); go(1); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.45)', color: '#fff', backdropFilter: 'blur(4px)' }}>
            <ArrowRight size={13} />
          </button>
        )}

        {/* Expand button — top right */}
        <button onClick={e => { e.stopPropagation(); setCurrent(0); setFullscreen(true); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(4px)' }}
          title="Powiększ (prezentuj)">
          <Maximize2 size={12} />
        </button>

        {/* Dot indicators — bottom center */}
        {slides.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1
                          opacity-0 group-hover:opacity-100 transition-opacity">
            {slides.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setAnimDir(i > current ? 1 : -1); setCurrent(i); }}
                className="rounded-full transition-all"
                style={{ width: i === current ? '14px' : '5px', height: '5px',
                         background: i === current ? t.accent : 'rgba(255,255,255,0.5)',
                         backdropFilter: 'blur(2px)' }} />
            ))}
          </div>
        )}
      </div>

      {fullscreenPortal}
    </div>
  );
}

// ─── Mind Map ─────────────────────────────────────────────────
function MindMapMermaid({ code }) {
  const [svg, setSvg] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    const render = async () => {
      const id = `mm-${Math.random().toString(36).slice(2, 9)}`;
      try {
        if (!window.mermaid) return;
        const { svg: result } = await window.mermaid.render(id, code);
        if (mounted) setSvg(result);
      } catch {
        if (mounted) setError(true);
      }
    };
    const check = () => { if (window.mermaid) render(); else setTimeout(check, 150); };
    check();
    return () => { mounted = false; };
  }, [code]);

  if (error) return <pre className="text-xs text-foreground/70 whitespace-pre overflow-x-auto">{code}</pre>;
  if (!svg) return <div className="h-32 flex items-center justify-center"><span className="text-xs text-muted-foreground animate-pulse">Renderowanie diagramu...</span></div>;
  return <div dangerouslySetInnerHTML={{ __html: svg }} className="[&_svg]:max-w-full [&_svg]:h-auto" />;
}

function MindMapRenderer({ content }) {
  const mermaidMatch = content.match(/```mermaid\s*\n([\s\S]*?)```/);
  if (!mermaidMatch) return null;
  const intro = content.split('```mermaid')[0].trim();
  let code = mermaidMatch[1].replace(/\[[^\]]+,\s*\d+:\d+\]/g, '').replace(/\[\d+\]/g, '');

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-green-500/15 border border-green-500/25 flex items-center justify-center">
          <Brain size={15} className="text-green-400" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-green-400/70 font-semibold">Mind Map</div>
          <div className="text-sm font-semibold text-foreground">Mapa myśli</div>
        </div>
      </div>
      {intro && <p className="text-[13px] text-foreground/70 mb-3">{intro}</p>}
      <div className="rounded-xl border border-green-500/15 bg-green-500/[0.03] p-4 overflow-x-auto">
        <MindMapMermaid code={code} />
      </div>
    </div>
  );
}

// ─── Report ───────────────────────────────────────────────────
function ReportRenderer({ content }) {
  const sections = [];
  const blocks = content.split(/(?=^#{2,4}\s+)/m);
  for (const block of blocks) {
    const hMatch = block.match(/^#{2,4}\s+(.+)/);
    if (!hMatch) { if (block.trim()) sections.push({ title: null, body: block.trim() }); continue; }
    sections.push({ title: hMatch[1].trim(), body: block.split('\n').slice(1).join('\n').trim() });
  }

  if (sections.length === 0) return null;

  const sectionIcons = {
    'Streszczenie': '📋', 'Źródła': '📚', 'Kluczowe': '🔍', 'Analiza': '📊', 'Rekomendacje': '✅',
    'Metodologia': '📚', 'Wnioski': '💡', 'Podsumowanie': '📋'
  };
  const getIcon = (title) => {
    if (!title) return '📄';
    for (const [key, icon] of Object.entries(sectionIcons)) {
      if (title.includes(key)) return icon;
    }
    return '📌';
  };

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center">
          <ClipboardList size={15} className="text-cyan-400" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-cyan-400/70 font-semibold">Report</div>
          <div className="text-sm font-semibold text-foreground">Raport analityczny</div>
        </div>
      </div>
      <div className="space-y-3">
        {sections.map((sec, i) => (
          <ReportSection key={i} section={sec} icon={getIcon(sec.title)} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  );
}

function ReportSection({ section, icon, defaultOpen }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const lines = section.body.split('\n').filter(l => l.trim());

  return (
    <GlassCard padding="p-0" radius="rounded-xl" interactive className={`transition-all ${isOpen ? 'border-cyan-500/20 bg-cyan-500/[0.03]' : ''}`}>
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left"
      >
        <span className="text-base">{icon}</span>
        <span className="text-[13px] font-semibold text-foreground flex-1">{section.title || 'Wprowadzenie'}</span>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-3 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          {lines.map((line, i) => {
            const bullet = line.match(/^[-•*]\s+(.*)/);
            if (bullet) {
              return (
                <div key={i} className="flex gap-2 text-[13px] text-foreground/80 pl-1">
                  <span className="text-cyan-400/50 mt-0.5">•</span>
                  <span className="leading-relaxed">{renderMd(bullet[1])}</span>
                </div>
              );
            }
            return <p key={i} className="text-[13px] text-foreground/75 leading-relaxed">{renderMd(line)}</p>;
          })}
        </div>
      )}
    </GlassCard>
  );
}

// ─── Flashcard IndexedDB ──────────────────────────────────────
function openFcDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('ns-flashcard-progress', 1);
    r.onupgradeneeded = e => e.target.result.createObjectStore('progress');
    r.onsuccess = e => res(e.target.result);
    r.onerror = e => rej(e.target.error);
  });
}
async function loadFcProgress(key) {
  try {
    const db = await openFcDB();
    return await new Promise(res => {
      const tx = db.transaction('progress', 'readonly');
      const r = tx.objectStore('progress').get(key);
      r.onsuccess = e => res(e.target.result ?? { mastered: [] });
      r.onerror = () => res({ mastered: [] });
    });
  } catch { return { mastered: [] }; }
}
async function saveFcProgress(key, mastered) {
  try {
    const db = await openFcDB();
    await new Promise(res => {
      const tx = db.transaction('progress', 'readwrite');
      tx.objectStore('progress').put({ mastered: [...mastered] }, key);
      tx.oncomplete = res; tx.onerror = res;
    });
  } catch {}
}

// ─── Flashcards ───────────────────────────────────────────────
function FlashcardsRenderer({ content }) {
  const cards = useMemo(() => {
    const result = [];
    const blocks = content.split(/(?=###\s+Fiszka\s+\d+)/i);
    for (const block of blocks) {
      if (!/###\s+Fiszka/i.test(block)) continue;
      const qMatch = block.match(/(?:PYTANIE|Pytanie)\s*:\s*([\s\S]*?)(?=(?:ODPOWIED[ŹZ]|Odpowied[źz]))/i);
      const aMatch = block.match(/(?:ODPOWIED[ŹZ]|Odpowied[źz])\s*:\s*([\s\S]*?)$/i);
      if (qMatch && aMatch) result.push({
        q: qMatch[1].trim().replace(UUID_RE, '').trim(),
        a: aMatch[1].trim().replace(UUID_RE, '').trim(),
      });
    }
    return result;
  }, [content]);

  const fcKey = useMemo(() => `fc_${strHash(content)}`, [content]);

  const [masteredSet, setMasteredSet] = useState(new Set());
  const [queue, setQueue] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionLearned, setSessionLearned] = useState(new Set());
  const [phase, setPhase] = useState('loading');

  const launchSession = useCallback((mastered) => {
    const nonMastered = cards.map((_, i) => i).filter(i => !mastered.has(i));
    const q = nonMastered.length > 0 ? nonMastered : cards.map((_, i) => i);
    setQueue(q);
    setQIdx(0);
    setFlipped(false);
    setSessionLearned(new Set());
    setPhase('session');
  }, [cards]);

  useEffect(() => {
    if (cards.length === 0) { setPhase('done'); return; }
    loadFcProgress(fcKey).then(data => {
      const mastered = new Set(data.mastered || []);
      setMasteredSet(mastered);
      launchSession(mastered);
    });
  }, [fcKey, launchSession]);

  if (cards.length === 0) return null;

  const cardIdx = queue[qIdx];
  const card = cards[cardIdx];
  const sessionTotal = queue.length;
  const progressPct = sessionTotal > 0 ? Math.round((qIdx / sessionTotal) * 100) : 0;

  const goNext = () => {
    setFlipped(false);
    setTimeout(() => {
      if (qIdx + 1 >= queue.length) setPhase('done');
      else setQIdx(i => i + 1);
    }, 220);
  };

  const handleKnow = async () => {
    const newMastered = new Set(masteredSet);
    newMastered.add(cardIdx);
    setMasteredSet(newMastered);
    setSessionLearned(prev => new Set([...prev, cardIdx]));
    saveFcProgress(fcKey, newMastered);
    goNext();
  };

  const handleReview = () => {
    goNext();
  };

  const handleRestart = () => launchSession(masteredSet);

  const handleResetAll = async () => {
    const empty = new Set();
    setMasteredSet(empty);
    await saveFcProgress(fcKey, empty);
    launchSession(empty);
  };

  // ── Done screen ──
  if (phase === 'done') {
    const learnedNow = sessionLearned.size;
    const reviewCount = queue.length - learnedNow;
    const totalMastered = masteredSet.size;
    const allDone = totalMastered >= cards.length;
    return (
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
            <Layers size={15} className="text-orange-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-orange-400/70 font-semibold">Flashcards</div>
            <div className="text-sm font-semibold text-foreground">Sesja zakończona</div>
          </div>
        </div>
        <GlassCard padding="p-5" radius="rounded-xl" className="text-center">
          <div className={`w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center ${allDone ? 'bg-amber-500/15 border border-amber-500/25' : 'bg-orange-500/10 border border-orange-500/20'}`}>
            <Trophy size={22} className={allDone ? 'text-amber-400' : 'text-orange-400'} />
          </div>
          <div className="text-base font-bold text-foreground mb-1">
            {allDone ? 'Wszystkie opanowane!' : 'Dobra robota!'}
          </div>
          <div className="text-[12px] text-muted-foreground mb-4 space-y-0.5">
            {learnedNow > 0 && (
              <div className="flex items-center justify-center gap-1.5 text-emerald-400/80">
                <Check size={11} /> <span>{learnedNow} {learnedNow === 1 ? 'opanowana' : 'opanowanych'} tej sesji</span>
              </div>
            )}
            {reviewCount > 0 && (
              <div className="flex items-center justify-center gap-1.5 text-orange-400/80">
                <RotateCcw size={11} /> <span>{reviewCount} {reviewCount === 1 ? 'do powtórki' : 'do powtórek'}</span>
              </div>
            )}
            <div className="text-muted-foreground/50 text-[11px] mt-1">
              Łącznie opanowanych: {totalMastered}/{cards.length}
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-foreground/5 overflow-hidden mb-4">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
              style={{ width: `${cards.length > 0 ? (totalMastered / cards.length) * 100 : 0}%` }} />
          </div>
          <div className="flex gap-2 justify-center">
            {reviewCount > 0 && (
              <GlassButton onClick={handleRestart} variant="solid" size="sm">
                <RefreshCw size={14} />
                Ćwicz ponownie
              </GlassButton>
            )}
            {totalMastered > 0 && (
              <GlassButton onClick={handleResetAll} variant="ghost" size="sm">
                <RotateCcw size={14} />
                Resetuj postęp
              </GlassButton>
            )}
          </div>
        </GlassCard>
      </div>
    );
  }

  // ── Loading ──
  if (phase === 'loading' || !card) {
    return (
      <div className="flex items-center justify-center h-32">
        <GlassSpinner size="lg" />
      </div>
    );
  }

  // ── Session screen ──
  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
          <Layers size={15} className="text-orange-400" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider text-orange-400/70 font-semibold">Flashcards</div>
          <div className="text-sm font-semibold text-foreground">
            {qIdx + 1} / {sessionTotal} · {masteredSet.size} opanowanych
          </div>
        </div>
        {masteredSet.size > 0 && (
          <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
            {masteredSet.size}/{cards.length}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 rounded-full bg-foreground/5 overflow-hidden mb-4">
        <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
          style={{ width: `${progressPct}%` }} />
      </div>

      {/* Flip card */}
      <div style={{ perspective: '900px' }} className="w-full max-w-sm mx-auto mb-3">
        {(() => {
          const estH = Math.min(220, Math.max(
            150,
            Math.ceil(card.q.length / 45) * 20 + 80,
            Math.ceil(card.a.length / 45) * 20 + 80,
          ));
          return (
            <div
              onClick={() => !flipped && setFlipped(true)}
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                position: 'relative',
                minHeight: `${estH}px`,
              }}
            >
              {/* Front face — question */}
              <div
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', position: 'absolute', inset: 0 }}
                className={`rounded-xl border flex flex-col p-5 cursor-pointer select-none overflow-y-auto
                  ${!flipped ? 'border-orange-500/20 bg-gradient-to-br from-orange-500/[0.07] to-amber-500/[0.03]' : 'border-foreground/5 bg-foreground/[0.02]'}`}
              >
                <div className="text-[9px] uppercase tracking-widest text-orange-400/60 font-bold mb-3">Pytanie</div>
                <div className="text-[14px] text-foreground leading-relaxed flex-1">{renderWithCitations(card.q)}</div>
                {!flipped && (
                  <div className="mt-4 text-[10px] text-muted-foreground/40 text-center">
                    Kliknij, aby zobaczyć odpowiedź
                  </div>
                )}
              </div>

              {/* Back face — answer */}
              <div
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', position: 'absolute', inset: 0, transform: 'rotateY(180deg)' }}
                className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.07] to-teal-500/[0.03] flex flex-col p-5 select-none overflow-y-auto"
              >
                <div className="text-[9px] uppercase tracking-widest text-emerald-400/60 font-bold mb-3">Odpowiedź</div>
                <div className="text-[14px] text-foreground leading-relaxed flex-1">{renderWithCitations(card.a)}</div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Action buttons — shown after flip */}
      <div className={`flex gap-2.5 transition-all duration-300 ${flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        <button
          onClick={handleReview}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/15 text-orange-300 text-[13px] font-semibold transition-all"
        >
          <RotateCcw size={13} /> Powtórz
        </button>
        <button
          onClick={handleKnow}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[13px] font-semibold transition-all"
        >
          <Check size={14} /> Znam
        </button>
      </div>

      {/* Flip hint when not yet flipped */}
      {!flipped && (
        <div className="mt-2 text-center text-[10px] text-muted-foreground/30 select-none">
          Fiszka {qIdx + 1} z {sessionTotal}
        </div>
      )}
    </div>
  );
}

// ─── Quiz ─────────────────────────────────────────────────────
function QuizRenderer({ content }) {
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const questions = [];

  const blocks = content.split(/(?=###\s+Pytanie\s+\d+)/i);
  for (const block of blocks) {
    if (!/###\s+Pytanie/i.test(block)) continue;
    const lines = block.split('\n');
    const qLines = [];
    const options = [];
    let correctLine = '';
    let phase = 'question';

    for (let k = 1; k < lines.length; k++) {
      const l = lines[k].trim();
      if (!l) continue;
      if (/^[-•*]\s*[A-D]\)/.test(l)) {
        phase = 'options';
        const optMatch = l.match(/^[-•*]\s*([A-D])\)\s*(.*)/);
        if (optMatch) options.push({ letter: optMatch[1], text: optMatch[2] });
      } else if (/^[A-D]\)\s/.test(l)) {
        phase = 'options';
        const optMatch = l.match(/^([A-D])\)\s*(.*)/);
        if (optMatch) options.push({ letter: optMatch[1], text: optMatch[2] });
      } else if (/^Poprawna odpowied[źz]/i.test(l)) {
        correctLine = l;
      } else if (phase === 'question') {
        qLines.push(l);
      }
    }

    const correctMatch = correctLine.match(/([A-D])\)/);
    if (qLines.length > 0 && options.length >= 2 && correctMatch) {
      const fullExp = correctLine.replace(/^Poprawna odpowied[źz]\s*:\s*/i, '');
      const wyjasParts = fullExp.split(/\s*Wyjaśnienie:\s*/i);
      const explanationText = (wyjasParts[1] || wyjasParts[0]).trim();
      questions.push({
        question: qLines.join(' '),
        options,
        correct: correctMatch[1],
        explanation: explanationText,
      });
    }
  }

  if (questions.length === 0) return null;

  const score = Object.keys(answers).length;
  const correctCount = Object.entries(answers).filter(([qi, a]) => a === questions[qi]?.correct).length;

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-pink-500/15 border border-pink-500/25 flex items-center justify-center">
          <CircleHelp size={15} className="text-pink-400" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider text-pink-400/70 font-semibold">Quiz</div>
          <div className="text-sm font-semibold text-foreground">{questions.length} pytań</div>
        </div>
        {score > 0 && (
          <div className="px-2.5 py-1 rounded-lg bg-foreground/5 border border-foreground/10 text-[11px] font-semibold text-foreground/70">
            {correctCount}/{score} poprawnych
          </div>
        )}
      </div>
      <div className="space-y-3">
        {questions.map((q, qi) => {
          const userAnswer = answers[qi];
          const isRevealed = revealed[qi];
          const isCorrect = userAnswer === q.correct;

          return (
            <div key={qi} className="rounded-xl border border-foreground/10 bg-foreground/[0.02] overflow-hidden">
              <div className="px-4 py-3 flex gap-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold ${
                  userAnswer
                    ? isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                    : 'bg-foreground/5 text-foreground/40'
                }`}>
                  {userAnswer ? (isCorrect ? <Check size={12} /> : <X size={12} />) : qi + 1}
                </div>
                <p className="text-[13px] text-foreground/90 leading-relaxed flex-1">{q.question}</p>
              </div>
              <div className="px-4 pb-3.5 grid grid-cols-1 gap-2">
                {q.options.map(opt => {
                  const isSelected = userAnswer === opt.letter;
                  const isCorrectOpt = opt.letter === q.correct;
                  let optClass = 'border-foreground/[0.1] bg-foreground/[0.03] hover:border-primary/40 hover:bg-primary/[0.06]';
                  if (userAnswer) {
                    if (isCorrectOpt) optClass = 'border-[#34d399]/40 bg-[#34d399]/[0.14] text-[#7ef0c0] shadow-[0_0_12px_-4px_rgba(52,211,153,0.3)]';
                    else if (isSelected) optClass = 'border-[#f87171]/40 bg-[#f87171]/[0.14] text-[#fca5a5]';
                    else optClass = 'border-foreground/[0.05] bg-foreground/[0.01] opacity-40';
                  }
                  return (
                    <button
                      key={opt.letter}
                      onClick={() => {
                        if (userAnswer) return;
                        setAnswers(p => ({ ...p, [qi]: opt.letter }));
                        setRevealed(p => ({ ...p, [qi]: true }));
                      }}
                      disabled={!!userAnswer}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all text-[12.5px] cursor-pointer ${optClass}`}
                    >
                      <span className={`w-5.5 h-5.5 rounded-md flex items-center justify-center text-[10.5px] font-bold flex-shrink-0 border ${
                        userAnswer && isCorrectOpt ? 'bg-[#34d399]/30 border-[#34d399]/50 text-[#7ef0c0]' :
                        userAnswer && isSelected ? 'bg-[#f87171]/30 border-[#f87171]/50 text-[#fca5a5]' :
                        'bg-foreground/[0.06] border-foreground/[0.12] text-muted-foreground'
                      }`}>{opt.letter}</span>
                      <span className="text-muted-foreground font-medium">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
              {isRevealed && (
                <div className={`px-4 py-3 border-t backdrop-blur-sm animate-in fade-in duration-200 ${
                  isCorrect
                    ? 'border-[#34d399]/30 bg-[#34d399]/[0.08]'
                    : 'border-[#f87171]/30 bg-[#f87171]/[0.08]'
                }`}>
                  <div className={`flex items-center gap-1.5 text-[11px] font-bold mb-1 ${isCorrect ? 'text-[#7ef0c0]' : 'text-[#fca5a5]'}`}>
                    {isCorrect
                      ? <><Check size={12} /> Poprawnie!</>
                      : <><X size={10} /> Błąd &mdash; prawidłowa: {q.correct})</>
                    }
                  </div>
                  <p className="text-[12px] text-foreground/60 leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {score === questions.length && (
        <div className={`mt-3 p-3 rounded-xl border text-center ${
          correctCount === questions.length
            ? 'border-emerald-500/25 bg-emerald-500/[0.05]'
            : correctCount >= questions.length * 0.7
              ? 'border-amber-500/25 bg-amber-500/[0.05]'
              : 'border-red-500/25 bg-red-500/[0.05]'
        }`}>
          <div className="text-lg font-bold text-foreground">{correctCount}/{questions.length}</div>
          <div className="text-[11px] text-muted-foreground font-medium">
            {correctCount === questions.length ? 'Perfekcyjnie!' : correctCount >= questions.length * 0.7 ? 'Dobry wynik!' : 'Spróbuj ponownie!'}
          </div>
          <GlassButton
            onClick={() => { setAnswers({}); setRevealed({}); }}
            variant="ghost"
            size="sm"
            className="mt-2"
          >
            <RotateCcw size={14} />
            Zacznij od nowa
          </GlassButton>
        </div>
      )}
    </div>
  );
}

// ─── Infographic ──────────────────────────────────────────────
function InfographicRenderer({ content }) {
  const sections = [];
  const cleaned = content.replace(UUID_RE, '').replace(/[ \t]{2,}/g, ' ');
  const blocks = cleaned.split(/(?=^#{2,4}\s+)/m);

  for (const block of blocks) {
    const hMatch = block.match(/^#{2,4}\s+(.+)/);
    if (!hMatch) {
      if (block.trim()) {
        const lines = block.split('\n')
          .map(l => l.replace(/^[-•*>]\s+/, '').replace(/^---+$/, '').replace(UUID_RE, '').trim())
          .filter(Boolean);
        if (lines.length) sections.push({ title: null, items: lines });
      }
      continue;
    }
    const title = hMatch[1].trim();
    const items = block.split('\n').slice(1).filter(l => l.trim())
      .map(l => l.replace(/^[-•*>]\s+/, '').replace(/^---+$/, '').replace(UUID_RE, '').replace(/[ \t]{2,}/g, ' ').trim())
      .filter(Boolean);
    sections.push({ title, items });
  }

  if (sections.length === 0) return null;

  const colors = [
    'from-rose-500/10 to-rose-500/[0.02] border-rose-500/20',
    'from-blue-500/10 to-blue-500/[0.02] border-blue-500/20',
    'from-emerald-500/10 to-emerald-500/[0.02] border-emerald-500/20',
    'from-violet-500/10 to-violet-500/[0.02] border-violet-500/20',
    'from-amber-500/10 to-amber-500/[0.02] border-amber-500/20',
    'from-cyan-500/10 to-cyan-500/[0.02] border-cyan-500/20',
  ];

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center">
          <BarChart size={15} className="text-rose-400" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-rose-400/70 font-semibold">Infographic</div>
          <div className="text-sm font-semibold text-foreground">Podsumowanie wizualne</div>
        </div>
      </div>
      <div className="space-y-2">
        {sections.map((sec, i) => (
          <div key={i} className={`rounded-xl border bg-gradient-to-br p-4 ${colors[i % colors.length]}`}>
            {sec.title && <div className="text-[13px] font-bold text-foreground mb-2">{sec.title}</div>}
            <div className="space-y-1">
              {sec.items.map((item, j) => (
                <p key={j} className="text-[12px] text-foreground/75 leading-relaxed">{item}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Data Table ───────────────────────────────────────────────
function DataTableRenderer({ content }) {
  const tables = [];
  const lines = content.split('\n');
  let currentTitle = null;
  let headerRow = null;
  let rows = [];

  const flush = () => {
    if (headerRow && rows.length > 0) {
      tables.push({ title: currentTitle, headers: headerRow, rows: [...rows] });
    }
    headerRow = null;
    rows = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^#{2,4}\s+/.test(trimmed)) {
      flush();
      currentTitle = trimmed.replace(/^#{2,4}\s+/, '');
    } else if (/^\|.*\|$/.test(trimmed) && !/^[\|\s-:]+$/.test(trimmed)) {
      const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
      if (!headerRow) headerRow = cells;
      else rows.push(cells);
    } else if (/^[\|\s-:]+$/.test(trimmed)) {
      continue;
    }
  }
  flush();

  if (tables.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center">
          <Table2 size={15} className="text-teal-400" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-teal-400/70 font-semibold">Data Table</div>
          <div className="text-sm font-semibold text-foreground">Zestawienie danych</div>
        </div>
      </div>
      <div className="space-y-4">
        {tables.map((table, ti) => (
          <GlassCard key={ti} padding="p-0" radius="rounded-xl">
            {table.title && (
              <div className="px-4 py-2 border-b border-foreground/10 bg-teal-500/[0.03]">
                <span className="text-[12px] font-semibold text-foreground/80">{table.title}</span>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-foreground/10">
                    {table.headers.map((h, hi) => (
                      <th key={hi} className="px-3 py-2 text-left font-semibold text-teal-400/80 text-[11px] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-foreground/[0.03] hover:bg-foreground/[0.02] transition-colors">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2 text-foreground/70">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-3 py-1.5 border-t border-foreground/10 bg-foreground/[0.01]">
              <span className="text-[10px] text-muted-foreground">{table.rows.length} wierszy</span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// ─── Dispatcher ───────────────────────────────────────────────
// ─── Chart Renderer ───────────────────────────────────────────
const CHART_COLORS = ['#70BEFA','#f59e0b','#10b981','#f43f5e','#8b5cf6','#06b6d4','#ec4899','#84cc16'];

function parseChartBlocks(content) {
  const blocks = [];
  const re = /```chart\s*([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    try { blocks.push(JSON.parse(m[1].trim())); } catch {}
  }
  // also try whole content as JSON
  if (blocks.length === 0) {
    try { blocks.push(JSON.parse(content.trim())); } catch {}
  }
  return blocks;
}

function SingleChart({ spec }) {
  const { type = 'bar', title, labels = [], datasets = [] } = spec;
  const data = labels.map((label, i) => {
    const point = { label };
    datasets.forEach(ds => { point[ds.label || 'Wartość'] = ds.data?.[i] ?? 0; });
    return point;
  });
  const series = datasets.map((ds, i) => ({ key: ds.label || 'Wartość', color: CHART_COLORS[i % CHART_COLORS.length] }));

  const tooltipStyle = { backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' };

  if (type === 'pie') {
    const pieData = labels.map((label, i) => ({ name: label, value: datasets[0]?.data?.[i] ?? 0 }));
    return (
      <div>
        {title && <p className="text-xs font-semibold text-foreground/70 mb-3 text-center">{title}</p>}
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
              {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div>
        {title && <p className="text-xs font-semibold text-foreground/70 mb-3">{title}</p>}
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#888' }} />
            <YAxis tick={{ fontSize: 10, fill: '#888' }} />
            <Tooltip contentStyle={tooltipStyle} />
            {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
            {series.map(s => <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} dot={{ r: 3 }} />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div>
      {title && <p className="text-xs font-semibold text-foreground/70 mb-3">{title}</p>}
      <ResponsiveContainer width="100%" height={240}>
        <ReBarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#888' }} />
          <YAxis tick={{ fontSize: 10, fill: '#888' }} />
          <Tooltip contentStyle={tooltipStyle} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {series.map(s => <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[4, 4, 0, 0]} />)}
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartRenderer({ content }) {
  const blocks = parseChartBlocks(content);
  if (blocks.length === 0) return <p className="text-sm text-muted-foreground p-4">Brak danych wykresu.</p>;
  return (
    <div className="p-4 space-y-6">
      {blocks.map((spec, i) => (
        <GlassCard key={i} padding="p-4" radius="rounded-xl">
          <SingleChart spec={spec} />
        </GlassCard>
      ))}
    </div>
  );
}

const TOOL_RENDERERS = {
  audio: AudioRenderer,
  slides: SlideRenderer,
  mindmap: MindMapRenderer,
  report: ReportRenderer,
  flashcards: FlashcardsRenderer,
  quiz: QuizRenderer,
  infographic: InfographicRenderer,
  table: DataTableRenderer,
  chart: ChartRenderer,
};

export function ToolContentRenderer({ toolId, content, fallback, extras = {} }) {
  const Renderer = TOOL_RENDERERS[toolId];
  if (!Renderer) return fallback;
  const result = Renderer({ content, ...extras });
  return result || fallback;
}

export { TOOL_RENDERERS };
