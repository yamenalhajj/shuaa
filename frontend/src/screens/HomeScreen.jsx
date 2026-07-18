export default function HomeScreen({ t, drag, fileRef, onPick, onFileChange, onSample, dragHandlers }) {
  return (
    <section style={{ animation: 'shUp .3s ease-out' }}>
      <h1
        style={{
          margin: '0 0 10px',
          fontSize: 'clamp(24px,3.2vw,34px)',
          fontWeight: 700,
          lineHeight: 1.35,
          maxWidth: 760,
          textWrap: 'pretty',
        }}
      >
        {t.heroTitle}
      </h1>
      <p style={{ margin: '0 0 36px', fontSize: 15, lineHeight: 1.8, color: '#93a7b1', maxWidth: 680, textWrap: 'pretty' }}>
        {t.heroSub}
      </p>

      <div
        className="drop-zone"
        role="button"
        tabIndex={0}
        onClick={onPick}
        {...dragHandlers}
        style={{
          '--bd': drag ? 'oklch(0.8 0.11 200)' : 'rgba(140,190,210,0.3)',
          '--bg': drag ? 'rgba(90,200,220,0.09)' : 'rgba(255,255,255,0.015)',
          '--scale': drag ? 1.015 : 1,
        }}
      >
        <div
          className="mono"
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: '1.5px solid rgba(120,210,225,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            color: 'oklch(0.8 0.09 200)',
            background: 'rgba(90,200,220,0.06)',
            transform: `translateY(${drag ? -5 : 0}px)`,
            transition: 'transform .2s cubic-bezier(.3,1.4,.4,1)',
          }}
        >
          ↑
        </div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>{drag ? t.dropActive : t.dropTitle}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className="btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onPick();
            }}
          >
            {t.choose}
          </button>
          <span style={{ fontSize: 13, color: '#7e939e' }}>{t.dropOr}</span>
          <button
            className="btn-ghost"
            style={{ padding: '10px 22px' }}
            onClick={(e) => {
              e.stopPropagation();
              onSample();
            }}
          >
            {t.sample}
          </button>
        </div>
        <div className="mono" style={{ fontSize: 11.5, letterSpacing: 0.5, color: '#677b85' }}>{t.fileHint}</div>
        <input type="file" accept="image/jpeg,image/png" onChange={onFileChange} ref={fileRef} style={{ display: 'none' }} />
      </div>

      <div
        style={{
          marginTop: 22,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          borderRadius: 10,
          background: 'rgba(224,168,62,0.06)',
          border: '1px solid rgba(224,168,62,0.18)',
        }}
      >
        <span
          className="mono"
          style={{
            flex: 'none',
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: '1.5px solid #d8a84a',
            color: '#d8a84a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          !
        </span>
        <span style={{ fontSize: 13, color: '#c8b48c', lineHeight: 1.6 }}>{t.disclaimerStrip}</span>
      </div>
    </section>
  );
}
