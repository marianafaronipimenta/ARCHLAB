import { ChipMark, UserIcon } from '../art/Icons';
import { ProgressBar } from '../ui/ProgressBar';

interface HeaderProps {
  level: number;
  xpInto: number;
  xpNeeded: number;
}

export function Header({ level, xpInto, xpNeeded }: HeaderProps) {
  return (
    <header className="topbar">
      <a className="brand" href="#home" aria-label="ARCHLAB, torna all’inizio">
        <span className="brand-mark">
          <ChipMark size={34} />
        </span>
        <span className="brand-text">
          <span className="brand-name">
            ARCH<span>LAB</span>
          </span>
          <span className="brand-sub">Computer Architecture II</span>
        </span>
      </a>

      <div className="profile" aria-label="Profilo dello studente">
        <span className="profile-avatar" aria-hidden="true">
          <UserIcon size={22} />
        </span>
        <span className="profile-body">
          <span className="profile-name">Studente</span>
          <span className="profile-level">Livello {level}</span>
          <ProgressBar size="sm" value={xpInto / xpNeeded} label={`XP verso il livello ${level + 1}`} valueText={undefined} />
        </span>
        <span className="profile-xp">
          {xpInto}/{xpNeeded} XP
        </span>
      </div>
    </header>
  );
}
