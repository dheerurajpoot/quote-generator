const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;

export interface ImageSearchResult {
	id: string;
	width: number;
	height: number;
	url: string;
	photographer: string;
	photographer_url: string;
	avg_color: string;
	src: {
		original: string;
		large2x: string;
		large: string;
		medium: string;
		small: string;
		portrait: string;
		landscape: string;
		tiny: string;
	};
}

export interface SearchResponse {
	total_results: number;
	page: number;
	per_page: number;
	photos: ImageSearchResult[];
	next_page: string;
}

export async function searchImages(
	query: string,
	page = 1,
	perPage = 15
): Promise<SearchResponse> {
	// For demo purposes, we'll use a mock response if no API key is provided
	if (!PEXELS_API_KEY) {
		return getMockImages(query, page, perPage);
	}

	try {
		const response = await fetch(
			`https://api.pexels.com/v1/search?query=${encodeURIComponent(
				query
			)}&page=${page}&per_page=${perPage}`,
			{
				headers: {
					Authorization: PEXELS_API_KEY,
				},
			}
		);
		console.log(response);

		if (!response.ok) {
			throw new Error("Failed to fetch images");
		}

		return await response.json();
	} catch (error) {
		console.error("Error searching images:", error);
		return getMockImages(query, page, perPage);
	}
}

// Mock function for demo purposes
function getMockImages(
	query: string,
	page: number,
	perPage: number
): SearchResponse {
	const mockImages = [
		{
			id: "1",
			width: 1200,
			height: 800,
			url: "/placeholder.svg?height=800&width=1200&text=Nature",
			photographer: "Photographer 1",
			photographer_url: "#",
			avg_color: "#4C6A78",
			src: {
				original: "/placeholder.svg?height=800&width=1200&text=Nature",
				large2x: "/placeholder.svg?height=800&width=1200&text=Nature",
				large: "/placeholder.svg?height=800&width=1200&text=Nature",
				medium: "/placeholder.svg?height=800&width=1200&text=Nature",
				small: "/placeholder.svg?height=800&width=1200&text=Nature",
				portrait: "/placeholder.svg?height=800&width=1200&text=Nature",
				landscape: "/placeholder.svg?height=800&width=1200&text=Nature",
				tiny: "/placeholder.svg?height=800&width=1200&text=Nature",
			},
		},
		{
			id: "2",
			width: 1200,
			height: 800,
			url: "/placeholder.svg?height=800&width=1200&text=Mountains",
			photographer: "Photographer 2",
			photographer_url: "#",
			avg_color: "#5D4B3A",
			src: {
				original:
					"/placeholder.svg?height=800&width=1200&text=Mountains",
				large2x:
					"/placeholder.svg?height=800&width=1200&text=Mountains",
				large: "/placeholder.svg?height=800&width=1200&text=Mountains",
				medium: "/placeholder.svg?height=800&width=1200&text=Mountains",
				small: "/placeholder.svg?height=800&width=1200&text=Mountains",
				portrait:
					"/placeholder.svg?height=800&width=1200&text=Mountains",
				landscape:
					"/placeholder.svg?height=800&width=1200&text=Mountains",
				tiny: "/placeholder.svg?height=800&width=1200&text=Mountains",
			},
		},
		{
			id: "3",
			width: 1200,
			height: 800,
			url: "/placeholder.svg?height=800&width=1200&text=Ocean",
			photographer: "Photographer 3",
			photographer_url: "#",
			avg_color: "#2A3B4C",
			src: {
				original: "/placeholder.svg?height=800&width=1200&text=Ocean",
				large2x: "/placeholder.svg?height=800&width=1200&text=Ocean",
				large: "/placeholder.svg?height=800&width=1200&text=Ocean",
				medium: "/placeholder.svg?height=800&width=1200&text=Ocean",
				small: "/placeholder.svg?height=800&width=1200&text=Ocean",
				portrait: "/placeholder.svg?height=800&width=1200&text=Ocean",
				landscape: "/placeholder.svg?height=800&width=1200&text=Ocean",
				tiny: "/placeholder.svg?height=800&width=1200&text=Ocean",
			},
		},
		{
			id: "4",
			width: 1200,
			height: 800,
			url: "/placeholder.svg?height=800&width=1200&text=City",
			photographer: "Photographer 4",
			photographer_url: "#",
			avg_color: "#3A3A3A",
			src: {
				original: "/placeholder.svg?height=800&width=1200&text=City",
				large2x: "/placeholder.svg?height=800&width=1200&text=City",
				large: "/placeholder.svg?height=800&width=1200&text=City",
				medium: "/placeholder.svg?height=800&width=1200&text=City",
				small: "/placeholder.svg?height=800&width=1200&text=City",
				portrait: "/placeholder.svg?height=800&width=1200&text=City",
				landscape: "/placeholder.svg?height=800&width=1200&text=City",
				tiny: "/placeholder.svg?height=800&width=1200&text=City",
			},
		},
		{
			id: "5",
			width: 1200,
			height: 800,
			url: "/placeholder.svg?height=800&width=1200&text=Abstract",
			photographer: "Photographer 5",
			photographer_url: "#",
			avg_color: "#7A4B2F",
			src: {
				original:
					"/placeholder.svg?height=800&width=1200&text=Abstract",
				large2x: "/placeholder.svg?height=800&width=1200&text=Abstract",
				large: "/placeholder.svg?height=800&width=1200&text=Abstract",
				medium: "/placeholder.svg?height=800&width=1200&text=Abstract",
				small: "/placeholder.svg?height=800&width=1200&text=Abstract",
				portrait:
					"/placeholder.svg?height=800&width=1200&text=Abstract",
				landscape:
					"/placeholder.svg?height=800&width=1200&text=Abstract",
				tiny: "/placeholder.svg?height=800&width=1200&text=Abstract",
			},
		},
		{
			id: "6",
			width: 1200,
			height: 800,
			url: "/placeholder.svg?height=800&width=1200&text=Sunset",
			photographer: "Photographer 6",
			photographer_url: "#",
			avg_color: "#D9A566",
			src: {
				original: "/placeholder.svg?height=800&width=1200&text=Sunset",
				large2x: "/placeholder.svg?height=800&width=1200&text=Sunset",
				large: "/placeholder.svg?height=800&width=1200&text=Sunset",
				medium: "/placeholder.svg?height=800&width=1200&text=Sunset",
				small: "/placeholder.svg?height=800&width=1200&text=Sunset",
				portrait: "/placeholder.svg?height=800&width=1200&text=Sunset",
				landscape: "/placeholder.svg?height=800&width=1200&text=Sunset",
				tiny: "/placeholder.svg?height=800&width=1200&text=Sunset",
			},
		},
	];

	// Filter by query if provided
	const filtered = query
		? mockImages.filter((img) =>
				img.url.toLowerCase().includes(query.toLowerCase())
		  )
		: mockImages;

	return {
		total_results: filtered.length,
		page,
		per_page: perPage,
		photos: filtered.slice((page - 1) * perPage, page * perPage),
		next_page: filtered.length > page * perPage ? `page=${page + 1}` : "",
	};
}
