import { UserProfile, UserCardState, ActionItem } from "@/types/user";

export interface IUserRepository {
  getProfile(userId: string): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<void>;
  getCardState(userId: string, cardId: string): Promise<UserCardState | null>;
  setCardState(state: UserCardState): Promise<void>;
  getUserCardsByStatus(userId: string, status: UserCardState["status"]): Promise<string[]>;
  getActionItems(userId: string): Promise<ActionItem[]>;
  addActionItem(item: ActionItem): Promise<void>;
  toggleActionItem(itemId: string, completed: boolean): Promise<void>;
}

class MemoryUserRepository implements IUserRepository {
  private profiles = new Map<string, UserProfile>();
  private cardStates = new Map<string, UserCardState>(); // key: `${userId}:${cardId}`
  private actionItems = new Map<string, ActionItem>();

  constructor() {
    // 默认提供一个本地游客身份
    this.profiles.set("guest", {
      id: "guest",
      nickname: "生活探索者",
      lifeConditions: ["renting", "cooking_often"],
      interestedCategories: ["health", "diet", "home_safety"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.profiles.get(userId) || null;
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    this.profiles.set(profile.id, profile);
  }

  async getCardState(userId: string, cardId: string): Promise<UserCardState | null> {
    return this.cardStates.get(`${userId}:${cardId}`) || null;
  }

  async setCardState(state: UserCardState): Promise<void> {
    this.cardStates.set(`${state.userId}:${state.cardId}`, state);
  }

  async getUserCardsByStatus(userId: string, status: UserCardState["status"]): Promise<string[]> {
    const cardIds: string[] = [];
    for (const [key, state] of this.cardStates.entries()) {
      if (key.startsWith(`${userId}:`) && state.status === status) {
        cardIds.push(state.cardId);
      }
    }
    return cardIds;
  }

  async getActionItems(userId: string): Promise<ActionItem[]> {
    return Array.from(this.actionItems.values()).filter((item) => item.userId === userId);
  }

  async addActionItem(item: ActionItem): Promise<void> {
    this.actionItems.set(item.id, item);
  }

  async toggleActionItem(itemId: string, completed: boolean): Promise<void> {
    const item = this.actionItems.get(itemId);
    if (item) {
      item.status = completed ? "completed" : "pending";
      item.completedAt = completed ? new Date().toISOString() : undefined;
    }
  }
}

export const userRepository: IUserRepository = new MemoryUserRepository();
