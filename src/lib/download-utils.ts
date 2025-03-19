export async function downloadQuoteImage(
	element: HTMLElement,
	filename = "quote-art.png"
) {
	try {
		const html2canvas = (await import("html2canvas")).default;
		const canvas = await html2canvas(element, {
			allowTaint: true,
			useCORS: true,
			scale: 2,
		});

		const image = canvas.toDataURL("image/png");
		const link = document.createElement("a");
		link.href = image;
		link.download = filename;
		link.click();

		return true;
	} catch (error) {
		console.error("Error generating image:", error);
		return false;
	}
}
