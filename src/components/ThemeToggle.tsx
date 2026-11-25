"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const key = "nutriai-theme";
const eventName = "nutriai-theme-changed";

function subscribe(onChange: () => void) {
  window.addEventListener(eventName, onChange);
  return () => window.removeEventListener(eventName, onChange);
}

function isDark() {
  return document.documentElement.dataset.theme === "dark";
}

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  useEffect(() => {
    if (document.documentElement.dataset.theme) return;
    try {
      document.documentElement.dataset.theme = localStorage.getItem(key) === "dark" ? "dark" : "light";
    } catch {
      document.documentElement.dataset.theme = "light";
    }
    window.dispatchEvent(new Event(eventName));
  }, []);

  const label = dark ? "Ativar tema claro" : "Ativar tema escuro";
  const Icon = dark ? Sun : Moon;

  function changeTheme() {
    const theme = isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(key, theme);
    } catch {
      // The theme still works during this visit without storage.
    }
    window.dispatchEvent(new Event(eventName));
  }

  return (
    <button type="button" title={label} aria-label={label} onClick={changeTheme}
      className="inline-grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
