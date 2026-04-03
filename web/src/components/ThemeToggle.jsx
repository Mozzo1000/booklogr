import { useState } from 'react'
import { useThemeMode } from "flowbite-react";
import { RiMoonFill, RiSunLine, RiSettings3Line } from "react-icons/ri";

const ThemeToggle = () => {
  const {mode, setMode} = useThemeMode()
  const [theme, setTheme] = useState(mode || "light");

  const themes = [
    {
      id: "dark",
      label: "Dark theme",
      icon: <RiMoonFill className="w-5 h-5 dark:text-white" />,
      previewClass: "bg-[#121212] border-slate-700",
    },
    {
      id: "light",
      label: "Light theme",
      icon: <RiSunLine className="w-5 h-5 dark:text-white" />,
      previewClass: "bg-[#FDFCF7] border-gray-200",
    },
    {
        id: "auto",
        label: "System",
        icon: <RiSettings3Line className="w-5 h-5 dark:text-white" />,
        isSystem: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {themes.map((t) => (
        <button key={t.id} onClick={() => {setTheme(t.id); setMode(t.id);}} className={`relative flex flex-col p-4 text-left border-2 rounded-xl transition-all outline-none 
            ${theme === t.id 
                ? "border-black dark:border-white ring-1 ring-black dark:ring-white" 
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}>
            <div className="flex items-center gap-2 mb-4">
                {t.icon}
                <span className="font-semibold text-gray-900 dark:text-white">{t.label}</span>
            </div>

            <div className={`relative mt-auto h-24 w-full rounded-lg border shadow-sm overflow-hidden ${t.previewClass || ''}`}>            
                {t.isSystem ? (
                    <div className="flex h-full w-full">
                    {/* Light Side */}
                    <div className="relative w-1/2 h-full bg-[#FDFCF7] p-2 flex flex-col gap-2 border-r border-gray-200">
                        <div className="h-2 w-full rounded bg-gray-300/50" />
                        <div className="h-8 w-full rounded bg-emerald-400/30" />
                        <div className="h-2 w-full rounded bg-gray-300/30" />
                    </div>
                    {/* Dark Side */}
                    <div className="relative w-1/2 h-full bg-[#121212] p-2 flex flex-col gap-2">
                        <div className="h-2 w-full rounded bg-gray-700/50" />
                        <div className="h-8 w-full rounded bg-emerald-500/20" />
                        <div className="h-2 w-full rounded bg-gray-700/30" />
                    </div>
                    </div>
                ) : (
                    <div className="p-2 flex flex-col gap-2 h-full">
                    <div className="h-2 w-1/3 rounded bg-gray-300/50" />
                    <div className="flex gap-2">
                        <div className="h-8 w-12 rounded bg-red-400/30" />
                        <div className="h-8 grow rounded bg-emerald-400/30" />
                        <div className="h-8 grow rounded bg-emerald-400/30" />
                    </div>
                    <div className="h-2 w-full rounded bg-gray-300/30" />
                    </div>
                )}
            </div>
        </button>
        ))}
    </div>
  );
};

export default ThemeToggle;