"use client";

import { useState, useSyncExternalStore } from "react";
import { useUserStore } from "@/context/UserStoreContext";
import { LifeCondition } from "@/types/user";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

const INTEREST_OPTIONS = [
  { id: "health", label: "健康与身体" },
  { id: "diet", label: "饮食与营养" },
  { id: "home_safety", label: "家庭安全" },
  { id: "traffic", label: "交通安全" },
  { id: "living", label: "租房与居住" },
  { id: "money", label: "金钱与消费" },
  { id: "legal", label: "法律与权益" },
  { id: "digital", label: "网络与数字安全" },
];

const CONDITION_OPTIONS: { id: LifeCondition; label: string }[] = [
  { id: "living_alone", label: "独居生活" },
  { id: "renting", label: "租房生活" },
  { id: "driving", label: "经常开车" },
  { id: "cooking_often", label: "自己做饭" },
  { id: "has_pet", label: "养宠物" },
  { id: "has_partner", label: "有伴侣" },
  { id: "has_children", label: "有孩子" },
  { id: "frequent_traveler", label: "经常旅行" },
  { id: "freelancing", label: "自由职业" },
];

export function OnboardingModal() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const { onboardingCompleted, completeOnboarding } = useUserStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["health", "home_safety"]);
  const [selectedConditions, setSelectedConditions] = useState<LifeCondition[]>(["renting", "cooking_often"]);

  if (!isMounted || onboardingCompleted) {
    return null;
  }

  const handleFinish = () => {
    completeOnboarding(selectedConditions, selectedInterests);
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleCondition = (id: LifeCondition) => {
    setSelectedConditions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative">
        {/* 步骤 1：欢迎与产品定位 */}
        {step === 1 && (
          <div className="text-center py-4 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 mx-auto flex items-center justify-center shadow-md">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                人生常识
              </h2>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                把没人系统教过你的生活常识，补起来。
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed px-4">
                不做百科，不卖焦虑。只做有证据、能改变决定、能降低生活风险的真正常识。
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-sm font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer touch-manipulation active:scale-[0.98]"
              >
                <span>开始生活探索</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full text-xs text-zinc-400 hover:text-zinc-600 py-2 cursor-pointer touch-manipulation transition-colors"
              >
                直接进入，稍后设置
              </button>
            </div>
          </div>
        )}

        {/* 步骤 2：感兴趣领域 */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>第 2 / 3 步</span>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-zinc-500 hover:text-zinc-800"
              >
                跳过
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                你更想先补哪些方面？
              </h3>
              <p className="text-xs text-zinc-400 mt-1">选择你关心的生活模块，优先为你呈现</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {INTEREST_OPTIONS.map((opt) => {
                const active = selectedInterests.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleInterest(opt.id)}
                    className={cn(
                      "p-2.5 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between",
                      active
                        ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                        : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                    )}
                  >
                    <span>{opt.label}</span>
                    {active && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold flex items-center justify-center space-x-1"
            >
              <span>下一步</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 步骤 3：生活状态 */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>第 3 / 3 步</span>
              <button
                type="button"
                onClick={handleFinish}
                className="text-zinc-500 hover:text-zinc-800"
              >
                跳过
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                哪些生活状态与你有关？
              </h3>
              <p className="text-xs text-zinc-400 mt-1">用于为你匹配“与你有关”的高价值场景</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {CONDITION_OPTIONS.map((opt) => {
                const active = selectedConditions.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleCondition(opt.id)}
                    className={cn(
                      "p-2.5 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between",
                      active
                        ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                        : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                    )}
                  >
                    <span>{opt.label}</span>
                    {active && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold flex items-center justify-center space-x-1"
            >
              <span>完成配置，查看今日常识</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
