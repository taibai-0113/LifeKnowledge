import { TopBar } from "@/components/layout/TopBar";
import { knowledgeService } from "@/services/knowledge.service";
import { RandomCardClient } from "./RandomCardClient";

export default async function RandomPage() {
  const allArchive = await knowledgeService.getLifeArchiveCards();
  const allBlindspot = await knowledgeService.getBlindspotCards();

  const totalArchiveCount = allArchive.length;
  const totalBlindspotCount = allBlindspot.length;

  // 首批各传入 30 张，其余在客户端随切随按需后台补充，极大减少初次载入延迟
  const initialArchive = allArchive.slice(0, 30);
  const initialBlindspot = allBlindspot.slice(0, 30);

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="随机探索" />
      <div className="px-4 py-4">
        <RandomCardClient
          archiveCards={initialArchive}
          blindspotCards={initialBlindspot}
          totalArchiveCount={totalArchiveCount}
          totalBlindspotCount={totalBlindspotCount}
        />
      </div>
    </div>
  );
}
