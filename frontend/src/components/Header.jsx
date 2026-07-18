import { digits } from '../i18n';

const navPalette = (active) => ({
  '--bg': active ? 'rgba(120,210,225,0.1)' : 'transparent',
  '--bd': active ? 'rgba(120,210,225,0.45)' : 'rgba(140,190,210,0.18)',
  '--c': active ? '#aee6ee' : '#93a7b1',
});

export default function Header({ t, lang, view, historyCount, onHome, onHistory, onToggleLang }) {
  const ar = lang === 'ar';
  const scanActive = view !== 'history';

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
        padding: '20px clamp(16px,4vw,48px)',
        borderBottom: '1px solid rgba(140,190,210,0.12)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, cursor: 'pointer' }} onClick={onHome}>
        <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: 0.5, color: '#f2f7f8' }}>شعاع</span>
        <span className="mono" style={{ fontSize: 10.5, letterSpacing: 2.5, color: '#7e939e', textTransform: 'uppercase' }}>
          Shu'a' · CXR
        </span>
      </div>
      <div style={{ height: 18, width: 2, background: 'linear-gradient(oklch(0.8 0.09 200),transparent)' }} />
      <span style={{ fontSize: 12.5, color: '#7e939e' }}>{t.brandSub}</span>
      <div style={{ flex: 1 }} />
      <nav style={{ display: 'flex', gap: 6 }}>
        <button className="nav-btn" style={navPalette(scanActive)} onClick={onHome}>
          {t.navScan}
        </button>
        <button
          className="nav-btn"
          style={{ ...navPalette(view === 'history'), display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={onHistory}
        >
          {t.navHistory}
          <span
            className="mono"
            style={{
              fontSize: 11,
              padding: '1px 7px',
              borderRadius: 20,
              background: 'rgba(120,210,225,0.12)',
              color: '#8fd8e2',
            }}
          >
            {digits(String(historyCount), lang)}
          </span>
        </button>
      </nav>
      <button className="lang-toggle" aria-label="Language toggle" onClick={onToggleLang}>
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: ar ? 3 : 41,
            width: 38,
            height: 30,
            borderRadius: 16,
            background: 'oklch(0.35 0.04 210)',
            border: '1px solid rgba(120,210,225,0.4)',
            transition: 'left .22s cubic-bezier(.3,1.3,.4,1)',
          }}
        />
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 41,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: ar ? '#e8fbfe' : '#677b85',
            transition: 'color .2s',
          }}
        >
          ع
        </span>
        <span
          className="mono"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 41,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11.5,
            fontWeight: 600,
            color: ar ? '#677b85' : '#e8fbfe',
            transition: 'color .2s',
          }}
        >
          EN
        </span>
      </button>
    </header>
  );
}
