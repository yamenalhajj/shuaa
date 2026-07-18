import { useState } from 'react';
import { digits, fmtPercent, verdictText } from '../i18n';
import { VERDICT_COLORS } from '../theme';

const corner = (v, h) => ({
  position: 'absolute',
  [v]: 10,
  [h]: 10,
  width: 18,
  height: 18,
  [`border${v[0].toUpperCase() + v.slice(1)}`]: '2px solid rgba(120,210,225,0.6)',
  [`border${h[0].toUpperCase() + h.slice(1)}`]: '2px solid rgba(120,210,225,0.6)',
});

export default function ResultScreen({ t, lang, result, img, reveal, onNewScan, onGoHistory }) {
  const [hoverBar, setHoverBar] = useState(null);
  const ar = lang === 'ar';
  const vc = VERDICT_COLORS[result.label];

  // PNEUMONIA first, as designed — real independent probabilities from the API
  const probRows = ['PNEUMONIA', 'NORMAL'].map((key) => {
    const p = result.probabilities?.[key] ?? 0;
    const isWin = key === result.label;
    return { key, p, isWin };
  });

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(min(380px,100%),1fr))',
        gap: 'clamp(20px,3vw,36px)',
        alignItems: 'start',
        animation: 'shUp .3s ease-out',
      }}
    >
      <div
        style={{
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid rgba(140,190,210,0.2)',
          background: '#000',
          boxShadow: '0 24px 60px -24px rgba(0,0,0,0.8)',
        }}
      >
        {img ? (
          <img src={img} alt="Analyzed chest X-ray" style={{ display: 'block', width: '100%', filter: 'contrast(1.05)' }} />
        ) : (
          <div
            className="mono"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 320,
              color: '#4d5e6a',
              fontSize: 13,
              letterSpacing: 2,
            }}
          >
            CXR
          </div>
        )}
        <div style={corner('top', 'left')} />
        <div style={corner('top', 'right')} />
        <div style={corner('bottom', 'left')} />
        <div style={corner('bottom', 'right')} />
        <div
          dir="ltr"
          className="mono"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '10px 14px',
            background: 'linear-gradient(transparent,rgba(0,0,0,0.75))',
            fontSize: 11,
            letterSpacing: 1,
            color: '#9fd6e0',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>VGG16 · 224×224</span>
          <span>{new Date(result.createdAt).toLocaleTimeString('en-GB')}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div className="card">
          <div className="card-label">{t.verdictLabel}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 20px',
                borderRadius: 10,
                fontSize: 20,
                fontWeight: 700,
                color: vc.c,
                background: vc.bg,
                border: `1px solid ${vc.bd}`,
                animation: 'shGlow 1.5s ease-out 2',
              }}
            >
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: vc.c, boxShadow: `0 0 10px ${vc.c}` }} />
              {verdictText(result, lang)}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span dir="ltr" className="mono" style={{ fontSize: 34, fontWeight: 600, color: '#f2f7f8', letterSpacing: 1 }}>
                {fmtPercent(result.confidence, lang, reveal)}
              </span>
              <span style={{ fontSize: 12, color: '#7e939e' }}>{t.confidence}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-label">{t.breakdown}</div>
          {probRows.map(({ key, p, isWin }) => (
            <div
              key={key}
              className="prob-row"
              onMouseEnter={() => setHoverBar(key)}
              onMouseLeave={() => setHoverBar(null)}
              onClick={() => setHoverBar(key)}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: isWin ? VERDICT_COLORS[key].c : '#93a7b1' }}>{t[key]}</span>
                <span style={{ flex: 1 }} />
                <span
                  dir="ltr"
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: '#8fd8e2',
                    background: 'rgba(120,210,225,0.1)',
                    border: '1px solid rgba(120,210,225,0.25)',
                    borderRadius: 6,
                    padding: '2px 8px',
                    opacity: hoverBar === key ? 1 : 0,
                    transition: 'opacity .15s ease-out',
                  }}
                >
                  p = {p.toFixed(4)}
                </span>
                <span dir="ltr" className="mono" style={{ fontSize: 15, fontWeight: 600, color: '#dfe9ec' }}>
                  {fmtPercent(p, lang, reveal)}
                </span>
              </div>
              <div style={{ position: 'relative', height: 10, borderRadius: 6, background: 'rgba(140,190,210,0.1)', overflow: 'hidden' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    height: '100%',
                    borderRadius: 6,
                    background: isWin ? VERDICT_COLORS[key].c : 'rgba(140,170,185,0.45)',
                    boxShadow: isWin ? `0 0 14px ${VERDICT_COLORS[key].c}66` : 'none',
                    width: `${p * 100 * reveal}%`,
                    transition: 'width .2s ease-out',
                    overflow: 'hidden',
                    left: ar ? 'auto' : 0,
                    right: ar ? 0 : 'auto',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.35) 50%,transparent 70%)',
                      animation: isWin ? 'shShimmer 2.6s ease-in-out 0.8s infinite' : 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            padding: '16px 18px',
            borderRadius: 12,
            background: 'rgba(224,168,62,0.05)',
            border: '1px solid rgba(224,168,62,0.16)',
          }}
        >
          <span
            className="mono"
            style={{
              flex: 'none',
              marginTop: 2,
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
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#e0c690', marginBottom: 4 }}>{t.limitTitle}</div>
            <div style={{ fontSize: 13, lineHeight: 1.75, color: '#b3a382', textWrap: 'pretty' }}>{t.limitBody}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '10px 28px' }} onClick={onNewScan}>{t.newScan}</button>
          <button className="btn-ghost" onClick={onGoHistory}>{t.navHistory}</button>
        </div>
      </div>
    </section>
  );
}
