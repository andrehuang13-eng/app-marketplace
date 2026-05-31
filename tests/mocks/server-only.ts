// Test-only stub: vitest can't run the real `server-only` package
// (which throws by design outside Server Component context). This is
// a no-op so server-only-marked modules import cleanly under test.
export {};
