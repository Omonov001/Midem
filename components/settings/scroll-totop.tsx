"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Sahifa o'zgarganda brauzerni eng tepaga qaytaradi
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // "smooth" qilsangiz sekin chiqadi, "instant" darhol.
    });
  }, [pathname]);

  return null; // Bu komponent ekranda hech narsa ko'rsatmaydi
}
