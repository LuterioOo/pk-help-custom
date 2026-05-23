"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-8xl font-bold neon-text opacity-50">404</p>
        <h1 className="mt-4 text-2xl font-semibold">{t("notFound")}</h1>
        <p className="mt-2 text-zinc-500">{t("notFoundDesc")}</p>
        <Link href="/" className="inline-block mt-8">
          <Button>{t("goHome")}</Button>
        </Link>
      </motion.div>
    </div>
  );
}
