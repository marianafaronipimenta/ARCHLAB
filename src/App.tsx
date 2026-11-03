import { useEffect, useRef, useState } from 'react';
import { Header } from './components/layout/Header';
import { SettingsDialog } from './components/layout/SettingsDialog';
import { Sidebar, type NavId } from './components/layout/Sidebar';
import { homeHref, useRoute } from './router';
import { HomeScreen } from './screens/HomeScreen';
import { ModuleScreen } from './screens/ModuleScreen';
import { usePreferences } from './state/hooks';
import { levelInfo, totalXp } from './state/progress';
import { useProgressStore } from './state/store';

const SECTIONS: NavId[] = ['home', 'moduli', 'progressi', 'simulatori'];

export default function App() {
  const route = useRoute();
  const { progress } = useProgressStore();
  const [prefs, setPrefs] = usePreferences();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [active, setActive] = useState<NavId>('home');
  const level = levelInfo(totalXp(progress));
  // Dopo un clic nella sidebar, lo scroll-spy resta fermo finché lo scorrimento non è finito.
  const lockUntil = useRef(0);
  const onHome = route.name === 'home';

  const scrollTo = (id: NavId) => {
    const el = document.getElementById(id);
    if (!el) return;
    lockUntil.current = Date.now() + 1200;
    setActive(id);
    el.scrollIntoView({ behavior: prefs.calmMode ? 'auto' : 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
  };

  // Arrivando sulla home con un’ancora (es. «Tutti i moduli»), scorre alla sezione.
  useEffect(() => {
    if (route.name !== 'home') return;
    const anchor = SECTIONS.find((s) => s === route.anchor);
    if (anchor) requestAnimationFrame(() => scrollTo(anchor));
    else window.scrollTo({ top: 0 });
  }, [route]);

  // Scroll-spy: evidenzia nella sidebar la sezione visibile della home.
  useEffect(() => {
    if (!onHome) return;
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
  }, [onHome]);

  const navigate = (id: NavId) => {
    if (onHome) {
      window.history.replaceState(null, '', homeHref(id === 'home' ? undefined : id));
      scrollTo(id);
    } else {
      window.location.hash = homeHref(id === 'home' ? undefined : id);
    }
  };

  return (
    <div className="app">
      <a className="skip-link" href="#main" onClick={(e) => {
        e.preventDefault();
        document.getElementById('main')?.focus();
      }}>
        Vai al contenuto
      </a>
      <Header level={level.level} xpInto={level.into} xpNeeded={level.needed} />
      <div className="layout">
        <Sidebar active={onHome ? active : 'moduli'} onNavigate={navigate} onOpenSettings={() => setSettingsOpen(true)} />
        <main id="main" className="main" tabIndex={-1}>
          {route.name === 'module' ? (
            <ModuleScreen moduleId={route.moduleId} tab={route.tab} page={route.page} />
          ) : (
            <HomeScreen progress={progress} />
          )}
        </main>
      </div>
      <SettingsDialog open={settingsOpen} prefs={prefs} onChange={setPrefs} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
