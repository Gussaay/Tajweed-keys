// The illustrations of a lesson section, each drawn as a diagram.
import { DIAGRAMS } from '../data';
import Diagram from './Diagram';

export function FigureSet({ items }) {
  const list = (items || []).filter(([n]) => DIAGRAMS[n]);
  if (!list.length) return null;
  return list.map(([n]) => <Diagram key={n} d={DIAGRAMS[n]} />);
}
