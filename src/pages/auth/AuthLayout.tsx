import type { ReactNode } from 'react';

/** Shared shell for the login/signup screens: logo + radial glow background + centered card. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-5 py-10">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 20% 15%, rgba(217,119,6,0.14), transparent 55%), radial-gradient(circle at 85% 80%, rgba(190,18,60,0.12), transparent 50%)',
        }}
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-900/30">
            <svg
              viewBox="0 0 24 24"
              className="text-ink h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path d="M4 19V6a2 2 0 0 1 2-2h9l5 5v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
              <path d="M15 4v5h5" />
              <path d="M8 13h8M8 17h5" />
            </svg>
          </div>
          <h1 className="font-display text-2xl tracking-wide text-amber-400">Compêndio</h1>
          <p className="text-xs text-neutral-500">Suas fichas, todos os seus mundos</p>
        </div>
        {children}
      </div>
    </div>
  );
}
