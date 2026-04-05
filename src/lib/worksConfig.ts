import worksData from "@/data/works.json";

/** 作品集数据源：评集条目与分类见 src/data/works.json（与运营表格同步，可补封面与 videoSrc） */

/** 播放页所需字段：与 play/page 内原 WORKS 条目一致 */
export type WorkPlayerConfig = {
  note?: string;
  douyinVideoId?: string;
  douyinPageUrl?: string;
  videoSrc?: string;
};

/** 单条作品：首页卡片 + 可选播放器配置 */
export type WorkItemConfig = {
  id: string;
  title: string;
  subtitle: string;
  coverClass: string;
  delayClass: string;
  coverImage?: string;
  player?: WorkPlayerConfig;
};

export type WorkCategoryConfig = {
  id: string;
  titleZh: string;
  titleEn: string;
  works: WorkItemConfig[];
};

/** 从 JSON 读取的全部分类与作品（唯一数据源） */
export const portfolioCategories: WorkCategoryConfig[] = worksData.categories;
