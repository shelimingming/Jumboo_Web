"use client";

import { useEffect, useId, useRef } from "react";
import type { WorkPlayerConfig } from "@/lib/worksConfig";

/** 微信 X5：与首页背景视频一致，内联播放 */
const WECHAT_X5_VIDEO_PROPS = {
  "x5-playsinline": "",
  "x5-video-player-type": "h5",
  "webkit-playsinline": "",
} as Record<string, string>;

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  player: WorkPlayerConfig | null;
};

/** 首页作品集：点击卡片后在全屏层内播放，替代独立详情页 */
export function WorkVideoLightbox({ open, onClose, title, player }: Props) {
  const titleId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const douyinVid = player?.douyinVideoId;
  const videoSrc = player?.videoSrc;
  const douyinPageUrl = player?.douyinPageUrl;
  const note = player?.note;
  const hasStage = Boolean(douyinVid || videoSrc);

  // 打开时锁滚动、聚焦关闭按钮；关闭时暂停 MP4
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !videoSrc) return;
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
    return () => {
      v.pause();
    };
  }, [open, videoSrc]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="work-lightbox-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="work-lightbox-backdrop"
        aria-label="关闭视频"
        onClick={onClose}
      />
      <div className="work-lightbox-panel">
        <div className="work-lightbox-toolbar">
          <h2 id={titleId} className="work-lightbox-title">
            {title}
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            className="work-lightbox-close"
            onClick={onClose}
            aria-label="关闭"
          >
            ×
          </button>
        </div>
        <div
          className={
            hasStage ? "work-lightbox-stage work-lightbox-stage--embed" : "work-lightbox-stage"
          }
          role={hasStage ? "region" : undefined}
          aria-label={hasStage ? `${title} 视频` : undefined}
        >
          {douyinVid ? (
            <iframe
              className="work-lightbox-iframe"
              src={`https://open.douyin.com/player/video?vid=${encodeURIComponent(douyinVid)}&autoplay=0`}
              title={`${title} · 抖音`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="unsafe-url"
            />
          ) : videoSrc ? (
            <video
              ref={videoRef}
              className="work-lightbox-video"
              src={videoSrc}
              controls
              // 隐藏浏览器原生控件中的「下载」等项，并降低右键另存为入口（无法杜绝抓包）
              controlsList="nodownload"
              disablePictureInPicture
              playsInline
              preload="metadata"
              aria-label={`${title} 视频`}
              onContextMenu={(e) => e.preventDefault()}
              {...WECHAT_X5_VIDEO_PROPS}
            />
          ) : (
            <p className="work-lightbox-placeholder">暂无可播放视频</p>
          )}
        </div>
        {douyinPageUrl ? (
          <p className="work-lightbox-fallback">
            <a
              href={douyinPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="work-lightbox-fallback-link"
            >
              若无法播放，在抖音中打开
            </a>
          </p>
        ) : null}
        {note ? <p className="work-lightbox-note">{note}</p> : null}
      </div>
    </div>
  );
}
