import { site } from "@/content/site";

export function Footer() {
  const [a, b] = site.wordmark;
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="col-a">
            <p className="lead" style={{ marginBottom: 24 }}>
              Websites that make your offer clear. Systems that make the work easier.
            </p>
            <a href="/#contact" className="btn btn-primary">
              {site.hero.primaryCta} <span className="arr" aria-hidden="true">→</span>
            </a>
          </div>
          <nav className="col-b" aria-label="Footer">
            <h3 className="mono">Index</h3>
            <ul>
              {site.nav.map((n) => (
                <li key={n.href}><a className="link-u" href={n.href}>{n.label}</a></li>
              ))}
            </ul>
          </nav>
          <div className="col-c">
            <h3 className="mono">Contact</h3>
            <ul>
              <li><a className="link-u" href={`mailto:${site.email}`} style={{ overflowWrap: "anywhere" }}>{site.email}</a></li>
              {site.links.map((l) => (
                <li key={l.href}><a className="link-u" href={l.href} rel="me noopener" target="_blank">{l.label}</a></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="wrap" aria-hidden="true">
        <div className="footer-mark" data-reveal="fade">
          <span>{a}</span><span className="span" /><span>{b}</span>
        </div>
      </div>
      <div className="wrap">
        <div className="footer-base mono-sm">
          <span>© {year} {site.name}</span>
          <span>Designed &amp; built independently</span>
          <a href="#main" className="link-u">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
