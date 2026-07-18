import { ERR_CODES } from '../i18n';

// Maps an app error ({kind, status?, message?}) to the designed error card.
// Server errors show the backend's actual message verbatim — never a
// generic fallback that hides what went wrong.
function describe(error, t) {
  switch (error.kind) {
    case 'type':
      return { title: t.errTypeTitle, msg: t.errTypeMsg, code: ERR_CODES.type };
    case 'size':
      return { title: t.errSizeTitle, msg: t.errSizeMsg, code: ERR_CODES.size };
    case 'service':
      return { title: t.errServiceTitle, msg: t.errServiceMsg, code: ERR_CODES.service };
    case 'network':
      return { title: t.errServiceTitle, msg: t.errServiceMsg, code: 'ERR · NETWORK_UNREACHABLE' };
    case 'server': {
      const title =
        error.status === 400 || error.status === 415
          ? t.errTypeTitle
          : error.status === 413
            ? t.errSizeTitle
            : t.errServiceTitle;
      return { title, msg: error.message, code: `ERR ${error.status}` };
    }
    default:
      return { title: t.errServiceTitle, msg: t.errServiceMsg, code: 'ERR' };
  }
}

export default function ErrorScreen({ t, error, onRetry, onHome }) {
  const { title, msg, code } = describe(error, t);

  return (
    <section style={{ display: 'flex', justifyContent: 'center', animation: 'shUp .3s ease-out' }}>
      <div
        style={{
          width: 'min(560px,100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          textAlign: 'center',
          padding: 'clamp(36px,6vh,56px) 28px',
          borderRadius: 16,
          background: '#11181e',
          border: '1px solid rgba(224,120,90,0.25)',
        }}
      >
        <div
          className="mono"
          style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            border: '1.5px solid oklch(0.72 0.13 45)',
            color: 'oklch(0.78 0.13 45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            fontWeight: 600,
            background: 'rgba(226,130,90,0.08)',
          }}
        >
          !
        </div>
        <div style={{ fontSize: 21, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: '#93a7b1', maxWidth: 420, textWrap: 'pretty' }}>{msg}</div>
        <div dir="ltr" className="mono" style={{ fontSize: 11, letterSpacing: 1, color: '#677b85' }}>{code}</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 }}>
          <button className="btn-primary" style={{ padding: '10px 28px' }} onClick={onRetry}>{t.retry}</button>
          <button className="btn-ghost" onClick={onHome}>{t.back}</button>
        </div>
      </div>
    </section>
  );
}
