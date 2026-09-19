"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function AdminMotion({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useGSAP(() => {
    gsap.from(".admin-reveal", { y: 28, opacity: 0, duration: .75, stagger: .07, ease: "power3.out" });
    gsap.utils.toArray<HTMLElement>(".admin-stack").forEach((card, index) => {
      gsap.fromTo(card, { y: 24 + index * 7, opacity: .6 }, { y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: card, start: "top 92%", end: "top 68%", scrub: true } });
    });
  }, { scope, dependencies: [pathname], revertOnUpdate: true });
  return <div ref={scope}>{children}</div>;
}
