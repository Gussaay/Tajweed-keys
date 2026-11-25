// Illustrations from the course material: a thumbnail grid that opens a
// full-screen viewer (tap the sides or swipe to move, tap the X to close).
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { arN } from '../lib/util';

export const figSrc = (name) => `${import.meta.env.BASE_URL}figs/${name}`;

export function Lightbox({ items, index, onClose, onIndex }) {
  const [x0, setX0] = useState(null);
  const go = (d) => onIndex((index + d + items.length) % items.length);
  useEffect(() => {
    const key = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') go(1);
      if (e.key === 'ArrowRight') go(-1);
    };
    window.addEventListener('keydown', key);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = ''; };
  });
  const [name, cap, tag] = items[index];
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col pt-safe pb-safe" role="dialog" aria-modal="true" aria-label={cap}
      onTouchStart={(e) => setX0(e.touches[0].clientX)}
      onTouchEnd={(e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(dx > 0 ? 1 : -1); setX0(null); }}>
      <div className="flex items-center gap-2 px-3 py-2 text-white">
        <button className="p-2 rounded-full hover:bg-white/10" onClick={onClose} aria-label="إغلاق"><X size={24} /></button>
        <span className="font-ui text-sm flex-1 min-w-0 truncate">{tag ? `${tag} · ` : ''}{arN(index + 1)} / {arN(items.length)}</span>
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center px-2 relative">
        <img src={figSrc(name)} alt={cap} className="max-h-full max-w-full object-contain rounded-lg bg-white" />
        <button className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white" onClick={() => go(-1)} aria-label="السابق"><ChevronRight size={26} /></button>
        <button className="absolute left-1 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white" onClick={() => go(1)} aria-label="التالي"><ChevronLeft size={26} /></button>
      </div>
      <p className="text-white text-center font-ui text-[15px] px-4 py-3 leading-relaxed">{cap}</p>
    </div>
  );
}

export function FigureGrid({ items }) {
  const [open, setOpen] = useState(null);
  if (!items?.length) return null;
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map(([name, cap], i) => (
          <button key={name} onClick={() => setOpen(i)} className="text-right rounded-xl overflow-hidden border transition active:scale-[0.98]" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}>
            <span className="block aspect-[4/3] bg-white">
              <img src={figSrc(name)} alt="" loading="lazy" className="w-full h-full object-contain" />
            </span>
            <span className="block px-2 py-1.5 text-[12.5px] leading-snug font-ui line-clamp-2">{cap}</span>
          </button>
        ))}
      </div>
      {open !== null && <Lightbox items={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}
