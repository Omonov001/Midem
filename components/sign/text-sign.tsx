import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ui/theme-provider";

interface Props {
  className?: string;
}

function TextSign({ className }: Props) {
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={cn(
        className,
        "h-4 w-[1px] bg-white/10 hidden md:block",
        isDark ? "bg-white/10" : " bg-black/80",
      )}
    />
  );
}

export default TextSign;
