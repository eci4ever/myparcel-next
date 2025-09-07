import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        "inline-flex h-10 items-center justify-center rounded-md bg-neutral-100 px-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:focus-visible:ring-neutral-600",
        className,
      )}
    >
      {children}
    </button>
  );
}
