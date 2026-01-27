import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-900 shadow-sm ring-1 ring-slate-200/80 transition-all hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:bg-slate-800 dark:text-white dark:shadow-none dark:ring-slate-700/50 dark:hover:bg-slate-700 dark:focus:ring-slate-800 dark:focus:ring-offset-slate-900"
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <div className="relative h-5 w-5 overflow-hidden">
        <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${theme === 'dark' ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
          <FiSun className="h-5 w-5 text-yellow-500" />
        </div>
        <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${theme === 'dark' ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <FiMoon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5 dark:ring-white/10" />
    </button>
  );
}
