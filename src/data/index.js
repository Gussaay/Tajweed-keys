import { CONTENT } from './content';

const LESSONS = CONTENT.lessons;
const EXTRA = CONTENT.extra;
const PAST_BASE = CONTENT.past;
const FINALS = CONTENT.finals;

// The two final exams are stored once, as whole papers (finals.json).
// Their questions are also merged into the matching question-type tabs,
// and the papers themselves get their own "full paper" tab first.
const EXTRA_TYPES = {
  harf: { id: 'harf', title: 'المخرج والصفات', kind: 'reveal', desc: 'اذكري المخرج العام ثم الخاص ثم الصفات (ذات الضد أولًا ثم التي لا ضد لها).' },
  alaqa: { id: 'alaqa', title: 'العلاقات بين الحروف', kind: 'reveal', desc: 'حددي: ١) نوع العلاقة من المخرج والصفة (متماثلان، متجانسان، متقاربان، متباعدان)، ٢) حالة الحرفين (صغير، كبير، مطلق)، ٣) الحكم.' },
};
const CAT_FOR = { essay: 'def' };

function buildPast() {
  const types = PAST_BASE.map((t) => ({ ...t, items: [...t.items] }));
  for (const f of FINALS) {
    for (const q of f.qs) {
      const id = CAT_FOR[q.cat] || q.cat;
      let t = types.find((x) => x.id === id);
      if (!t) { t = { ...EXTRA_TYPES[id], items: [] }; types.push(t); }
      for (const it of q.items) {
        if (t.kind === 'tf') t.items.push([it[0], it[1], it[2], f.src]);
        else if (q.page) t.items.push([`${it[0]} <span class="stat">(${q.page})</span>`, it[1], f.src]);
        else t.items.push([it[0], it[1], f.src]);
      }
    }
  }
  const finals = { id: 'finals', title: 'الاختبارات النهائية كاملة', kind: 'paper',
    desc: 'ورقتا الاختبار النهائي لدفعتي أهل القرآن ١٣ و١٤ (٧٠ درجة، أ/ علا حمدى) كما وردتا، مع إجابة نموذجية لكل سؤال. حلّي الورقة كاملة ثم صححي نفسك.',
    items: FINALS };
  return [finals, ...types];
}

const PAST = buildPast();
export { LESSONS, EXTRA, PAST, FINALS };
export const lessonById = (id) => LESSONS.find((s) => s.id === id);
export const lessonsFor = (sel) => (sel === 'all' ? LESSONS : LESSONS.filter((s) => s.id === sel));

export const MODES = {
  learn: { path: '/learn', title: 'الشرح المبسّط', short: 'الشرح',
    sub: 'سبعة عشر درسًا من كراستك وملفات المستوى الأول والثاني: خريطة ذهنية لكل درس، الشرح، الجداول، مفاتيح الحفظ، وإجابات مقالية نموذجية.' },
  cards: { path: '/cards', title: 'البطاقات التعليمية', short: 'البطاقات',
    sub: 'اضغط البطاقة لقلبها، ثم قيّم نفسك. البطاقات التي لم تعرفها تعود إليك أولًا.' },
  mnem: { path: '/mnemonics', title: 'تدريب مفاتيح الحفظ', short: 'مفاتيح الحفظ',
    sub: 'الجملة مخفية: حاول تذكّرها من العنوان، ثم اضغط عليها لتظهر.' },
  quiz: { path: '/quiz', title: 'اختبر نفسك', short: 'اختبر نفسك',
    sub: 'أسئلة اختيار من متعدد لتثبيت القواعد قبل كتابة المقالي.' },
  essay: { path: '/essay', title: 'تدريب الإجابات المقالية', short: 'تدريب المقالي',
    sub: 'اكتب إجابتك بنفسك مع المؤقت، ثم اكشف الإجابة النموذجية وصحّح بقائمة النقاط.' },
  past: { path: '/past', title: 'الاختبارات السابقة', short: 'الاختبارات السابقة',
    sub: 'الاختباران النهائيان لدفعتي ١٣ و١٤ كاملين، وأسئلة ٥ اختبارات سابقة وتمارين مجموعة أهل القرآن ١٦، مرتبة حسب نوع السؤال. حاولي الإجابة أولًا ثم اكشفي الإجابة النموذجية.' },
  gallery: { path: '/gallery', title: 'الرسوم التوضيحية', short: 'الرسوم التوضيحية',
    sub: 'صور المخارج والصفات وعلاقات الحروف والمدود من ملفاتك. اضغط الصورة لتكبيرها.' },
};
