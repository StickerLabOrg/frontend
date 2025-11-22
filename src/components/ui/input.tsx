import { cn } from "./cn";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full px-3 py-2 rounded-xl bg-inputBg border border-border text-foreground outline-none",
        "focus:ring-2 focus:ring-primary",
        className
      )}
      {...props}
    />
  );
}
