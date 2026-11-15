import { type Component, createSignal, onSettled, Show } from "solid-js";
import { MoonIcon, SunIcon } from "@lucide/solid";

export const ThemeSwitcher: Component = () => {

    const isSystemDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

    const isDark = () => localStorage.theme === "dark" || (!("theme" in localStorage) && isSystemDark());

    const [isThemeDark, setThemeDark] = createSignal(isDark);

    onSettled(() => {
        // On page load or when changing themes, best to add inline in `head` to avoid FOUC
        document.documentElement.classList.toggle("dark", isDark());
    });

    const toggleTheme = () => {
        if ("theme" in localStorage) {
            localStorage.removeItem('theme');
        } else {
            localStorage.theme = isDark() ? 'light' : 'dark';
        }
        const dark = isDark()
        document.documentElement.classList.toggle("dark", dark);
        setThemeDark(dark);
    }

    return (
        <button type="button" onClick={toggleTheme} class="hover:bg-surface-selecting rounded-full">
            <Show when={isThemeDark()} fallback={<SunIcon />}><MoonIcon /></Show>
        </button>
    )
}