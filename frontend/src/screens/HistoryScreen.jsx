import { fmtPercent, verdictText } from '../i18n';
import { VERDICT_COLORS } from '../theme';

export default function HistoryScreen({ t, lang, items, thumbs, onOpen, onClear }) {
  const ar = lang === 'ar';

  return (
    <section style={{ animation: 'shUp .3s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{t.histTitle}</h2>
        <span style={{ flex: 1 }} />
        {items.length > 0 && (
          <button className="btn-danger-ghost" onClick={onClear}>{t.histClear}</button>
        )}
      </div>

      {items.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item) => {
            const vc = VERDICT_COLORS[item.label];
            const thumb = thumbs[item.id];
            return (
              <div key={item.id} className="history-row" role="button" tabIndex={0} onClick={() => onOpen(item)}>
                <div className="hist-main">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt="X-ray thumbnail"
                      style={{
                        flex: 'none',
                        width: 56,
                        height: 56,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '1px solid rgba(140,190,210,0.2)',
                        background: '#000',
                      }}
                    />
                  ) : (
                    <div
                      className="mono"
                      style={{
                        flex: 'none',
                        width: 56,
                        height: 56,
                        borderRadius: 8,
                        border: '1px solid rgba(140,190,210,0.2)',
                        background: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        letterSpacing: 1,
                        color: '#4d5e6a',
                      }}
                    >
                      CXR
                    </div>
                  )}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '5px 13px',
                      borderRadius: 8,
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: vc.c,
                      background: vc.bg,
                      border: `1px solid ${vc.bd}`,
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: vc.c }} />
                    {verdictText(item, lang)}
                  </span>
                  <span dir="ltr" className="mono" style={{ fontSize: 14.5, fontWeight: 600, color: '#dfe9ec' }}>
                    {fmtPercent(item.confidence, lang)}
                  </span>
                </div>
                <div className="hist-meta">
                  <span style={{ fontSize: 12.5, color: '#7e939e', whiteSpace: 'nowrap' }}>
                    {new Date(item.createdAt).toLocaleString(ar ? 'ar-EG' : 'en-GB', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: 12,
                      color: '#8fd8e2',
                      border: '1px solid rgba(120,210,225,0.25)',
                      borderRadius: 7,
                      padding: '5px 12px',
                      minHeight: 20,
                      display: 'flex',
                      alignItems: 'center',
                      flex: 'none',
                    }}
                  >
                    {t.open}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: '56px 24px',
            borderRadius: 14,
            border: '1.5px dashed rgba(140,190,210,0.2)',
            textAlign: 'center',
            color: '#7e939e',
            fontSize: 14.5,
          }}
        >
          {t.histEmpty}
        </div>
      )}
    </section>
  );
}
