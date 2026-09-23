/// <reference types="vite/client" />

// Stempel wersji wstrzykiwany przy buildzie przez `define` w vite.config.ts.
// Porównywany z polem `version` z /version.json — patrz useAppVersionCheck.
declare const __NB_APP_VERSION__: string;
