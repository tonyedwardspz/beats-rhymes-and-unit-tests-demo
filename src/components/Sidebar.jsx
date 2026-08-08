import { NavLink } from 'react-router-dom';

// Add future pages here and they'll automatically appear in the flyout menu.
const NAV_ITEMS = [
  { to: '/', label: 'Lyric Transcriber', end: true },
  { to: '/joke', label: 'Joke' },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`sidebar-overlay${open ? ' open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`sidebar${open ? ' open' : ''}`}
        aria-hidden={!open}
        aria-label="Main menu"
      >
        <div className="sidebar-header">
          <div className="brand-mark" aria-label="Beats, Rhymes and Unit Tests">
            <span className="brand-mark-bar" aria-hidden="true" />
            <span className="brand-mark-line">BEATS</span>
            <span className="brand-mark-line">RHYMES</span>
            <span className="brand-mark-line">AND</span>
            <span className="brand-mark-line">UNIT TESTS</span>
            <span className="brand-mark-bar" aria-hidden="true" />
          </div>
          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            &times;
          </button>
        </div>
        <nav>
          <ul className="sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
