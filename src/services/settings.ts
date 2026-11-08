import { createStore, snapshot } from "solid-js";

interface JatSettings {
    pbSelectedDraw?: boolean;
    registered?: boolean;
}

const defaultSettings = {
    pbSelectedDraw: true,
    registered: false,
} as const;

const [setting, _setSetting] = createStore<JatSettings>(
    () => localStorage.jatSettings ? JSON.parse(localStorage.jatSettings) : defaultSettings,
    defaultSettings,
    { name: 'stSettings', shallow: true }
);

const changeSetting = (key: keyof JatSettings, value: boolean) => {
    _setSetting((draft) => {
        draft[key] = value;
        localStorage.jatSettings =  JSON.stringify(snapshot(draft));
    })
}

export { setting, changeSetting };
