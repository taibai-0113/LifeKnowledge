import { ReactNode, Suspense } from "react";
import { BottomNav } from "./BottomNav";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { PwaRegister } from "./PwaRegister";

interface AppShellProps {
  children: ReactNode;
  showNav?: boolean;
}

export function AppShell({ children, showNav = true }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-zinc-200 dark:selection:bg-zinc-800">
      <main className="flex-1 w-full max-w-md mx-auto pb-28 sm:pb-24 shadow-xs border-x border-zinc-200/40 dark:border-zinc-800/40 bg-surface min-h-screen">
        {children}
      </main>
      <OnboardingModal />
      <PwaRegister />
      {showNav && (
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
      )}
    </div>
  );
}
