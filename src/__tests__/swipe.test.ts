import { describe, expect, it } from "vitest";
import { getSwipeAxis, getVerticalSwipeDirection } from "@/lib/swipe";

describe("Random card swipe gestures", () => {
  it("waits until movement is large enough before locking an axis", () => {
    expect(getSwipeAxis({ deltaX: 3, deltaY: 4 })).toBe("none");
    expect(getSwipeAxis({ deltaX: 5, deltaY: 18 })).toBe("vertical");
    expect(getSwipeAxis({ deltaX: -20, deltaY: 8 })).toBe("horizontal");
  });

  it("switches cards only for a clear vertical swipe", () => {
    expect(getVerticalSwipeDirection({ deltaX: 8, deltaY: -64 })).toBe("next");
    expect(getVerticalSwipeDirection({ deltaX: -6, deltaY: 70 })).toBe("previous");
    expect(getVerticalSwipeDirection({ deltaX: 4, deltaY: -30 })).toBeNull();
    expect(getVerticalSwipeDirection({ deltaX: 60, deltaY: 55 })).toBeNull();
  });
});
