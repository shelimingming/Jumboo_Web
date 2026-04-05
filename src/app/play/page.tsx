import type { Metadata } from "next";
import Link from "next/link";
import "./play.css";

const WORK_TITLES: Record<string, string> = {
  "1": "雾岛日出",
  "2": "几何回信",
  "3": "沉默的拱门",
  "4": "褪色塔楼",
};

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { id = "1" } = await searchParams;
  const title = WORK_TITLES[id] ?? "作品";
  return {
    title: `${title} · 阿布 Jumboo`,
    description: "作品播放预览页",
  };
}

/** 播放占位页：原 play.html，query id 映射标题 */
export default async function PlayPage({ searchParams }: PageProps) {
  const { id = "1" } = await searchParams;
  const title = WORK_TITLES[id] ?? "作品";

  return (
    <div className="play-root">
      <Link className="play-back" href="/">
        ← 返回主页
      </Link>
      <div className="play-stage" role="img" aria-label="视频占位区域">
        <p className="play-placeholder">
          此处嵌入视频播放器
          <br />
          （&lt;video&gt; 或 iframe）
        </p>
      </div>
      <h1>{title}</h1>
      <p className="play-id-tag">作品 ID: {id} · Preview</p>
    </div>
  );
}
