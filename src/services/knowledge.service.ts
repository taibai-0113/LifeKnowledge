import {
  IKnowledgeRepository,
  knowledgeRepository,
} from "@/repositories/knowledge.repository";
import {
  KnowledgeCard,
  KnowledgeConcept,
  KnowledgeSource,
  KnowledgeClaim,
  KnowledgeRelation,
} from "@/types/knowledge";

export interface CardDetailView {
  card: KnowledgeCard;
  concept: KnowledgeConcept | null;
  claims: KnowledgeClaim[];
  sources: KnowledgeSource[];
  relatedConcepts: { relationType: string; concept: KnowledgeConcept }[];
}

export class KnowledgeService {
  constructor(private repo: IKnowledgeRepository = knowledgeRepository) {}

  /**
   * 获取全部概念
   */
  async getAllConcepts(): Promise<KnowledgeConcept[]> {
    return this.repo.getAllConcepts();
  }

  /**
   * 获取全部已发布卡片
   */
  async getAllCards(): Promise<KnowledgeCard[]> {
    return this.repo.getAllCards();
  }

  /**
   * 获取今日核心推荐卡 (Phase 1/2 规则：优先高等级行动卡)
   */
  async getDailyCoreCard(): Promise<KnowledgeCard | null> {
    const cards = await this.repo.getAllCards();
    return (
      cards.find((c) => c.grade === "A+" || c.grade === "A") ||
      cards[0] ||
      null
    );
  }

  /**
   * 获取今日生活盲区卡
   */
  async getDailyBlindspotCard(): Promise<KnowledgeCard | null> {
    const blindspots = await this.repo.getCardsByModule("blindspot");
    return blindspots[0] || null;
  }

  /**
   * 获取人生知识档案列表
   */
  async getLifeArchiveCards(): Promise<KnowledgeCard[]> {
    return this.repo.getCardsByModule("life_archive");
  }

  /**
   * 获取生活盲区列表
   */
  async getBlindspotCards(): Promise<KnowledgeCard[]> {
    return this.repo.getCardsByModule("blindspot");
  }

  /**
   * 随机抽取一张知识卡
   */
  async getRandomCard(): Promise<KnowledgeCard | null> {
    const cards = await this.repo.getAllCards();
    if (cards.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * cards.length);
    return cards[randomIndex];
  }

  /**
   * 获取完整的卡片详情视角 (含关联概念、主事实声明与证据来源)
   */
  async getCardDetail(cardId: string): Promise<CardDetailView | null> {
    const card = await this.repo.getCardById(cardId);
    if (!card) return null;

    const concept = await this.repo.getConceptById(card.conceptId);
    const claims = concept ? await this.repo.getClaimsByConceptId(concept.id) : [];

    const sourceIds = Array.from(new Set(claims.flatMap((cl) => cl.sourceIds || [])));
    const sources = await this.repo.getSourcesByIds(sourceIds);

    const related = concept ? await this.repo.getRelatedConcepts(concept.id) : [];

    return {
      card,
      concept,
      claims,
      sources,
      relatedConcepts: related.map((r) => ({
        relationType: r.relation.relationType,
        concept: r.concept,
      })),
    };
  }

  /**
   * 获取单个概念的完整拓扑结构 (后台 Concept Detail 页面专用)
   */
  async getConceptDetail(conceptId: string) {
    const concept = await this.repo.getConceptById(conceptId);
    if (!concept) return null;

    const claims = await this.repo.getClaimsByConceptId(conceptId);
    const cards = await this.repo.getCardsByConceptId(conceptId);
    const related = await this.repo.getRelatedConcepts(conceptId);

    const sourceIds = Array.from(new Set(claims.flatMap((cl) => cl.sourceIds || [])));
    const sources = await this.repo.getSourcesByIds(sourceIds);

    return {
      concept,
      claims,
      cards,
      sources,
      related,
    };
  }

  /**
   * 搜索知识
   */
  async searchKnowledge(keyword: string): Promise<KnowledgeCard[]> {
    return this.repo.search(keyword);
  }

  /**
   * 新增概念与卡片 (数据驱动)
   */
  async createConcept(concept: KnowledgeConcept) {
    return this.repo.createConcept(concept);
  }

  async createCard(card: KnowledgeCard) {
    return this.repo.createCard(card);
  }

  async createRelation(relation: KnowledgeRelation) {
    return this.repo.createRelation(relation);
  }
}

export const knowledgeService = new KnowledgeService();
