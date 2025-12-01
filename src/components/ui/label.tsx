import { cn } from "./cn";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-foreground text-sm font-medium mb-1 block", className)}
      {...props}
    />
  );
}
