"use client";

import { useEffect } from "react";

const SERVICE_WORKER_VERSION = "3";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => {
          keys
            .filter((key) => key.startsWith("lk-"))
            .forEach((key) => caches.delete(key));
        });
      }
      return;
    }

    let refreshing = false;
    const hadController = Boolean(navigator.serviceWorker.controller);

    const handleControllerChange = () => {
      if (!hadController || refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange
    );

    navigator.serviceWorker
      .register(`/sw.js?v=${SERVICE_WORKER_VERSION}`, {
        scope: "/",
        updateViaCache: "none",
      })
      .then((registration) => registration.update())
      .catch((error) => {
        console.warn("LifeKnowledge ServiceWorker registration failed:", error);
      });

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );
    };
  }, []);

  return null;
}
