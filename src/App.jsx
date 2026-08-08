import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import PunchlinePage from './pages/PunchlinePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import SpeechRecognitionPage from './pages/SpeechRecognitionPage.jsx';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the flyout menu when the Escape key is pressed.
  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <ThemeProvider>
      <div className="layout">
        <header className="topbar">
          <button
            type="button"
            className="hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </header>

        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

        <main className="content">
          <Routes>
            <Route path="/" element={<SpeechRecognitionPage />} />
            <Route path="/punchline" element={<PunchlinePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
}
