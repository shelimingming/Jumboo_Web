import type { WorkPlayerConfig } from "@/lib/worksConfig";

/** 首页作品卡片：点击后在首页灯箱播放（配置见 src/data/works.json） */
export function WorkCard(props: {
  id: string;
  delayClass: string;
  coverClass: string;
  title: string;
  subtitle: string;
  coverImage?: string;
  player?: WorkPlayerConfig;
  /** 有可播放源时触发，打开首页视频层 */
  onPlay?: (payload: { title: string; player: WorkPlayerConfig }) => void;
}) {
  const {
    delayClass,
    coverClass,
    title,
    subtitle,
    coverImage,
    player,
    onPlay,
  } = props;

  // 有外链封面图时加标记类，便于 CSS 用 contain 完整展示（避免 cover + 负 inset 裁切）
  const cardClass = `work-card ${coverClass} reveal ${delayClass}${coverImage ? " work-card--cover-image" : ""}`;
  const coverInnerStyle = coverImage
    ? { backgroundImage: `url("${encodeURI(coverImage)}")` }
    : undefined;

  const canPlay = Boolean(player?.videoSrc || player?.douyinVideoId);

  function handleActivate() {
    if (!canPlay || !player || !onPlay) return;
    onPlay({ title, player });
  }

  return (
    <div
      className={`${cardClass}${canPlay ? "" : " work-card--no-media"}`}
      role={canPlay ? "button" : undefined}
      tabIndex={canPlay ? 0 : undefined}
      aria-label={canPlay ? `播放：${title}` : undefined}
      onClick={canPlay ? handleActivate : undefined}
      onKeyDown={
        canPlay
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleActivate();
              }
            }
          : undefined
      }
    >
      <div className="work-cover">
        <div className="work-cover-inner" style={coverInnerStyle} />
        {canPlay ? (
          <span className="work-play" aria-hidden>
            <svg viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        ) : null}
      </div>
      <div className="work-meta">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
