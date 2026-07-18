export default function AnalyzingScreen({ t, img, phaseText, onCancel }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, animation: 'shUp .3s ease-out' }}>
      <div
        style={{
          position: 'relative',
          width: 'min(520px,100%)',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid rgba(120,210,225,0.25)',
          boxShadow: '0 0 0 6px rgba(90,200,220,0.04),0 24px 60px -24px rgba(0,0,0,0.8)',
          background: '#000',
        }}
      >
        <img src={img} alt="X-ray being analyzed" style={{ display: 'block', width: '100%', filter: 'contrast(1.05)' }} />
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            height: 3,
            background: 'linear-gradient(90deg,transparent,oklch(0.85 0.1 200),transparent)',
            boxShadow: '0 0 22px 4px rgba(90,210,230,0.5)',
            animation: 'shScan 1.5s cubic-bezier(.45,.05,.55,.95) infinite alternate',
            top: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(rgba(90,200,220,0.04) 1px,transparent 1px)',
            backgroundSize: '100% 8px',
            pointerEvents: 'none',
          }}
        />
      </div>
      <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: '#9fd6e0' }}>
        <span>{phaseText}</span>
        <span style={{ animation: 'shBlink 1s step-end infinite' }}>▌</span>
      </div>
      <div style={{ width: 'min(320px,80%)', height: 2, borderRadius: 2, background: 'rgba(140,190,210,0.15)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: '40%',
            borderRadius: 2,
            background: 'oklch(0.78 0.1 200)',
            animation: 'shShimmer 1.4s ease-in-out infinite',
          }}
        />
      </div>
      <button className="btn-cancel" onClick={onCancel}>{t.cancel}</button>
    </section>
  );
}
