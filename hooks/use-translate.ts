"use client";

import { useTranslations } from "next-intl";

function useTranslate(namespace?: string) {
  // Agar namespace berilmasa, useTranslations() hamma tarjimalarni oladi
  const t = useTranslations(namespace);

  return t;
}

export default useTranslate;
