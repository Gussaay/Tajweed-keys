import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Lesson from './pages/Lesson';
import Cards from './pages/Cards';
import Mnemonics from './pages/Mnemonics';
import Quiz from './pages/Quiz';
import Essay from './pages/Essay';
import Past from './pages/Past';
import Gallery from './pages/Gallery';
import Account from './pages/Account';
import UpdateBanner from './components/UpdateBanner';
import AdminAccess from './pages/AdminAccess';
import { SignInGate } from './pages/SignIn';
import { useAuth } from './lib/auth';
import { useAccess } from './lib/accessStore';
import { contentStatus, refreshContent, startContent } from './lib/content';
import { useExternal } from './lib/useExternal';

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  const { user, ready } = useAuth();
  const { openKey } = useAccess();
  const content = useExternal(contentStatus);
  const uid = user?.uid || null;
  useEffect(() => { if (ready) startContent(uid); }, [ready, uid]);
  // Load again whenever what this person may open changes (trial, subscription...).
  useEffect(() => { if (uid) refreshContent(); }, [uid, openKey]);
  // Signing in is required: nothing else shows until someone is signed in.
  if (!ready || !user) return <SignInGate ready={ready} />;
  if (content.status !== 'ready') return <ContentGate status={content.status} error={content.error} />;
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/:id" element={<Lesson />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/mnemonics" element={<Mnemonics />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/essay" element={<Essay />} />
        <Route path="/past" element={<Past />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/account" element={<Account />} />
        <Route path="/admin" element={<AdminAccess />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <UpdateBanner />
      <BottomNav />
    </>
  );
}

// Until the lessons have arrived from the database (first start on this phone).
function ContentGate({ status, error }) {
  return (
    <div className="gate">
      <div className="gate-top">
        <img src="icon-192.png" alt="" width="84" height="84" />
        <h1>مفاتيح التجويد</h1>
        <p>{status === 'error' ? 'تعذّر تحميل الدروس' : 'جارٍ تحميل الدروس…'}</p>
      </div>
      <div className="gate-body">
        <div className="card text-center">
          {status === 'error' ? (
            <>
              <p className="stat">{error} تحتاجين اتصالًا بالإنترنت أول مرة فقط، ثم تعمل الدروس دون إنترنت.</p>
              <button className="btn pri mt-3" onClick={refreshContent}>أعيدي المحاولة</button>
            </>
          ) : <div className="spinner" aria-label="جارٍ التحميل" />}
        </div>
      </div>
    </div>
  );
}
