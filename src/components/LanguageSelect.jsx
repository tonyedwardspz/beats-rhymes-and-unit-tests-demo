const LANGUAGES = [
  { value: 'en-AU', label: 'Australia' },
  { value: 'en-CA', label: 'Canada' },
  { value: 'en-NZ', label: 'New Zealand' },
  { value: 'en-GB', label: 'United Kingdom' },
  { value: 'en-US', label: 'United States' },
];

export default function LanguageSelect({ value, onChange, disabled }) {
  return (
    <div className="center" id="div_language">
      <select
        id="select_language"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
