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

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <UpdateBanner />
      <BottomNav />
    </>
  );
}
