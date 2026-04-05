import type { Metadata } from "next";
import Link from "next/link";
import "./play.css";

/** 作品元数据：标题、备注；视频可为抖音 iframe 或直连 MP4（与首页 WorkCard 同 id） */
const WORKS: Record<
  string,
  {
    title: string;
    note?: string;
    /** 抖音视频 vid（与站内 modal_id / 分享 id 一致，用于 open.douyin.com 嵌入） */
    douyinVideoId?: string;
    /** 备用：抖音站内链接，嵌入不可用时打开 */
    douyinPageUrl?: string;
    /** 直连视频地址（如 CDN 上的 .mp4）；与 douyinVideoId 同时存在时优先抖音 */
    videoSrc?: string;
  }
> = {
  "1": {
    title: "年糕的Color Walk",
    videoSrc: "https://cdn.xyfit.top/Jumboo/年糕的colorwalk.mp4",
  },
};

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { id } = await searchParams;
  const work = id ? WORKS[id] : undefined;
  const title = work?.title ?? "作品";
  return {
    title: `${title} · 阿布 Jumboo`,
    description: work?.note ?? "作品播放预览页",
  };
}

/** 播放占位页：原 play.html，query id 映射标题 */
export default async function PlayPage({ searchParams }: PageProps) {
  const { id } = await searchParams;
  const work = id ? WORKS[id] : undefined;
  // 无 id 或未配置的作品：统一提示（与清空后的 WORKS 一致）
  const title = work?.title ?? "暂无上架作品";
  const douyinVid = work?.douyinVideoId;
  const douyinPageUrl = work?.douyinPageUrl;
  const videoSrc = work?.videoSrc;
  // 抖音 iframe 与直连 MP4 共用铺满舞台的样式
  const mediaStage = Boolean(douyinVid || videoSrc);

  return (
    <div className="play-root">
      <Link className="play-back" href="/">
        ← 返回主页
      </Link>
      <div
        className={mediaStage ? "play-stage play-stage--embed" : "play-stage"}
        role={mediaStage ? "region" : "img"}
        aria-label={mediaStage ? `${title} 视频播放` : "视频占位区域"}
      >
        {douyinVid ? (
          // 抖音开放平台网页播放器（文档：player/video?vid=）
          <iframe
            className="play-douyin-iframe"
            src={`https://open.douyin.com/player/video?vid=${encodeURIComponent(douyinVid)}&autoplay=0`}
            title={`${title} · 抖音`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="unsafe-url"
          />
        ) : videoSrc ? (
          // 直连 MP4（CDN 等）
          <video
            className="play-native-video"
            src={videoSrc}
            controls
            playsInline
            preload="metadata"
            aria-label={`${title} 视频`}
          />
        ) : (
          <p className="play-placeholder">
            此处嵌入视频播放器
            <br />
            （&lt;video&gt; 或 iframe）
          </p>
        )}
      </div>
      {douyinPageUrl ? (
        <p className="play-embed-fallback">
          <a
            href={douyinPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="play-embed-fallback-link"
          >
            若无法播放，在抖音中打开
          </a>
        </p>
      ) : null}
      <h1>{title}</h1>
      {work?.note ? <p className="play-note">{work.note}</p> : null}
      {!work ? (
        <p className="play-note">内容整理中，敬请期待。</p>
      ) : null}
      {work && id ? (
        <p className="play-id-tag">作品 ID: {id} · Preview</p>
      ) : null}
    </div>
  );
}
