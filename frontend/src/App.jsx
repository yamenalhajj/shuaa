import { useEffect, useMemo, useRef, useState } from 'react';
import { dict, PHASES } from './i18n';
import { diagnose, fetchDiagnoses, clearDiagnoses } from './api';
import { loadCachedHistory, cacheHistory, loadThumbs, saveThumb, makeThumb, clearLocal } from './storage';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeScreen from './screens/HomeScreen';
import AnalyzingScreen from './screens/AnalyzingScreen';
import ResultScreen from './screens/ResultScreen';
import ErrorScreen from './screens/ErrorScreen';
import HistoryScreen from './screens/HistoryScreen';

// Client-side limits mirror the design; the backend enforces its own.
const MAX_FILE_BYTES = 8 * 1024 * 1024;
// Minimum time the scan animation stays visible, so a fast inference
// response doesn't make the analyzing state flash and vanish.
const MIN_ANALYZE_MS = 1500;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export default function App() {
  const [lang, setLang] = useState('ar');
  const [view, setView] = useState('home');
  const [drag, setDrag] = useState(false);
  const [img, setImg] = useState(null);
  const [phase, setPhase] = useState(0);
  const [result, setResult] = useState(null);
  const [reveal, setReveal] = useState(1);
  const [history, setHistory] = useState([]);
  const [thumbs, setThumbs] = useState({});
  const [error, setError] = useState(null);

  const fileRef = useRef(null);
  const abortRef = useRef(null);
  const phaseTimerRef = useRef(null);
  const rafRef = useRef(null);
  const reduced = useMemo(
    () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const t = useMemo(() => dict(lang), [lang]);
  const ar = lang === 'ar';

  useEffect(() => {
    setThumbs(loadThumbs());
    refreshHistory();
    return stopTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopTimers() {
    clearInterval(phaseTimerRef.current);
    cancelAnimationFrame(rafRef.current);
  }

  function abortInFlight() {
    if (abortRef.current) abortRef.current.abort();
  }

  // Backend is the source of truth; the localStorage cache is used only
  // when the backend is unreachable (never merged with live data).
  async function refreshHistory() {
    try {
      const items = await fetchDiagnoses(12);
      setHistory(items);
      cacheHistory(items);
    } catch {
      setHistory(loadCachedHistory());
    }
  }

  function startReveal() {
    if (reduced) {
      setReveal(1);
      return;
    }
    setReveal(0);
    const t0 = performance.now();
    const dur = 950;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      setReveal(1 - Math.pow(1 - p, 3));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }

  function showError(err) {
    stopTimers();
    abortInFlight();
    setError(err);
    setView('error');
  }

  function handleFile(file) {
    setDrag(false);
    if (!/^image\/(jpeg|png)$/.test(file.type)) return showError({ kind: 'type' });
    if (file.size > MAX_FILE_BYTES) return showError({ kind: 'size' });

    const reader = new FileReader();
    reader.onload = () => runDiagnosis(file, reader.result);
    reader.readAsDataURL(file);
  }

  async function runDiagnosis(file, dataUrl) {
    stopTimers();
    abortInFlight();
    const controller = new AbortController();
    abortRef.current = controller;

    setImg(dataUrl);
    setPhase(0);
    setError(null);
    setView('analyzing');
    phaseTimerRef.current = setInterval(() => setPhase((p) => p + 1), 850);

    const started = Date.now();
    try {
      const record = await diagnose(file, controller.signal);
      await delay(Math.max(0, MIN_ANALYZE_MS - (Date.now() - started)));
      if (controller.signal.aborted) return;

      clearInterval(phaseTimerRef.current);
      setResult(record);
      setView('result');
      startReveal();

      setHistory((h) => [record, ...h].slice(0, 12));
      const thumb = await makeThumb(dataUrl);
      setThumbs(saveThumb(record.id, thumb));
    } catch (err) {
      if (err.name === 'AbortError' || controller.signal.aborted) return;
      showError(err.status === 0 ? { kind: 'network' } : { kind: 'server', status: err.status, message: err.message });
    }
  }

  async function useSample() {
    try {
      const res = await fetch('/sample-xray.jpeg');
      const blob = await res.blob();
      handleFile(new File([blob], 'sample-xray.jpeg', { type: 'image/jpeg' }));
    } catch {
      showError({ kind: 'network' });
    }
  }

  async function clearHistory() {
    try {
      await clearDiagnoses();
      setHistory([]);
      setThumbs({});
      clearLocal();
    } catch (err) {
      showError(err.status === 0 ? { kind: 'network' } : { kind: 'server', status: err.status, message: err.message });
    }
  }

  function goHome() {
    stopTimers();
    abortInFlight();
    setView('home');
    setError(null);
    setDrag(false);
  }

  function goHistory() {
    stopTimers();
    abortInFlight();
    refreshHistory();
    setView('history');
  }

  function openItem(item) {
    setResult(item);
    setImg(thumbs[item.id] || null);
    setView('result');
    startReveal();
  }

  const dragHandlers = {
    onDragOver: (e) => {
      e.preventDefault();
      if (!drag) setDrag(true);
    },
    onDragLeave: () => setDrag(false),
    onDrop: (e) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
      else setDrag(false);
    },
  };

  return (
    <div
      dir={ar ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(1200px 600px at 50% -10%, #10171c 0%, #0b0f12 60%)',
        color: '#e6edf0',
        fontFamily: "'IBM Plex Sans Arabic',system-ui,sans-serif",
        fontSize: 16,
      }}
    >
      <Header
        t={t}
        lang={lang}
        view={view}
        historyCount={history.length}
        onHome={goHome}
        onHistory={goHistory}
        onToggleLang={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
      />

      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 1180,
          margin: '0 auto',
          padding: 'clamp(24px,5vh,56px) clamp(16px,4vw,48px)',
          boxSizing: 'border-box',
        }}
      >
        {view === 'home' && (
          <HomeScreen
            t={t}
            drag={drag}
            fileRef={fileRef}
            onPick={() => fileRef.current && fileRef.current.click()}
            onFileChange={(e) => {
              const f = e.target.files[0];
              e.target.value = '';
              if (f) handleFile(f);
            }}
            onSample={useSample}
            dragHandlers={dragHandlers}
          />
        )}
        {view === 'analyzing' && (
          <AnalyzingScreen t={t} img={img} phaseText={PHASES[phase % 3][lang]} onCancel={goHome} />
        )}
        {view === 'result' && result && (
          <ResultScreen
            t={t}
            lang={lang}
            result={result}
            img={img}
            reveal={reveal}
            onNewScan={goHome}
            onGoHistory={goHistory}
          />
        )}
        {view === 'error' && error && <ErrorScreen t={t} error={error} onRetry={goHome} onHome={goHome} />}
        {view === 'history' && (
          <HistoryScreen t={t} lang={lang} items={history} thumbs={thumbs} onOpen={openItem} onClear={clearHistory} />
        )}
      </main>

      <Footer t={t} onDemo={(kind) => showError({ kind })} />
    </div>
  );
}
