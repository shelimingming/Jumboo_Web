import Link from "next/link";

/** 首页作品卡片：在 HomePage 的 works-grid 中按需引用，与 play/page.tsx 的 WORKS[id] 对应 */
export function WorkCard(props: {
  id: string;
  delayClass: string;
  coverClass: string;
  title: string;
  subtitle: string;
  /** 可选：public 下的封面图路径 */
  coverImage?: string;
}) {
  const { id, delayClass, coverClass, title, subtitle, coverImage } = props;

  const cardClass = `work-card ${coverClass} reveal ${delayClass}`;
  // 行内 url()：路径含中文时用 encodeURI，避免个别环境下样式解析异常
  const coverInnerStyle = coverImage
    ? { backgroundImage: `url("${encodeURI(coverImage)}")` }
    : undefined;

  return (
    <Link className={cardClass} href={`/play?id=${id}`}>
      <div className="work-cover">
        <div className="work-cover-inner" style={coverInnerStyle} />
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
