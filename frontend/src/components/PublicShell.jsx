import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import PublicNav from "./PublicNav";
import PublicFooter from "./PublicFooter";

export default function PublicShell() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <PublicNav />
      <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
        <Outlet />
      </motion.div>
      <PublicFooter />
    </div>
  );
}
