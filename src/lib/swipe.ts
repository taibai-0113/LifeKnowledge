export type SwipeAxis = "none" | "vertical" | "horizontal";

interface SwipeMetrics {
  deltaX: number;
  deltaY: number;
}

export function getSwipeAxis(
  { deltaX, deltaY }: SwipeMetrics,
  axisLockThreshold = 8
): SwipeAxis {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (Math.max(absX, absY) < axisLockThreshold) return "none";
  return absY > absX ? "vertical" : "horizontal";
}

export function getVerticalSwipeDirection(
  { deltaX, deltaY }: SwipeMetrics,
  completionThreshold = 52
): "next" | "previous" | null {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (absY < completionThreshold || absY < absX * 1.2) return null;
  return deltaY < 0 ? "next" : "previous";
}
