import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/ejemplo", "/privacidad", "/terminos"].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.5,
  }));
}
