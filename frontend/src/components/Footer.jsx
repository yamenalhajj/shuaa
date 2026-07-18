// Fixed brand/creator credits; not part of the bilingual body copy.
const CREATORS = [
  {
    name: 'Yamen Alhaj',
    links: [
      { label: 'Website', href: 'https://yamenalhajj.com' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/yamen-alhaj-34198b295/' },
    ],
  },
  {
    name: 'Ahmed Nayef',
    links: [{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/ahmad-nayef-451a6641a/' }],
  },
];

function Creator({ name, links }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: '#8fa4ae' }}>{name}</span>
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 10.5 }}
        >
          {l.label}
        </a>
      ))}
    </span>
  );
}

export default function Footer({ t, onDemo }) {
  return (
    <footer className="mono site-footer" style={{ fontSize: 11, color: '#5f7280' }}>
      <span>{t.credit}</span>
      <span className="footer-credits">
        <span style={{ color: '#4d5e6a' }}>{t.createdBy}</span>
        <Creator {...CREATORS[0]} />
        <span style={{ color: '#3c4b54' }}>·</span>
        <Creator {...CREATORS[1]} />
      </span>
      <span style={{ flex: 1 }} />
      <span className="footer-demo">
        <span style={{ color: '#4d5e6a' }}>{t.demoLabel}</span>
        <button className="btn-demo" onClick={() => onDemo('service')}>{t.demoService}</button>
        <button className="btn-demo" onClick={() => onDemo('type')}>{t.demoType}</button>
        <button className="btn-demo" onClick={() => onDemo('size')}>{t.demoSize}</button>
      </span>
    </footer>
  );
}
