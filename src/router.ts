import { useEffect, useState } from 'react';
import { MODULES, SECTION_IDS, type ModuleId, type SectionId } from './data/modules';

/*
 * Routing minimo basato sull’hash, senza dipendenze:
 *   #/                         home
 *   #/modulo/<id>/<sezione>    sezione di un modulo (learn, practice, quiz, challenge, progress)
 *   #/modulo/<id>/learn/<pagina>  una pagina specifica della sezione Learn
 */

export type ModuleTab = SectionId | 'progress';
export type Route = { name: 'home'; anchor?: string } | { name: 'module'; moduleId: ModuleId; tab: ModuleTab; page?: string };

const TABS: ModuleTab[] = [...SECTION_IDS, 'progress'];

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'modulo' && parts[1]) {
    const mod = MODULES.find((m) => m.id === parts[1]);
    if (mod) {
      const tab = TABS.includes(parts[2] as ModuleTab) ? (parts[2] as ModuleTab) : 'learn';
      return tab === 'learn' && parts[3] ? { name: 'module', moduleId: mod.id, tab, page: parts[3] } : { name: 'module', moduleId: mod.id, tab };
    }
  }
  return { name: 'home', anchor: parts[0] && parts[0] !== 'modulo' ? parts[0] : undefined };
}

export const moduleHref = (id: ModuleId, tab: ModuleTab = 'learn', page?: string) =>
  `#/modulo/${id}/${tab}${tab === 'learn' && page ? `/${page}` : ''}`;
export const homeHref = (anchor?: string) => (anchor ? `#/${anchor}` : '#/');

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}
