/**
 * 隐私优先的本地轻量事件埋点 (Privacy-First Local Analytics)
 * 严格遵照《Vibe Coding Master Prompt V4.0》规范：
 * 绝不上报个人敏感数据，仅记录匿名操作频次供本地体验优化
 */

export type AnalyticsEventType =
  | "card_view"
  | "card_save"
  | "card_unsave"
  | "card_master"
  | "action_add"
  | "action_complete"
  | "search_query"
  | "recommendation_refresh"
  | "onboarding_complete";

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  payload?: Record<string, string | number | boolean>;
  timestamp: string;
}

class LocalAnalytics {
  private events: AnalyticsEvent[] = [];
  private maxEvents = 100;

  public track(type: AnalyticsEventType, payload?: Record<string, string | number | boolean>): void {
    const event: AnalyticsEvent = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    if (process.env.NODE_ENV === "development") {
      console.debug(`[Analytics] ${type}`, payload);
    }
  }

  public getRecentEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  public clear(): void {
    this.events = [];
  }
}

export const analytics = new LocalAnalytics();
