"use client";

import { useCallback, useEffect, useState } from "react";

/** 超过该滚动距离后显示「回到顶部」，与首屏高度大致衔接 */
const SHOW_AFTER_Y = 360;

/**
 * 右下角悬浮回到顶部：玻璃拟态 + 珊瑚强调色 hover，与导航/作品卡一致。
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_Y);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: reduce ? "instant" : "smooth",
    });
  }, []);

  return (
    <button
      type="button"
      className={`back-to-top${visible ? " is-visible" : ""}`}
      onClick={scrollToTop}
      aria-label="回到页面顶部"
      title="回到顶部"
    >
      <svg
        className="back-to-top-icon"
        viewBox="0 0 24 24"
        width={22}
        height={22}
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M12 5.5l6.2 6.2-1.4 1.4L13 9.3V20h-2V9.3L7.2 13.1 5.8 11.8 12 5.5z"
        />
      </svg>
    </button>
  );
}
