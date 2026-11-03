import { useEffect, useRef, useState } from 'react';
import { Header } from './components/layout/Header';
import { SettingsDialog } from './components/layout/SettingsDialog';
import { Sidebar, type NavId } from './components/layout/Sidebar';
import { HomeScreen } from './screens/HomeScreen';
import { usePreferences, useProgress } from './state/hooks';
import { levelInfo, totalXp } from './state/progress';

const SECTIONS: NavId[] = ['home', 'moduli', 'progressi', 'simulatori'];

export default function App() {
  const progress = useProgress();
  const [prefs, setPrefs] = usePreferences();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [active, setActive] = useState<NavId>('home');
  const level = levelInfo(totalXp(progress));
  // Dopo un clic nella sidebar, lo scroll-spy resta fermo finché lo scorrimento non è finito.
  const lockUntil = useRef(0);

  // Evidenzia nella sidebar la sezione visibile.
  useEffect(() => {
    const els = SECTIONS.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => e !== null);
    const io = new IntersectionObserver(
      (entries) => {
        if (Date.now() < lockUntil.current) return;
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        if (atBottom) return setActive(SECTIONS[SECTIONS.length - 1]);
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id as NavId);
      },
      { rootMargin: '-35% 0px -55% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  const navigate = (id: NavId) => {
    setActive(id);
    lockUntil.current = Date.now() + 1200;
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: prefs.calmMode ? 'auto' : 'smooth', block: 'start' });
    el?.focus({ preventScroll: true });
  };

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Vai al contenuto
      </a>
      <Header level={level.level} xpInto={level.into} xpNeeded={level.needed} />
      <div className="layout">
        <Sidebar active={active} onNavigate={navigate} onOpenSettings={() => setSettingsOpen(true)} />
        <main id="main" className="main" tabIndex={-1}>
          <HomeScreen progress={progress} />
        </main>
      </div>
      <SettingsDialog open={settingsOpen} prefs={prefs} onChange={setPrefs} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
