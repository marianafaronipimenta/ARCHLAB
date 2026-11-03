import type { ComponentType } from 'react';
import { HomeIcon, ModulesIcon, ProgressIcon, SettingsIcon, SimulatorIcon } from '../art/Icons';

export type NavId = 'home' | 'moduli' | 'simulatori' | 'progressi';

const ITEMS: { id: NavId; label: string; Icon: ComponentType<{ size?: number }> }[] = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'moduli', label: 'Moduli', Icon: ModulesIcon },
  { id: 'progressi', label: 'Progressi', Icon: ProgressIcon },
  { id: 'simulatori', label: 'Simulatori', Icon: SimulatorIcon },
];

interface SidebarProps {
  active: NavId;
  onNavigate: (id: NavId) => void;
  onOpenSettings: () => void;
}

/** Navigazione principale. Per ora porta alle sezioni della home; le pagine dei moduli arriveranno dopo. */
export function Sidebar({ active, onNavigate, onOpenSettings }: SidebarProps) {
  return (
    <nav className="sidebar" aria-label="Navigazione principale">
      <ul className="sidebar-list">
        {ITEMS.map(({ id, label, Icon }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={id === active ? 'sidebar-link is-active' : 'sidebar-link'}
              aria-current={id === active ? 'location' : undefined}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(id);
              }}
            >
              <Icon size={20} />
              <span>{label}</span>
            </a>
          </li>
        ))}
        <li>
          <button type="button" className="sidebar-link" onClick={onOpenSettings}>
            <SettingsIcon size={20} />
            <span>Impostazioni</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
