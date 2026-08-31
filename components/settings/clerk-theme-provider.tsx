/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { ReactNode } from "react";

export default function ClerkThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
      appearance={
        {
          baseTheme: resolvedTheme === "dark" ? dark : undefined,
        } as any
      }
    >
      {children}
    </ClerkProvider>
  );
}
