import { redirect } from "next/navigation";

/** 原作品详情页已取消，旧链接统一回首页（作品集在首屏下方） */
export default function PlayPageLegacyRedirect() {
  redirect("/");
}
