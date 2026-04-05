import type { Metadata } from "next";
import Link from "next/link";
import "./play.css";

/** 作品元数据：标题、备注、可选抖音嵌入（官方播放器 iframe） */
const WORKS: Record<
  string,
  {
    title: string;
    note?: string;
    /** 抖音视频 vid（与站内 modal_id / 分享 id 一致，用于 open.douyin.com 嵌入） */
    douyinVideoId?: string;
    /** 备用：抖音站内链接，嵌入不可用时打开 */
    douyinPageUrl?: string;
  }
> = {
  "1": {
    title: "年糕的演奏",
    note: "一曲琴音，寄往心底最深的思念",
    douyinVideoId: "7622578724847865128",
    douyinPageUrl:
      "https://www.douyin.com/jingxuan/search/%E5%B9%B3%E5%B9%B3%E6%97%A0%E5%A5%87%E7%9A%84%E9%98%BF%E5%B8%83?aid=3dbed616-e493-4fa5-9cc6-2fabad976071&modal_id=7622578724847865128&type=general",
  },
  "2": { title: "几何回信" },
  "3": { title: "沉默的拱门" },
  "4": { title: "褪色塔楼" },
};

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { id = "1" } = await searchParams;
  const work = WORKS[id];
  const title = work?.title ?? "作品";
  return {
    title: `${title} · 阿布 Jumboo`,
    description: work?.note ?? "作品播放预览页",
  };
}

/** 播放占位页：原 play.html，query id 映射标题 */
export default async function PlayPage({ searchParams }: PageProps) {
  const { id = "1" } = await searchParams;
  const work = WORKS[id];
  const title = work?.title ?? "作品";
  const douyinVid = work?.douyinVideoId;
  const douyinPageUrl = work?.douyinPageUrl;

  return (
    <div className="play-root">
      <Link className="play-back" href="/">
        ← 返回主页
      </Link>
      <div
        className={douyinVid ? "play-stage play-stage--embed" : "play-stage"}
        role={douyinVid ? "region" : "img"}
        aria-label={douyinVid ? `${title} 视频播放` : "视频占位区域"}
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
      <p className="play-id-tag">作品 ID: {id} · Preview</p>
    </div>
  );
}
