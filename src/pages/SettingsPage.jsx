import PageTitle from '../components/PageTitle.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function SettingsPage() {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <>
      <PageTitle>Settings</PageTitle>

      <div className="settings-form">
        <label className="settings-row" htmlFor="dark-mode-toggle">
          <span className="settings-row-text">
            <span className="settings-row-title">Dark mode</span>
            <span className="settings-row-desc">
              Switch the site between light and dark appearance.
            </span>
          </span>
          <input
            id="dark-mode-toggle"
            className="settings-toggle"
            type="checkbox"
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
        </label>
      </div>
    </>
  );
}
