"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

/** 首页：原 preview.html 的交互（视频、粒子、导航与 reveal）迁到客户端组件 */
export default function HomePage() {
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // 用 ref 记录首屏是否在视口内，避免 setState 触发 effect 重建 Observer
  const heroInViewRef = useRef(true);

  // 稳定随机粒子参数，避免 Strict Mode 下重复挂载导致闪烁
  const particles = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        size: Math.random() * 6 + 2,
        left: Math.random() * 100,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 10,
      })),
    []
  );

  // 背景视频：首屏可见时播放，离开视口暂停；尊重 prefers-reduced-motion
  useEffect(() => {
    const heroEl = heroRef.current;
    // 绑定本次挂载时的 video 节点，cleanup 与 react-hooks/exhaustive-deps 一致
    const boundVideo = bgVideoRef.current;
    const reduceMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    // 每次从 ref 取 video，避免闭包内 TS 认为 ref 可能已被清空
    function markVideoReady() {
      const v = bgVideoRef.current;
      if (v) v.classList.add("is-ready");
    }

    function syncBgVideoPlayback() {
      const v = bgVideoRef.current;
      if (!v) return;
      if (reduceMotionMq.matches) {
        v.pause();
        return;
      }
      if (!heroInViewRef.current) {
        v.pause();
        return;
      }
      const playPromise = v.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    }

    const onCanPlay = () => {
      markVideoReady();
      syncBgVideoPlayback();
    };

    if (boundVideo) {
      boundVideo.addEventListener("canplay", onCanPlay, { once: true });
      boundVideo.addEventListener("error", () => {
        boundVideo.classList.remove("is-ready");
      });
      if (boundVideo.readyState >= 3) {
        markVideoReady();
        syncBgVideoPlayback();
      }
    }

    reduceMotionMq.addEventListener("change", syncBgVideoPlayback);

    let observer: IntersectionObserver | undefined;
    if (heroEl && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            heroInViewRef.current = e.isIntersecting;
            syncBgVideoPlayback();
          });
        },
        { threshold: 0 }
      );
      observer.observe(heroEl);
    }

    return () => {
      boundVideo?.removeEventListener("canplay", onCanPlay);
      reduceMotionMq.removeEventListener("change", syncBgVideoPlayback);
      observer?.disconnect();
    };
  }, []);

  // 导航滚动磨砂、reveal 观察器（已移除自定义光标）
  useEffect(() => {
    const nav = navRef.current;

    const onScroll = () => {
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const reveals = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    reveals.forEach((el) => obs.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      obs.disconnect();
    };
  }, []);

  return (
    <>
      <div className="mesh-background" aria-hidden />
      <div className="noise-overlay" aria-hidden />

      <div className="particles" aria-hidden>
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}vw`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <header className="nav" id="nav" ref={navRef}>
        <span className="nav-brand">Jumboo</span>
        <nav aria-label="主导航">
          <ul className="nav-links">
            <li>
              <a href="#works">作品</a>
            </li>
            <li>
              <a href="#coop">合作</a>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <section className="hero" id="hero" aria-labelledby="hero-title" ref={heroRef}>
          <div className="hero-video-layer" aria-hidden>
            <video
              ref={bgVideoRef}
              className="bg-video"
              id="bgVideo"
              muted
              loop
              playsInline
              preload="auto"
            >
              <source src="/back.mp4" type="video/mp4" />
            </video>
            <div className="bg-video-blend" />
          </div>
          <div className="hero-inner">
            {/* 首屏个人介绍文案（用户定制） */}
            <span className="hero-tag">
              AIGC创作者｜跨界新人 | 优质签约创作者
            </span>
            <h1 id="hero-title">
              阿布
              <span>Jumboo</span>
            </h1>
            <p className="hero-lead">
              <span className="hero-lead-line">
                跨行入局，天赋与运气同行，凭热爱与坚持斩获多项平台
                <span className="hero-lead-keep">奖项。</span>
              </span>
              <span className="hero-lead-line">
                以态度与温度重构AI影像，不被定义，自有风格。
              </span>
            </p>
          </div>
          <div className="scroll-hint">
            <span>Scroll</span>
            <div className="scroll-line" />
          </div>
        </section>

        <section id="works" aria-labelledby="works-title">
          <div className="works-head">
            <p className="section-label reveal">Selected Works</p>
            <h2 id="works-title" className="reveal delay-1">
              个人作品
            </h2>
            <p
              className="reveal delay-2"
              style={{ color: "rgba(74, 93, 96, 0.8)", fontSize: "1.1rem" }}
            >
              点击卡片进入播放页（预览中为占位链接，接入正式路由后替换即可）。
            </p>
          </div>
          <div className="works-grid">
            <WorkCard
              id="1"
              delayClass="delay-1"
              coverClass="cover-1"
              title="雾岛日出"
              subtitle="实验短片 · 2025"
            />
            <WorkCard
              id="2"
              delayClass="delay-2"
              coverClass="cover-2"
              title="几何回信"
              subtitle="品牌概念片 · 2025"
            />
            <WorkCard
              id="3"
              delayClass="delay-3"
              coverClass="cover-3"
              title="沉默的拱门"
              subtitle="MV 片段 · 2024"
            />
            <WorkCard
              id="4"
              delayClass="delay-4"
              coverClass="cover-4"
              title="褪色塔楼"
              subtitle="艺术装置纪录 · 2024"
            />
          </div>
        </section>

        <section id="coop" className="coop" aria-labelledby="coop-title">
          <p className="section-label reveal">Collaboration</p>
          <h2 id="coop-title" className="reveal delay-1">
            合作方式
          </h2>
          <p
            className="reveal delay-2"
            style={{
              color: "rgba(74, 93, 96, 0.8)",
              fontSize: "1.1rem",
              maxWidth: "36rem",
              margin: "0 auto",
            }}
          >
            接受品牌短片、视觉概念、演出影像与展览内容等委托。周期与报价依项目而定，欢迎先写一封简单的信。
          </p>
          <div className="coop-card reveal delay-3">
            <ul className="coop-list">
              <li>商业委托与联名创作</li>
              <li>艺术驻留与展览影像</li>
              <li>工作坊与创作分享（线上/线下）</li>
            </ul>
            <br />
            <a className="btn-mail" href="mailto:hello@jumboo.studio">
              发起邮件联系
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </a>
          </div>
        </section>
      </main>

      <footer>© Jumboo 阿布 · Immersive Experience</footer>
    </>
  );
}

function WorkCard(props: {
  id: string;
  delayClass: string;
  coverClass: string;
  title: string;
  subtitle: string;
}) {
  const { id, delayClass, coverClass, title, subtitle } = props;
  return (
    <Link
      className={`work-card ${coverClass} reveal ${delayClass}`}
      href={`/play?id=${id}`}
    >
      <div className="work-cover">
        <div className="work-cover-inner" />
        <span className="work-play" aria-hidden>
          <svg viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
      <div className="work-meta">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </Link>
  );
}
