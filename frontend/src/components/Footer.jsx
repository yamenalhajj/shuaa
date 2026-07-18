export default function Footer({ t, onDemo }) {
  return (
    <footer
      className="mono"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        flexWrap: 'wrap',
        padding: '16px clamp(16px,4vw,48px)',
        borderTop: '1px solid rgba(140,190,210,0.1)',
        fontSize: 11,
        color: '#5f7280',
      }}
    >
      <span>{t.credit}</span>
      <span style={{ flex: 1 }} />
      <span style={{ color: '#4d5e6a' }}>{t.demoLabel}</span>
      <button className="btn-demo" onClick={() => onDemo('service')}>{t.demoService}</button>
      <button className="btn-demo" onClick={() => onDemo('type')}>{t.demoType}</button>
      <button className="btn-demo" onClick={() => onDemo('size')}>{t.demoSize}</button>
    </footer>
  );
}
