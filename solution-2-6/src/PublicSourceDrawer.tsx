import { Copy, ExternalLink, FileSearch, Link2, X } from 'lucide-react'
import { publicRouters, publicStatusLabels } from './publicCheckData'
import type { PublicCheckResult } from './publicCheckData'

type PublicSourceDrawerProps = {
  result: PublicCheckResult
  onClose: () => void
  onCopied: () => void
}

export function PublicSourceDrawer({ result, onClose, onCopied }: PublicSourceDrawerProps) {
  const router = publicRouters.find((item) => item.key === result.router)

  const copyProvenance = async () => {
    await navigator.clipboard?.writeText(`${result.authority}\n${result.url}\n${result.retrievedAt}`)
    onCopied()
  }

  return (
    <aside className="public-source-drawer" role="dialog" aria-label={`Public source: ${result.title}`}>
      <header>
        <div>
          <span>REPLAY SAMPLE</span>
          <h2>{result.title}</h2>
          <small>{result.entity}</small>
        </div>
        <button type="button" onClick={onClose} aria-label="Close public source"><X size={17} /></button>
      </header>

      <div className="public-drawer-body">
        <div className="public-drawer-tags">
          <span className={`drawer-status ${result.status}`}>{publicStatusLabels[result.status]}</span>
          <span>{result.tier} · {result.authority}</span>
        </div>

        <section>
          <h3><FileSearch size={13} /> Query</h3>
          <code>{result.query}</code>
        </section>

        <section>
          <h3>Fixture result</h3>
          <p>{result.snippet}</p>
          <div className="not-live-note">Not a live response.</div>
        </section>

        <section>
          <h3><Link2 size={13} /> Dossier link</h3>
          <p>{result.dossierLink}</p>
        </section>

        <section className="public-provenance">
          <h3>Provenance</h3>
          <dl>
            <div><dt>Router</dt><dd>{router?.label}</dd></div>
            <div><dt>Authority</dt><dd>{result.tier}</dd></div>
            <div><dt>Fixture score</dt><dd>{result.score.toFixed(2)}</dd></div>
            <div><dt>URL</dt><dd>{result.url}</dd></div>
            <div><dt>Retrieved at</dt><dd>{result.retrievedAt}</dd></div>
          </dl>
        </section>
      </div>

      <footer>
        <button type="button" onClick={copyProvenance}><Copy size={13} /> Copy provenance</button>
        <a href={result.url} target="_blank" rel="noreferrer">Authority site <ExternalLink size={12} /></a>
      </footer>
    </aside>
  )
}
