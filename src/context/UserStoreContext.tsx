"use client";

import React, { createContext, useContext, useCallback, useSyncExternalStore } from "react";
import { ActionItem, LifeCondition, ConceptExposure } from "@/types/user";

export interface DismissedCard {
  cardId: string;
  reason: string;
  dismissedAt: string;
}

interface UserDataState {
  savedCardIds: string[];
  masteredCardIds: string[];
  actionItems: ActionItem[];
  lifeConditions: LifeCondition[];
  interestedCategories: string[];
  exposures: Record<string, ConceptExposure>;
  dismissedCards: DismissedCard[];
  onboardingCompleted: boolean;
  recommendationSeed: number;
}

interface UserStoreContextType {
  savedCardIds: string[];
  masteredCardIds: string[];
  actionItems: ActionItem[];
  lifeConditions: LifeCondition[];
  interestedCategories: string[];
  exposures: Record<string, ConceptExposure>;
  dismissedCards: DismissedCard[];
  onboardingCompleted: boolean;
  recommendationSeed: number;
  toggleSaveCard: (cardId: string) => void;
  toggleMasterCard: (cardId: string) => void;
  addActionItem: (cardId: string, title: string) => void;
  toggleActionItem: (id: string) => void;
  removeActionItem: (id: string) => void;
  toggleLifeCondition: (condition: LifeCondition) => void;
  toggleCategoryInterest: (category: string) => void;
  completeOnboarding: (conditions: LifeCondition[], interests?: string[]) => void;
  recordExposure: (conceptId: string, cardId: string, angle?: string) => void;
  dismissCard: (cardId: string, reason?: string) => void;
  refreshRecommendations: () => void;
  isHydrated: boolean;
}

const UserStoreContext = createContext<UserStoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SAVED: "lk_saved_cards",
  MASTERED: "lk_mastered_cards",
  ACTIONS: "lk_action_items",
  CONDITIONS: "lk_life_conditions",
  INTERESTS: "lk_user_interests",
  EXPOSURES: "lk_concept_exposures",
  DISMISSED: "lk_dismissed_cards",
  ONBOARDING: "lk_onboarding_done",
};

const DEFAULT_USER_DATA: UserDataState = {
  savedCardIds: [],
  masteredCardIds: [],
  actionItems: [],
  lifeConditions: ["renting", "cooking_often"],
  interestedCategories: ["health", "home_safety"],
  exposures: {},
  dismissedCards: [],
  onboardingCompleted: false,
  recommendationSeed: 1,
};

let isClientMounted = false;
let memoryState: UserDataState | null = null;
const listeners = new Set<() => void>();

function initClientStorage(): UserDataState {
  if (typeof window === "undefined") return DEFAULT_USER_DATA;

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED);
    const mastered = localStorage.getItem(STORAGE_KEYS.MASTERED);
    const actions = localStorage.getItem(STORAGE_KEYS.ACTIONS);
    const conditions = localStorage.getItem(STORAGE_KEYS.CONDITIONS);
    const interests = localStorage.getItem(STORAGE_KEYS.INTERESTS);
    const exposures = localStorage.getItem(STORAGE_KEYS.EXPOSURES);
    const dismissed = localStorage.getItem(STORAGE_KEYS.DISMISSED);
    const onboarding = localStorage.getItem(STORAGE_KEYS.ONBOARDING);

    memoryState = {
      savedCardIds: saved ? JSON.parse(saved) : DEFAULT_USER_DATA.savedCardIds,
      masteredCardIds: mastered ? JSON.parse(mastered) : DEFAULT_USER_DATA.masteredCardIds,
      actionItems: actions ? JSON.parse(actions) : DEFAULT_USER_DATA.actionItems,
      lifeConditions: conditions ? JSON.parse(conditions) : DEFAULT_USER_DATA.lifeConditions,
      interestedCategories: interests ? JSON.parse(interests) : DEFAULT_USER_DATA.interestedCategories,
      exposures: exposures ? JSON.parse(exposures) : DEFAULT_USER_DATA.exposures,
      dismissedCards: dismissed ? JSON.parse(dismissed) : DEFAULT_USER_DATA.dismissedCards,
      onboardingCompleted: onboarding ? JSON.parse(onboarding) : DEFAULT_USER_DATA.onboardingCompleted,
      recommendationSeed: 1,
    };
  } catch {
    memoryState = { ...DEFAULT_USER_DATA };
  }
  return memoryState;
}

function getClientSnapshot(): UserDataState {
  // 水合阶段保证返回与服务端完全一致的默认值，杜绝 Hydration Mismatch
  if (!isClientMounted) {
    return DEFAULT_USER_DATA;
  }
  if (!memoryState) {
    return initClientStorage();
  }
  return memoryState;
}

function getServerSnapshot(): UserDataState {
  return DEFAULT_USER_DATA;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function emitChange(updater: (prev: UserDataState) => UserDataState) {
  const current = memoryState || initClientStorage();
  const next = updater(current);
  memoryState = next;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(next.savedCardIds));
      localStorage.setItem(STORAGE_KEYS.MASTERED, JSON.stringify(next.masteredCardIds));
      localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(next.actionItems));
      localStorage.setItem(STORAGE_KEYS.CONDITIONS, JSON.stringify(next.lifeConditions));
      localStorage.setItem(STORAGE_KEYS.INTERESTS, JSON.stringify(next.interestedCategories));
      localStorage.setItem(STORAGE_KEYS.EXPOSURES, JSON.stringify(next.exposures));
      localStorage.setItem(STORAGE_KEYS.DISMISSED, JSON.stringify(next.dismissedCards));
      localStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(next.onboardingCompleted));
    } catch {
      // ignore
    }
  }

  listeners.forEach((listener) => listener());
}

const emptySubscribe = () => () => {};

export function UserStoreProvider({ children }: { children: React.ReactNode }) {
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // 挂载后激活真实客户端存储并通知组件安全更新
  React.useEffect(() => {
    if (!isClientMounted) {
      isClientMounted = true;
      initClientStorage();
      listeners.forEach((listener) => listener());
    }
  }, []);

  const state = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const toggleSaveCard = useCallback((cardId: string) => {
    emitChange((prev) => ({
      ...prev,
      savedCardIds: prev.savedCardIds.includes(cardId)
        ? prev.savedCardIds.filter((id) => id !== cardId)
        : [...prev.savedCardIds, cardId],
    }));
  }, []);

  const toggleMasterCard = useCallback((cardId: string) => {
    emitChange((prev) => ({
      ...prev,
      masteredCardIds: prev.masteredCardIds.includes(cardId)
        ? prev.masteredCardIds.filter((id) => id !== cardId)
        : [...prev.masteredCardIds, cardId],
    }));
  }, []);

  const addActionItem = useCallback((cardId: string, title: string) => {
    const newItem: ActionItem = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: "guest",
      cardId,
      title,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    emitChange((prev) => ({
      ...prev,
      actionItems: [newItem, ...prev.actionItems],
    }));
  }, []);

  const toggleActionItem = useCallback((id: string) => {
    emitChange((prev) => ({
      ...prev,
      actionItems: prev.actionItems.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "completed" ? "pending" : "completed",
              completedAt: item.status === "pending" ? new Date().toISOString() : undefined,
            }
          : item
      ),
    }));
  }, []);

  const removeActionItem = useCallback((id: string) => {
    emitChange((prev) => ({
      ...prev,
      actionItems: prev.actionItems.filter((item) => item.id !== id),
    }));
  }, []);

  const toggleLifeCondition = useCallback((condition: LifeCondition) => {
    emitChange((prev) => ({
      ...prev,
      lifeConditions: prev.lifeConditions.includes(condition)
        ? prev.lifeConditions.filter((c) => c !== condition)
        : [...prev.lifeConditions, condition],
    }));
  }, []);

  const toggleCategoryInterest = useCallback((category: string) => {
    emitChange((prev) => ({
      ...prev,
      interestedCategories: prev.interestedCategories.includes(category)
        ? prev.interestedCategories.filter((c) => c !== category)
        : [...prev.interestedCategories, category],
    }));
  }, []);

  const completeOnboarding = useCallback((conditions: LifeCondition[], interests?: string[]) => {
    emitChange((prev) => ({
      ...prev,
      lifeConditions: conditions,
      interestedCategories: interests || prev.interestedCategories,
      onboardingCompleted: true,
    }));
  }, []);

  const recordExposure = useCallback((conceptId: string, cardId: string, angle?: string) => {
    emitChange((prev) => {
      const existing = prev.exposures[conceptId];
      const now = new Date().toISOString();
      const updated: ConceptExposure = existing
        ? {
            ...existing,
            timesSeen: existing.timesSeen + 1,
            lastSeenAt: now,
            cardsSeen: existing.cardsSeen.includes(cardId)
              ? existing.cardsSeen
              : [...existing.cardsSeen, cardId],
            anglesSeen:
              angle && !existing.anglesSeen.includes(angle)
                ? [...existing.anglesSeen, angle]
                : existing.anglesSeen,
          }
        : {
            conceptId,
            userId: "guest",
            timesSeen: 1,
            lastSeenAt: now,
            cardsSeen: [cardId],
            anglesSeen: angle ? [angle] : [],
            mastered: false,
          };
      return {
        ...prev,
        exposures: { ...prev.exposures, [conceptId]: updated },
      };
    });
  }, []);

  const dismissCard = useCallback((cardId: string, reason: string = "not_interested") => {
    emitChange((prev) => {
      if (prev.dismissedCards.some((d) => d.cardId === cardId)) return prev;
      return {
        ...prev,
        dismissedCards: [
          ...prev.dismissedCards,
          { cardId, reason, dismissedAt: new Date().toISOString() },
        ],
      };
    });
  }, []);

  const refreshRecommendations = useCallback(() => {
    emitChange((prev) => ({
      ...prev,
      recommendationSeed: prev.recommendationSeed + 1,
    }));
  }, []);

  return (
    <UserStoreContext.Provider
      value={{
        savedCardIds: state.savedCardIds,
        masteredCardIds: state.masteredCardIds,
        actionItems: state.actionItems,
        lifeConditions: state.lifeConditions,
        interestedCategories: state.interestedCategories,
        exposures: state.exposures,
        dismissedCards: state.dismissedCards,
        onboardingCompleted: state.onboardingCompleted,
        recommendationSeed: state.recommendationSeed,
        toggleSaveCard,
        toggleMasterCard,
        addActionItem,
        toggleActionItem,
        removeActionItem,
        toggleLifeCondition,
        toggleCategoryInterest,
        completeOnboarding,
        recordExposure,
        dismissCard,
        refreshRecommendations,
        isHydrated,
      }}
    >
      {children}
    </UserStoreContext.Provider>
  );
}

export function useUserStore() {
  const context = useContext(UserStoreContext);
  if (!context) {
    throw new Error("useUserStore must be used within a UserStoreProvider");
  }
  return context;
}
