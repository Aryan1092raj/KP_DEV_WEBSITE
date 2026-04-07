export default function ThemeToggle({ darkMode, onToggle }) {
  return (
    <button
      className="btn-secondary !px-4 !py-2"
      onClick={onToggle}
      type="button"
    >
      {darkMode ? "Light mode" : "Dark mode"}
    </button>
  );
}
