import LESSONS from './lessons.json';
import EXTRA from './extra.json';
import PAST from './past.json';

export { LESSONS, EXTRA, PAST };
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
    sub: 'أسئلة ٥ اختبارات سابقة وتمارين مجموعة أهل القرآن ١٦، مرتبة حسب نوع السؤال. حاولي الإجابة أولًا ثم اكشفي الإجابة النموذجية.' },
  gallery: { path: '/gallery', title: 'الرسوم التوضيحية', short: 'الرسوم التوضيحية',
    sub: 'صور المخارج والصفات وعلاقات الحروف والمدود من ملفاتك. اضغط الصورة لتكبيرها.' },
};
