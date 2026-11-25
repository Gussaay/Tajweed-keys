// Redrawn illustrations: every diagram is data (src/data/diagrams.json) drawn
// by one of a few layouts in a single style. Text may hold <b> and
// <span class="ayah">. Each diagram replaces one scanned figure (key = file).
import { Html } from './ui';
import Mouth from './Mouth';

const H = ({ html, as = 'div', className = '' }) => (html ? <Html as={as} className={className} html={html} /> : null);

function Tree({ node, depth = 0 }) {
  return (
    <li>
      <span className={`dg-node d${Math.min(depth, 3)}`}><Html as="span" html={node.l} />{node.x && <Html as="small" html={node.x} />}</span>
      {node.k?.length > 0 && <ul>{node.k.map((n, i) => <Tree key={i} node={n} depth={depth + 1} />)}</ul>}
    </li>
  );
}

function Body({ d }) {
  switch (d.t) {
    case 'def': // [[label, text], ...]
      return (
        <dl className="dg-def">
          {d.rows.map(([l, v], i) => (<div key={i}><H as="dt" html={l} /><H as="dd" html={v} /></div>))}
        </dl>
      );
    case 'list':
      return <ul className="dg-list">{d.items.map((x, i) => <H key={i} as="li" html={x} />)}</ul>;
    case 'table':
      return (
        <div className="dg-scroll">
          <table className="dg-table">
            {d.head && <thead><tr>{d.head.map((x, i) => <H key={i} as="th" html={x} />)}</tr></thead>}
            <tbody>{d.rows.map((r, i) => <tr key={i}>{r.map((x, j) => <H key={j} as={j === 0 && d.rowHead ? 'th' : 'td'} html={x} />)}</tr>)}</tbody>
          </table>
        </div>
      );
    case 'compare': // cols: [{h, items: []}]
      return (
        <div className="dg-compare" style={{ '--n': d.cols.length }}>
          {d.cols.map((c, i) => (
            <div key={i} className="dg-col">
              <H className="dg-col-h" html={c.h} />
              <ul>{c.items.map((x, j) => <H key={j} as="li" html={x} />)}</ul>
            </div>
          ))}
        </div>
      );
    case 'tree':
      return <div className="dg-tree"><ul><Tree node={d.root} /></ul></div>;
    case 'radial': // center + items around it
      return (
        <div className="dg-radial">
          <H className="dg-hub" html={d.center} />
          <div className="dg-spokes">{d.items.map((x, i) => <H key={i} className="dg-spoke" html={x} />)}</div>
        </div>
      );
    case 'steps': // ordered ranks / stages: [{h, d}]
      return (
        <ol className="dg-steps">
          {d.items.map((s, i) => (<li key={i}><H className="dg-step-h" html={s.h} /><H className="dg-step-d" html={s.d} /></li>))}
        </ol>
      );
    case 'letters': // groups: [{h, l: 'ء هـ ع', d}]
      return (
        <div className="dg-letters">
          {d.groups.map((g, i) => (
            <div key={i} className="dg-lg">
              <div className="dg-lchips">{g.l.split(' ').filter(Boolean).map((c, j) => <span key={j}>{c}</span>)}</div>
              <H className="dg-lg-h" html={g.h} />
              <H className="dg-lg-d" html={g.d} />
            </div>
          ))}
        </div>
      );
    case 'words': // examples: [{w, d}]
      return (
        <div className="dg-words">
          {d.items.map((x, i) => (<div key={i}><H className="ayah" html={x.w} /><H className="dg-wd" html={x.d} /></div>))}
        </div>
      );
    case 'mouth':
      return (
        <div className="dg-mouth">
          <Mouth hl={d.hl} marks={d.marks} />
          {d.rows && <dl className="dg-def">{d.rows.map(([l, v], i) => (<div key={i}><H as="dt" html={l} /><H as="dd" html={v} /></div>))}</dl>}
        </div>
      );
    default:
      return null;
  }
}

export default function Diagram({ d, compact = false }) {
  if (!d) return null;
  const parts = d.parts || [d];
  return (
    <figure className={`dg ${compact ? 'compact' : ''}`}>
      <figcaption className="dg-title"><Html as="span" html={d.title} />{d.sub && <Html as="small" html={d.sub} />}</figcaption>
      <div className="dg-body">
        {parts.map((p, i) => (
          <div key={i} className="dg-part">
            {p !== d && p.h && <H className="dg-part-h" html={p.h} />}
            <Body d={p} />
          </div>
        ))}
      </div>
      {d.foot && <H className="dg-foot" html={d.foot} />}
    </figure>
  );
}
