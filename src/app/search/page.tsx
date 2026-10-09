import { TopBar } from "@/components/layout/TopBar";
import { knowledgeService } from "@/services/knowledge.service";
import { SearchClient } from "./SearchClient";


export default async function SearchPage() {
  const cards = await knowledgeService.getLifeArchiveCards();
  const blindspots = await knowledgeService.getBlindspotCards();
  const allCards = [...cards, ...blindspots];

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="搜索生活常识" showBack />
      <div className="px-4 py-4">
        <SearchClient initialCards={allCards} />
      </div>
    </div>
  );
}
