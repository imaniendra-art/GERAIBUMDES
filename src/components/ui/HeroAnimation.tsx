"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

export function HeroAnimation() {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("https://lottie.host/1c8f4951-60a6-4a41-86cc-72eb962821b0/7Wv9Qh8R3O.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load Lottie JSON");
        // Ensure it's json before parsing
        const contentType = res.headers.get("content-type");
        if (contentType && !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }
        return res.json();
      })
      .then((data) => setAnimationData(data))
      .catch((err) => {
        console.error("Error loading Lottie animation:", err);
        // Set a fallback object or handle error to stop loading skeleton
        setAnimationData({ err: true });
      });
  }, []);

  if (!animationData) {
    return (
      <div className="w-full aspect-square max-w-lg mx-auto flex items-center justify-center bg-white/5 rounded-2xl animate-pulse">
        <span className="text-white/40">Loading...</span>
      </div>
    );
  }

  if (animationData?.err) {
    return (
      <div className="w-full aspect-square max-w-lg mx-auto flex items-center justify-center bg-primary/20 rounded-2xl border border-primary/30">
        <span className="text-primary/60 text-sm">Animasi Hero (Placeholder)</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto flex justify-center">
      <Lottie animationData={animationData} loop={true} className="w-full h-auto drop-shadow-2xl" />
    </div>
  );
}
