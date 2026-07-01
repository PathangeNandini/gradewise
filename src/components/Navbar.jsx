import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="gw-nav">
      <div className="gw-nav__inner">
        <div className="gw-nav__brand">
          <div className="gw-nav__logo">G</div>
          <span className="gw-nav__name">Grade<span>Wise</span></span>
        </div>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}