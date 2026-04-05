/** 荣誉小记卡片：文案 + 马卡龙强调色（data-macaron → home.css） */

export type HonorMacaron = "pink" | "blue" | "yellow" | "purple" | "green" | "coral";

export type HonorItem = {
  id: string;
  titleZh: string;
  titleEn: string;
  status: "nominated" | "won";
  categoryZh: string;
  categoryEn: string;
  orgLineZh: string;
  orgLineEn: string;
  macaron: HonorMacaron;
};

export function HonorBadge(props: { item: HonorItem; delayClass: string }) {
  const { item, delayClass } = props;
  const statusLabel = item.status === "won" ? "获奖" : "提名";

  return (
    <article
      className={`honor-badge reveal ${delayClass}`}
      data-macaron={item.macaron}
      aria-label={`${item.titleZh} ${statusLabel} ${item.categoryZh}`}
    >
      <div className="honor-badge-inner">
        <div className="honor-badge-copy">
          <h3 className="honor-title">{item.titleZh}</h3>
          <p className="honor-title-en">{item.titleEn}</p>
          <p className="honor-status">{statusLabel}</p>
          <p className="honor-category">{item.categoryZh}</p>
          <p className="honor-category-en">{item.categoryEn}</p>
          <p className="honor-org">{item.orgLineZh}</p>
          <p className="honor-org-en">{item.orgLineEn}</p>
        </div>
      </div>
    </article>
  );
}
