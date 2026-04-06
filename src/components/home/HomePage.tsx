"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { WorkPlayerConfig } from "@/lib/worksConfig";
import { portfolioCategories } from "@/lib/worksConfig";
import honorsData from "@/data/honors.json";
import { HonorBadge, type HonorItem } from "./HonorBadge";
import { WorkCard } from "./WorkCard";
import { WorkVideoLightbox } from "./WorkVideoLightbox";

/** 荣誉卡片 reveal 交错延迟（与作品区 delay-1～4 一致） */
const HONOR_REVEAL_DELAYS = ["delay-1", "delay-2", "delay-3", "delay-4"] as const;

/** 微信 Android X5 内核：声明 H5 内联播放，避免视频走系统全屏层导致背景层「看不见」 */
const WECHAT_X5_VIDEO_PROPS = {
  "x5-playsinline": "",
  "x5-video-player-type": "h5",
  /** 旧版 iOS WebKit 内联补充（playsInline 已映射标准属性） */
  "webkit-playsinline": "",
} as Record<string, string>;

/** 首页：原 preview.html 的交互（视频、粒子、导航与 reveal）迁到客户端组件 */
export default function HomePage() {
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  /** 作品集分类筛选：全部 | 某一分类 id */
  const [activeWorkCategory, setActiveWorkCategory] = useState<string>("all");
  /** 首页灯箱播放：取消跳转 /play，视频在当前页打开 */
  const [lightbox, setLightbox] = useState<{
    title: string;
    player: WorkPlayerConfig;
  } | null>(null);

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

    // 用几何判断替代 IntersectionObserver：微信首次进入时 IO 常误报「不在视口」，导致一直 pause、首帧从不 play
    function updateHeroInViewFromGeometry() {
      if (!heroEl) return;
      const r = heroEl.getBoundingClientRect();
      const vh = window.innerHeight;
      heroInViewRef.current = r.bottom > 1 && r.top < vh - 1;
      syncBgVideoPlayback();
    }

    // 微信内置浏览器有时不触发 canplay，用 loadedmetadata / loadeddata 兜底显示（.is-ready 控制 opacity）
    const onMediaProgress = () => {
      markVideoReady();
      updateHeroInViewFromGeometry();
    };

    if (boundVideo) {
      boundVideo.addEventListener("canplay", onMediaProgress);
      boundVideo.addEventListener("loadeddata", onMediaProgress);
      boundVideo.addEventListener("loadedmetadata", onMediaProgress);
      // 微信等环境首次无用户手势时 play() 会失败，真正开始播放时才稳定有画面；补上 playing 避免一直不渐显
      boundVideo.addEventListener("playing", onMediaProgress);
      boundVideo.addEventListener("error", () => {
        boundVideo.classList.remove("is-ready");
      });
      // HAVE_CURRENT_DATA(2)：已有当前帧，略早于 canplay，利于 WebView 首帧就绪即显式
      if (boundVideo.readyState >= 2) {
        onMediaProgress();
      }
    }

    reduceMotionMq.addEventListener("change", syncBgVideoPlayback);

    // 微信首次打开：无手势时 autoplay 常被拦截，需在用户第一次触摸/点击时同步在同一手势栈里重试 play（点锚点链接也会触发）
    let didUserActivateForBgVideo = false;
    function onFirstUserGestureForBgVideo() {
      if (didUserActivateForBgVideo) return;
      didUserActivateForBgVideo = true;
      document.removeEventListener("touchstart", onFirstUserGestureForBgVideo, true);
      document.removeEventListener("click", onFirstUserGestureForBgVideo, true);
      // 已有缓冲则先渐显，避免仅 play 被拦时长时间全透明
      const v = bgVideoRef.current;
      if (v && v.readyState >= 2) markVideoReady();
      updateHeroInViewFromGeometry();
    }
    document.addEventListener("touchstart", onFirstUserGestureForBgVideo, {
      capture: true,
      passive: true,
    });
    document.addEventListener("click", onFirstUserGestureForBgVideo, { capture: true });

    // 从后台/缓存返回时补一次同步（部分 WebView 会暂停媒体）
    const onPageShow = () => updateHeroInViewFromGeometry();
    window.addEventListener("pageshow", onPageShow);

    // 滚动/缩放时同步；首进页面再延迟几次纠偏（工具栏/首帧布局晚于 effect）
    window.addEventListener("scroll", updateHeroInViewFromGeometry, { passive: true });
    window.addEventListener("resize", updateHeroInViewFromGeometry);
    updateHeroInViewFromGeometry();
    let raf2Id = 0;
    const raf1Id = requestAnimationFrame(() => {
      raf2Id = requestAnimationFrame(updateHeroInViewFromGeometry);
    });
    const tRearm1 = window.setTimeout(updateHeroInViewFromGeometry, 120);
    const tRearm2 = window.setTimeout(updateHeroInViewFromGeometry, 400);

    return () => {
      document.removeEventListener("touchstart", onFirstUserGestureForBgVideo, true);
      document.removeEventListener("click", onFirstUserGestureForBgVideo, true);
      window.removeEventListener("pageshow", onPageShow);
      if (boundVideo) {
        boundVideo.removeEventListener("canplay", onMediaProgress);
        boundVideo.removeEventListener("loadeddata", onMediaProgress);
        boundVideo.removeEventListener("loadedmetadata", onMediaProgress);
        boundVideo.removeEventListener("playing", onMediaProgress);
      }
      reduceMotionMq.removeEventListener("change", syncBgVideoPlayback);
      window.removeEventListener("scroll", updateHeroInViewFromGeometry);
      window.removeEventListener("resize", updateHeroInViewFromGeometry);
      cancelAnimationFrame(raf1Id);
      if (raf2Id) cancelAnimationFrame(raf2Id);
      clearTimeout(tRearm1);
      clearTimeout(tRearm2);
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

  // 切换作品分类后，对已展开区块内的 .reveal 做一次视口检测，避免仅 display 切换时不触发 IntersectionObserver
  useEffect(() => {
    function revealWorksInView() {
      document.querySelectorAll("#works .reveal").forEach((el) => {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        if (r.bottom > 0 && r.top < vh * 0.92) el.classList.add("visible");
      });
    }
    revealWorksInView();
    const id = requestAnimationFrame(revealWorksInView);
    return () => cancelAnimationFrame(id);
  }, [activeWorkCategory]);

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
              <a href="#honors">荣誉</a>
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
              // 减少右键「将视频另存为」等入口（无法防止从地址栏或开发者工具获取资源）
              onContextMenu={(e) => e.preventDefault()}
              {...WECHAT_X5_VIDEO_PROPS}
            >
              {/* 背景视频走 CDN，减轻源站压力并利于微信等环境稳定拉流 */}
              <source
                src="https://cdn.xyfit.top/Jumboo/back.mp4"
                type="video/mp4"
              />
            </video>
            <div className="bg-video-blend" />
          </div>
          <div className="hero-inner">
            {/* 首屏个人介绍文案（用户定制） */}
            <span className="hero-tag">
              AIGC创作者｜跨界新人 | 抖音签约创作者
            </span>
            <h1 id="hero-title">
              {/* 首屏中文署名：使用透明底设计字图片（public/name.jpg） */}
              <Image
                src="/name.jpg"
                alt="平平无奇的阿布"
                className="hero-name-logo"
                width={2944}
                height={1176}
                sizes="(max-width: 640px) 92vw, 520px"
                priority
              />
              <span>Jumboo</span>
            </h1>
            <p className="hero-lead">
              {/* 首屏三句自我介绍：连续展示为一组 */}
              <span className="hero-lead-line">嗨！很高兴认识你！这里是</span>
              <span className="hero-lead-line">
                {`有态度也有温度的AIGC创作者阿布✌︎' ֊'`}
              </span>
              <span className="hero-lead-line">
                一个时I时E、时T时F的非典型ENTJ~
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
              作品集
            </h2>
            {/* 分类切换：全部 / 各 JSON 配置的分类 */}
            <div
              className="works-category-tabs reveal delay-2"
              role="tablist"
              aria-label="作品分类"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeWorkCategory === "all"}
                className={`works-category-tab${activeWorkCategory === "all" ? " is-active" : ""}`}
                onClick={() => setActiveWorkCategory("all")}
              >
                全部
              </button>
              {portfolioCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={activeWorkCategory === cat.id}
                  className={`works-category-tab${activeWorkCategory === cat.id ? " is-active" : ""}`}
                  onClick={() => setActiveWorkCategory(cat.id)}
                >
                  {cat.titleZh}
                </button>
              ))}
            </div>
          </div>

          {portfolioCategories.map((cat) => {
            const visible =
              activeWorkCategory === "all" || activeWorkCategory === cat.id;
            return (
              <div
                key={cat.id}
                className="works-category-block reveal delay-1"
                hidden={!visible}
                data-category-id={cat.id}
              >
                <h3 className="works-category-title">
                  <span>{cat.titleZh}</span>
                  <span className="works-category-title-sep">｜</span>
                  <span className="works-category-title-en">{cat.titleEn}</span>
                </h3>
                <div className="works-grid">
                  {cat.works.length === 0 ? (
                    <p className="works-empty">该分类内容整理中，敬请期待。</p>
                  ) : (
                    cat.works.map((w) => (
                      <WorkCard
                        key={w.id}
                        id={w.id}
                        delayClass={w.delayClass}
                        coverClass={w.coverClass}
                        title={w.title}
                        subtitle={w.subtitle}
                        coverImage={w.coverImage}
                        player={w.player}
                        onPlay={setLightbox}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* 合作区之前：AIGC 相关荣誉（数据见 src/data/honors.json） */}
        <section id="honors" className="honors" aria-labelledby="honors-title">
          <div className="honors-head">
            <p className="section-label reveal">Honors</p>
            <h2 id="honors-title" className="reveal delay-1">
              荣誉小记
            </h2>
            <p className="honors-lead reveal delay-2">
              各平台 AI 影像赛事、品牌活动与官方邀约记录，与创作并行的一小段足迹。
            </p>
          </div>
          <div className="honors-grid">
            {(honorsData.items as HonorItem[]).map((item, i) => (
              <HonorBadge
                key={item.id}
                item={item}
                delayClass={HONOR_REVEAL_DELAYS[i % HONOR_REVEAL_DELAYS.length]}
              />
            ))}
          </div>
        </section>

        <section id="coop" className="coop" aria-labelledby="coop-title">
          <p className="section-label reveal">Collaboration</p>
          <h2 id="coop-title" className="reveal delay-1">
            合作方式
          </h2>
          {/* 合作说明：与作品区副文案同色系，避免行内样式分散 */}
          <p className="coop-lead reveal delay-2">
            如果你有叙事短片、品牌宣传、视觉概念、个人定制类需求，都可以来找我聊聊！
          </p>
          {/* 收尾句放在卡片外、紧接引导段，与示意图一致 */}
          <p className="coop-outro reveal delay-2">期待一起做出喜欢的作品~</p>
          <div className="coop-card reveal delay-3">
            <dl className="coop-contact" aria-label="联系方式">
              <div className="coop-contact-row">
                <dt>邮箱</dt>
                <dd>
                  <a
                    className="coop-contact-link"
                    href="mailto:493182574@qq.com?subject=AI%E5%90%88%E4%BD%9C%20%2B%20%E9%9C%80%E6%B1%82%E7%B1%BB%E5%88%AB"
                  >
                    493182574@qq.com
                  </a>
                </dd>
              </div>
              <div className="coop-contact-row">
                <dt>微信</dt>
                <dd>
                  <span className="coop-wechat">jumboo123</span>
                </dd>
              </div>
              <div className="coop-contact-row coop-contact-row--note">
                <dt>备注</dt>
                <dd>AI合作 + 需求类别</dd>
              </div>
            </dl>
          </div>
        </section>
      </main>

      <footer>© Jumboo 阿布 · Immersive Experience</footer>

      <WorkVideoLightbox
        open={lightbox !== null}
        title={lightbox?.title ?? ""}
        player={lightbox?.player ?? null}
        onClose={() => setLightbox(null)}
      />
    </>
  );
}
