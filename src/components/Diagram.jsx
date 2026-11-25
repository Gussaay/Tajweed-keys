// Redrawn illustrations: every diagram is data (src/data/diagrams.json) drawn
// by one of a few layouts in a single style. Text may hold <b> and
// <span class="ayah">. Each diagram replaces one scanned figure (key = file).
import { Html } from './ui';
import { LetterChips, MouthPicker, MaddMeter, MiniMadd } from './Interactive';
import { TeethArch, TongueTop } from './MouthParts';

const H = ({ html, as = 'div', className = '', style }) => (html ? <Html as={as} className={className} style={style} html={html} /> : null);

// Branch colours cycle through six hues (.hue-0 ... .hue-5 in index.css).
const hue = (i) => `hue-${i % 6}`;

function Tree({ node, depth = 0, i = 0 }) {
  return (
    <li className={depth === 1 ? hue(i) : ''}>
      <span className={`dg-node d${Math.min(depth, 3)}`}><Html as="span" html={node.l} />{node.x && <Html as="small" html={node.x} />}</span>
      {node.k?.length > 0 && <ul>{node.k.map((n, j) => <Tree key={j} node={n} depth={depth + 1} i={depth === 0 ? j : i} />)}</ul>}
    </li>
  );
}

// A mind map: a root bubble and its branches hanging from a spine.
function MindMap({ root, rows }) {
  if (rows.length === 1) {
    const [l, v] = rows[0];
    return (
      <div className="mm-key hue-0">
        <H className="mm-tag" html={l} />
        <H className="mm-text" html={v} />
      </div>
    );
  }
  return (
    <div className="mm">
      {root && <H className="mm-root" html={root} />}
      <ul className="mm-kids">
        {rows.map(([l, v], i) => (
          <li key={i} className={hue(i)}>
            <H className="mm-tag" html={l} />
            {v && <H className="mm-text" html={v} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Wheel({ center, items }) {
  const n = items.length;
  return (
    <div className="wheel">
      <svg viewBox="0 0 100 100" className="wheel-lines" aria-hidden="true">
        {items.map((_, i) => {
          const a = (i / n) * 2 * Math.PI - Math.PI / 2;
          return <line key={i} x1="50" y1="50" x2={50 + 38 * Math.cos(a)} y2={50 + 38 * Math.sin(a)} className={hue(i)} />;
        })}
        <circle cx="50" cy="50" r="38" className="wheel-ring" />
      </svg>
      <H className="wheel-hub" html={center} />
      {items.map((x, i) => {
        const a = (i / n) * 2 * Math.PI - Math.PI / 2;
        return <H key={i} className={`wheel-item ${hue(i)}`} html={x} style={{ left: `${50 + 38 * Math.cos(a)}%`, top: `${50 + 38 * Math.sin(a)}%` }} />;
      })}
    </div>
  );
}

function Body({ d, title }) {
  switch (d.t) {
    case 'def': // [[label, text], ...] drawn as a mind map
      return <MindMap rows={d.rows} />;
    case 'list':
      return (
        <ul className="dg-list">
          {d.items.map((x, i) => <H key={i} as="li" className={hue(i)} html={x} />)}
        </ul>
      );
    case 'table':
      return (
        <div className="dg-scroll">
          <table className="dg-table">
            {d.head && <thead><tr>{d.head.map((x, i) => <H key={i} as="th" html={x} />)}</tr></thead>}
            <tbody>{d.rows.map((r, i) => <tr key={i} className={hue(i)}>{r.map((x, j) => <H key={j} as={j === 0 && d.rowHead ? 'th' : 'td'} html={x} />)}</tr>)}</tbody>
          </table>
        </div>
      );
    case 'compare': // cols: [{h, items: []}]
      return (
        <div className={`dg-compare ${d.cols.length === 2 ? 'two' : ''}`} style={{ '--n': d.cols.length }}>
          {d.cols.map((c, i) => [
            i === 1 && d.cols.length === 2 && <span key="vs" className="dg-vs" aria-hidden="true">≠</span>,
            <div key={i} className={`dg-col ${hue(i)}`}>
              <H className="dg-col-h" html={c.h} />
              <ul>{c.items.map((x, j) => <H key={j} as="li" html={x} />)}</ul>
            </div>,
          ])}
        </div>
      );
    case 'tree':
      return <div className="dg-tree"><ul><Tree node={d.root} /></ul></div>;
    case 'radial': // center + items around it
      return d.items.length <= 8 ? <Wheel center={d.center} items={d.items} /> : (
        <div className="dg-radial">
          <H className="dg-hub" html={d.center} />
          <div className="dg-spokes">{d.items.map((x, i) => <H key={i} className={`dg-spoke ${hue(i)}`} html={x} />)}</div>
        </div>
      );
    case 'steps': // ordered ranks / stages: [{h, d}]
      return (
        <ol className={`dg-steps ${d.items.length > 1 ? 'stair' : ''}`}>
          {d.items.map((s, i) => (
            <li key={i} className={hue(i)} style={{ '--w': `${d.items.length > 1 ? 62 + (38 * i) / (d.items.length - 1) : 100}%` }}>
              <H className="dg-step-h" html={s.h} /><H className="dg-step-d" html={s.d} />
            </li>
          ))}
        </ol>
      );
    case 'letters': // groups: [{h, l: 'ء هـ ع', d}]
      return (
        <div className="dg-letters">
          {d.groups.map((g, i) => (
            <div key={i} className={`dg-lg ${hue(i)}`}>
              <LetterChips l={g.l} />
              <H className="dg-lg-h" html={g.h} />
              {g.n && <MiniMadd n={g.n} />}
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
          <MouthPicker hl={d.hl} marks={d.marks} pose={d.pose} lips={d.lips} nasal={d.nasal} air={d.air} label={d.label} at={d.at} />
          {d.rows && <MindMap rows={d.rows} />}
        </div>
      );
    case 'teeth': // the upper teeth arch, groups in hl
      return <TeethArch hl={d.hl} />;
    case 'tongue': // the tongue from above: hl zones, marks, teeth around it
      return <TongueTop hl={d.hl} marks={d.marks} teeth={d.teeth} />;
    case 'madd': // a haraka counter: opts [{l, n}], optional example w
      return <MaddMeter opts={d.opts} w={d.w} />;
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
            <Body d={p} title={d.title} />
          </div>
        ))}
      </div>
      {d.foot && <H className="dg-foot" html={d.foot} />}
    </figure>
  );
}
