"use client";

import { Moon, Sun } from "lucide-react";
// import { useTheme } from "next-themes"; // Buni o'chiring
import { useTheme } from "@/components/ui/theme-provider"; // O'zimiznikini ulaymiz
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

function ModeToggle() {
  const [mount, setMount] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMount(true), []);

  // Qolgan hamma narsa o'z holicha qoladi...
  return mount && resolvedTheme === "dark" ? (
    <Button
      size={"icon"}
      variant={"ghost"}
      onClick={() => setTheme("light")}
      aria-label="mode-toggle-to-light"
      className="cursor-pointer"
    >
      <Sun className="size-6" />
    </Button>
  ) : (
    <Button
      size={"icon"}
      onClick={() => setTheme("dark")}
      variant={"ghost"}
      aria-label="mode-toggle-to-dark"
      className="cursor-pointer"
    >
      <Moon className="size-6" />
    </Button>
  );
}

export default ModeToggle;
