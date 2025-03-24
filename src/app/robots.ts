import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constant";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/admin", "/dashboard", "/api"],
		},
		sitemap: `${SITE_URL}/sitemap.xml`,
	};
}
