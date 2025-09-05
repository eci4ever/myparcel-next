"use client";

export function SignOutButton({ action }: { action: () => Promise<void> }) {
  return (
    <button
      onClick={action}
    >
      Log out
    </button>
  );
}
