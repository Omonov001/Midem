import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface Props {
  one: string;
  two: string;
  three: string;
  four: string;
  className?: string;
}

function FillterCards({ one, two, three, four, className }: Props) {
  return (
    <div
      className={cn(
        className,
        "w-full h-auto gap-2 flex items-center justify-end-safe",
      )}
    >
      <Button className="cursor-pointer border-2 border-blue-600">{one}</Button>
      <Button className="cursor-pointer border-2 border-blue-600">{two}</Button>
      <Button className="cursor-pointer border-2 border-blue-600">
        {three}
      </Button>
      <Button className="cursor-pointer border-2 border-blue-600">
        {four}
      </Button>
    </div>
  );
}

export default FillterCards;
