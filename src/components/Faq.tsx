import { faq } from "@/content/services";

export function Faq() {
  return (
    <section className="sec sec-light faq" aria-labelledby="faq-title">
      <div className="wrap faq-grid">
        <div className="faq-side">
          <p className="mono-sm faq-k">FAQ</p>
          <h2 id="faq-title" className="display-3">Good questions to ask first.</h2>
        </div>
        <div className="faq-list">
          {faq.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>
                <span>{f.q}</span>
                <span className="faq-icon" aria-hidden="true" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
