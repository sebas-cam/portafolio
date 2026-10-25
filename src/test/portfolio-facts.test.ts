import { describe, expect, it } from "vitest";
import { numbers, selectedProjects } from "@/content/site";
describe("Supplied product rules", () => {
  it("Sonríe has a single S/99 monthly plan and its live link", () => {
    const sonrie = selectedProjects.find(p => p.name === "Sonríe");
    expect(sonrie?.monthlyPricePEN).toBe(99);
    expect(sonrie?.url).toBe("https://www.sonrie.lat/dental");
  });
  it("Kompry is the AI sales agent with a live site link", () => {
    const kompry = selectedProjects.find(p => p.name === "Kompry");
    expect(kompry?.url).toBe("https://kompry.com");
    expect(kompry?.stack).toContain("Convex");
  });
  it("The hero counts ~20 bookings a day handled by the bot", () => {
    expect(numbers.some(n => n.value === "~20" && n.label.en.toLowerCase().includes("bookings a day"))).toBe(true);
  });
  it("NotScrolling caps concurrency at 2", () => {
    expect(selectedProjects.find(p => p.name === "NotScrolling")?.limits?.concurrency).toBe(2);
  });
  it("NotScrolling uses a 4 GB VPS", () => {
    expect(selectedProjects.find(p => p.name === "NotScrolling")?.limits?.vpsGB).toBe(4);
  });
  it("NotScrolling targets the WhatsApp 16 MB limit", () => {
    expect(selectedProjects.find(p => p.name === "NotScrolling")?.limits?.whatsappMB).toBe(16);
  });
});
