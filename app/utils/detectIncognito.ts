// /app/utils/detectIncognito.ts

export interface IncognitoResult {
  isPrivate: boolean;
  browser: string;
}

/**
 * Robust cross-browser incognito / private mode detector.
 * Works on:
 * - Chrome / Chromium
 * - Firefox
 * - Safari (iOS + macOS)
 * - Edge
 * - Brave
 * - Opera
 * - Chromium forks
 */
export default function detectIncognito(): Promise<IncognitoResult> {
  return new Promise((resolve) => {
    const yes = (browser = "unknown") =>
      resolve({ isPrivate: true, browser });
    const no = (browser = "unknown") =>
      resolve({ isPrivate: false, browser });

    // Guard: window undefined during SSR
    if (typeof window === "undefined") {
      return no("ssr");
    }

    // -----------------------------------------------------
    // 1. Chrome / Chromium / Edge / Opera / Brave
    // -----------------------------------------------------
    const requestFS = (window as any).RequestFileSystem || (window as any).webkitRequestFileSystem;

    if (requestFS) {
      requestFS(
        (window as any).TEMPORARY,
        100,
        () => no("chromium"),
        () => yes("chromium")
      );
      return;
    }

    // -----------------------------------------------------
    // 2. Firefox Private Mode detection (bulletproof)
    // -----------------------------------------------------  
    const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");

    if (isFirefox) {
      // Firefox Private Mode DOES NOT ALLOW persistent storage
      (navigator as any).storage?.persist().then((persistent: boolean) => {
        if (!persistent) {
          // 100% PRIVATE MODE
          yes("firefox");
        } else {
          no("firefox");
        }
      }).catch(() => yes("firefox"));

      return;
    }


    // -----------------------------------------------------
    // 3. Safari (iOS + macOS)
    // -----------------------------------------------------
    const ua = navigator.userAgent.toLowerCase();
    const isSafari =
      ua.includes("safari") &&
      !ua.includes("chrome") &&
      !ua.includes("crios") &&
      !ua.includes("fxios");

    if (isSafari) {
      try {
        // Safari private mode: openDatabase throws
        (window as any).openDatabase(null, null, null, null);
      } catch (e) {
        return yes("safari");
      }

      try {
        // localStorage throws quota exceeded in Safari Private Mode
        const test = "__incognito_test__";
        window.localStorage.setItem(test, test);
        window.localStorage.removeItem(test);
      } catch (e) {
        return yes("safari");
      }

      return no("safari");
    }

    // -----------------------------------------------------
    // 4. Fallback: IndexedDB test
    // -----------------------------------------------------
    const testIndexedDB = () => {
      if (!("indexedDB" in window)) {
        return yes("indexeddb-blocked");
      }

      let db: IDBOpenDBRequest;

      try {
        db = window.indexedDB.open("detect-incognito-test");
      } catch (e) {
        return yes("indexeddb-error");
      }

      db.onerror = () => yes("indexeddb-error");
      db.onsuccess = () => no("indexeddb-normal");
    };

    testIndexedDB();
  });
}
