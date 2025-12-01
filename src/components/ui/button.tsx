import { cn } from "./cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-xl font-medium transition-all duration-200",
        variant === "default" &&
          "bg-primary text-primaryForeground hover:opacity-90 disabled:opacity-50",
        variant === "outline" &&
          "border border-primary text-primary hover:bg-primary hover:text-primaryForeground",
        className
      )}
      {...props}
    />
  );
}
