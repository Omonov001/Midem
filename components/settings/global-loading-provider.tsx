"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import GlobalLoader from "@/components/settings/global-loader";
import useTranslate from "@/hooks/use-translate";

interface GlobalLoadingProviderProps {
  children: React.ReactNode;
}

/*
 * Loader kamida qancha vaqt ko'rinishi kerak.
 *
 * 1500 = 1.5 sekund
 */
const MINIMUM_LOADER_TIME = 1500;

export default function GlobalLoadingProvider({
  children,
}: GlobalLoadingProviderProps) {
  const t = useTranslate();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /*
     * Loader boshlangan vaqt.
     */
    const startedAt = Date.now();

    /*
     * Loaderni yopish funksiyasi.
     *
     * Browser tez yuklansa ham
     * 1.5 sekunddan oldin yopilmaydi.
     */
    const finishLoading = () => {
      const elapsed = Date.now() - startedAt;

      const remaining = Math.max(0, MINIMUM_LOADER_TIME - elapsed);

      window.setTimeout(() => {
        setLoading(false);
      }, remaining);
    };

    /*
     * Agar browser sahifani allaqachon
     * to'liq yuklab bo'lgan bo'lsa.
     */
    if (document.readyState === "complete") {
      finishLoading();

      return;
    }

    /*
     * Browserning barcha asosiy resurslari
     * yuklanganda.
     */
    window.addEventListener("load", finishLoading, { once: true });

    /*
     * Cleanup
     */
    return () => {
      window.removeEventListener("load", finishLoading);
    };
  }, []);

  return (
    <>
      {/* ================================================= */}
      {/* WEBSITE */}
      {/* ================================================= */}

      {children}

      {/* ================================================= */}
      {/* GLOBAL LOADER */}
      {/* ================================================= */}

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{
              opacity: 1,
              filter: "blur(0px)",
              scale: 1,
            }}
            animate={{
              opacity: 1,
              filter: "blur(0px)",
              scale: 1,
            }}
            exit={{
              opacity: 0,
              filter: "blur(18px)",
              scale: 1.015,
            }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed inset-0 z-[999999]"
          >
            <GlobalLoader text={t("common.loading")} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
