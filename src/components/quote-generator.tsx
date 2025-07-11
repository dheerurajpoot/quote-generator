"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Download,
	Upload,
	ImageIcon,
	Search,
	Loader2,
	Palette,
	MoveUp,
	MoveDown,
	MoveLeft,
	MoveRight,
	AlignCenter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { searchImages, type ImageSearchResult } from "@/lib/image-service";
import { downloadQuoteImage } from "@/lib/download-utils";

const DEFAULT_BACKGROUNDS = [
	"/img1.jpg?height=600&width=600",
	"/img2.jpg?height=600&width=600&text=Nature",
	"/img3.jpg?height=600&width=600&text=Abstract",
	"/img4.jpg?height=600&width=600&text=Gradient",
	"/img5.jpg?height=600&width=600&text=Gradient",
	"/img6.jpg?height=600&width=600&text=Gradient",
	"/img7.jpg?height=600&width=600&text=Gradient",
	"/img8.jpg?height=600&width=600&text=Gradient",
	"/img9.jpg?height=600&width=600&text=Gradient",
	"/img10.jpg?height=600&width=600&text=Gradient",
	"/img11.jpg?height=600&width=600&text=Gradient",
	"/img12.jpg?height=600&width=600&text=Gradient",
	"/img13.jpg?height=600&width=600&text=Gradient",
	"/img14.jpg?height=600&width=600&text=Gradient",
	"/img15.jpg?height=600&width=600&text=Gradient",
	"/img16.jpg?height=600&width=600&text=Gradient",
	"/img17.jpg?height=600&width=600&text=Gradient",
	"/img18.jpg?height=600&width=600&text=Road",
];

// Extended font options including Devanagari support
const FONTS = [
	{ name: "Sans Serif", value: "font-sans" },
	{ name: "Serif", value: "font-serif" },
	{ name: "Monospace", value: "font-mono" },
	{ name: "Poppins (Devanagari Support)", value: "font-poppins" },
];

// Font weight options
const FONT_WEIGHTS = [
	{ name: "Normal", value: "font-normal" },
	{ name: "Medium", value: "font-medium" },
	{ name: "Semibold", value: "font-semibold" },
	{ name: "Bold", value: "font-bold" },
	{ name: "Extrabold", value: "font-extrabold" },
];

export default function QuoteGenerator() {
	const [quote, setQuote] = useState("Enter your quote text here...");
	const [watermark, setWatermark] = useState("@quote_art");
	const [backgroundColor, setBackgroundColor] =
		useState("rgba(0, 0, 0, 0.5)");
	const [backgroundOpacity, setBackgroundOpacity] = useState(50);
	const [textColor, setTextColor] = useState("#ffffff");
	const [watermarkColor, setWatermarkColor] = useState("#cccccc");
	const [fontSize, setFontSize] = useState(24);
	const [fontFamily, setFontFamily] = useState("font-sans");
	const [fontWeight, setFontWeight] = useState("font-semibold");
	const [backgroundImage, setBackgroundImage] = useState(
		DEFAULT_BACKGROUNDS[0]
	);

	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<ImageSearchResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [useSolidBackground, setUseSolidBackground] = useState(false);
	const [solidBackgroundColor, setSolidBackgroundColor] = useState("#3b82f6");
	const [hasSearched, setHasSearched] = useState(false);

	const canvasRef = useRef<HTMLDivElement>(null);

	const [quotePosition, setQuotePosition] = useState({ x: 0, y: 0 });
	const [watermarkPosition, setWatermarkPosition] = useState({ x: 0, y: 0 });

	// Update background opacity
	useEffect(() => {
		const opacity = backgroundOpacity / 100;
		const color = backgroundColor.replace(/[\d.]+\)$/g, `${opacity})`);
		setBackgroundColor(color);
	}, [backgroundOpacity, backgroundColor]);

	// Handle custom background upload
	const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (event) => {
				if (event.target?.result) {
					setBackgroundImage(event.target.result as string);
				}
			};
			reader.readAsDataURL(file);
		}
	};

	// Handle image search
	const handleImageSearch = async () => {
		if (!searchQuery.trim()) {
			setHasSearched(false);
			setSearchResults([]);
			return;
		}

		setIsSearching(true);
		try {
			const response = await searchImages(searchQuery);
			setSearchResults(response.photos);
			setHasSearched(true);
		} catch (error) {
			console.error("Error searching for images:", error);
		} finally {
			setIsSearching(false);
		}
	};

	// Clear search
	const clearSearch = () => {
		setSearchQuery("");
		setSearchResults([]);
		setHasSearched(false);
	};

	// Handle download
	const handleDownload = async () => {
		if (!canvasRef.current) return;
		await downloadQuoteImage(canvasRef.current, "quote-art.png");
	};

	return (
		<>
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				<div className='lg:col-span-2'>
					<Card className='mb-6'>
						<CardHeader>
							<CardTitle>Preview</CardTitle>
							<CardDescription>
								This is how your quote image will look
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='relative w-full aspect-square max-w-2xl mx-auto overflow-hidden rounded-lg'>
								<div
									ref={canvasRef}
									className='absolute inset-0 flex flex-col items-center justify-center p-8 text-center'
									style={{
										...(useSolidBackground
											? {
													backgroundColor:
														solidBackgroundColor,
											  }
											: {
													backgroundImage: `url(${backgroundImage})`,
													backgroundSize: "cover",
													backgroundPosition:
														"center",
											  }),
									}}>
									{!useSolidBackground && (
										<div
											className='absolute inset-0'
											style={{ backgroundColor }}></div>
									)}

									<div className='relative z-10 flex flex-col items-center justify-center h-full w-full'>
										<p
											className={cn(
												"mb-4 px-4 whitespace-pre-line text-center",
												fontFamily,
												fontWeight
											)}
											style={{
												color: textColor,
												fontSize: `${fontSize}px`,
												maxWidth: "100%",
												wordWrap: "break-word",
												lineHeight: 1.4,
												letterSpacing: "0.025em",
												wordSpacing: "0.05em",
												textRendering:
													"optimizeLegibility",
												WebkitFontSmoothing:
													"antialiased",
												MozOsxFontSmoothing:
													"grayscale",
												transform: `translate(${quotePosition.x}px, ${quotePosition.y}px)`,
												transition:
													"transform 0.2s ease-in-out",
											}}>
											{quote}
										</p>

										{watermark && (
											<p
												className=' text-sm opacity-70'
												style={{
													color: watermarkColor,
													letterSpacing: "0.025em",
													textRendering:
														"optimizeLegibility",
													WebkitFontSmoothing:
														"antialiased",
													MozOsxFontSmoothing:
														"grayscale",
													bottom: `${
														20 + watermarkPosition.y
													}px`,
													right: `${
														20 + watermarkPosition.x
													}px`,
													transform: `translate(${watermarkPosition.x}px, ${watermarkPosition.y}px)`,
													transition:
														"all 0.2s ease-in-out",
												}}>
												{watermark}
											</p>
										)}
									</div>
								</div>
							</div>
						</CardContent>
						<CardFooter className='flex flex-col sm:flex-row gap-4 justify-center'>
							<Button
								onClick={handleDownload}
								className='w-full sm:w-auto'>
								<Download className='mr-2 h-4 w-4' />
								Download Quote Image
							</Button>
						</CardFooter>
					</Card>
				</div>

				<div>
					<Tabs defaultValue='content'>
						<TabsList className='grid w-full grid-cols-3'>
							<TabsTrigger value='content'>Content</TabsTrigger>
							<TabsTrigger value='background'>
								Background
							</TabsTrigger>
							<TabsTrigger value='style'>Style</TabsTrigger>
						</TabsList>

						<TabsContent value='content' className='space-y-4 mt-4'>
							<Card className='border-none shadow-lg bg-gradient-to-br from-background to-muted/30'>
								<CardHeader>
									<CardTitle className='text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary'>
										Quote Content
									</CardTitle>
									<CardDescription className='text-foreground/80'>
										Enter your quote and customize its
										appearance
									</CardDescription>
								</CardHeader>
								<CardContent className='space-y-6'>
									<div className='space-y-4'>
										<Label
											htmlFor='quote'
											className='text-lg font-semibold'>
											Quote Text
										</Label>
										<Textarea
											id='quote'
											placeholder='Enter your quote here'
											value={quote}
											onChange={(e) =>
												setQuote(e.target.value)
											}
											rows={4}
											className='resize-y min-h-[100px] bg-muted/50 border-muted-foreground/20 focus:border-primary'
										/>
									</div>

									<div className='space-y-4'>
										<Label
											htmlFor='watermark'
											className='text-lg font-semibold'>
											Watermark
										</Label>
										<Input
											id='watermark'
											placeholder='Your brand or username'
											value={watermark}
											onChange={(e) =>
												setWatermark(e.target.value)
											}
											className='bg-muted/50 border-muted-foreground/20 focus:border-primary'
										/>
									</div>

									<div className='space-y-4'>
										<Label className='text-lg font-semibold'>
											Quote Placement
										</Label>
										<div className='flex flex-col items-center gap-2'>
											<Button
												variant='outline'
												className='col-start-2'
												onClick={() =>
													setQuotePosition(
														(prev) => ({
															...prev,
															y: prev.y - 10,
														})
													)
												}>
												<MoveUp className='h-4 w-4' />
											</Button>
											<div className='flex gap-2'>
												<Button
													variant='outline'
													onClick={() =>
														setQuotePosition(
															(prev) => ({
																...prev,
																x: prev.x - 10,
															})
														)
													}>
													<MoveLeft className='h-4 w-4' />
												</Button>
												<Button
													variant='outline'
													onClick={() =>
														setQuotePosition({
															x: 0,
															y: 0,
														})
													}>
													<AlignCenter className='h-4 w-4' />
												</Button>
												<Button
													variant='outline'
													onClick={() =>
														setQuotePosition(
															(prev) => ({
																...prev,
																x: prev.x + 10,
															})
														)
													}>
													<MoveRight className='h-4 w-4' />
												</Button>
											</div>
											<Button
												variant='outline'
												className='col-start-2'
												onClick={() =>
													setQuotePosition(
														(prev) => ({
															...prev,
															y: prev.y + 10,
														})
													)
												}>
												<MoveDown className='h-4 w-4' />
											</Button>
										</div>
									</div>

									<div className='space-y-4'>
										<Label className='text-lg font-semibold'>
											Watermark Placement
										</Label>
										<div className='flex flex-col items-center gap-2'>
											<Button
												variant='outline'
												className='col-start-2'
												onClick={() =>
													setWatermarkPosition(
														(prev) => ({
															...prev,
															y: prev.y - 10,
														})
													)
												}>
												<MoveUp className='h-4 w-4' />
											</Button>
											<div className='flex gap-2'>
												<Button
													variant='outline'
													onClick={() =>
														setWatermarkPosition(
															(prev) => ({
																...prev,
																x: prev.x - 10,
															})
														)
													}>
													<MoveLeft className='h-4 w-4' />
												</Button>
												<Button
													variant='outline'
													onClick={() =>
														setWatermarkPosition({
															x: 0,
															y: 0,
														})
													}>
													<AlignCenter className='h-4 w-4' />
												</Button>
												<Button
													variant='outline'
													onClick={() =>
														setWatermarkPosition(
															(prev) => ({
																...prev,
																x: prev.x + 10,
															})
														)
													}>
													<MoveRight className='h-4 w-4' />
												</Button>
											</div>
											<Button
												variant='outline'
												className='col-start-2'
												onClick={() =>
													setWatermarkPosition(
														(prev) => ({
															...prev,
															y: prev.y + 10,
														})
													)
												}>
												<MoveDown className='h-4 w-4' />
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent
							value='background'
							className='space-y-4 mt-4'>
							<Card>
								<CardHeader>
									<CardTitle>Background</CardTitle>
									<CardDescription>
										Choose a background type and customize
										it
									</CardDescription>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div className='flex items-center space-x-2'>
										<Button
											variant={
												useSolidBackground
													? "outline"
													: "default"
											}
											className='flex-1'
											onClick={() =>
												setUseSolidBackground(false)
											}>
											<ImageIcon className='mr-2 h-4 w-4' />
											Image
										</Button>
										<Button
											variant={
												useSolidBackground
													? "default"
													: "outline"
											}
											className='flex-1'
											onClick={() =>
												setUseSolidBackground(true)
											}>
											<Palette className='mr-2 h-4 w-4' />
											Solid Color
										</Button>
									</div>

									{useSolidBackground ? (
										<div className='space-y-2'>
											<Label htmlFor='solid-bg-color'>
												Background Color
											</Label>
											<div className='flex gap-2'>
												<div
													className='w-10 h-10 rounded border'
													style={{
														backgroundColor:
															solidBackgroundColor,
													}}></div>
												<Input
													id='solid-bg-color'
													type='color'
													value={solidBackgroundColor}
													onChange={(e) =>
														setSolidBackgroundColor(
															e.target.value
														)
													}
													className='w-full h-10'
												/>
											</div>
										</div>
									) : (
										<>
											<div className='space-y-2'>
												<Label>Search Images</Label>
												<div className='flex items-center gap-2'>
													<Input
														placeholder='Search for images...'
														value={searchQuery}
														onChange={(e) =>
															setSearchQuery(
																e.target.value
															)
														}
														onKeyDown={(e) =>
															e.key === "Enter" &&
															handleImageSearch()
														}
													/>
													<Button
														onClick={
															handleImageSearch
														}
														disabled={isSearching}>
														{isSearching ? (
															<Loader2 className='h-4 w-4 animate-spin' />
														) : (
															<Search className='h-4 w-4' />
														)}
													</Button>
													{hasSearched && (
														<Button
															variant='ghost'
															size='icon'
															onClick={
																clearSearch
															}>
															×
														</Button>
													)}
												</div>
											</div>

											<div className='space-y-2'>
												{hasSearched &&
												searchResults.length > 0 ? (
													<>
														<Label>
															Search Results
														</Label>
														<div className='h-[380px] overflow-y-auto pr-2 -mr-2'>
															<div className='grid grid-cols-2 gap-2'>
																{searchResults.map(
																	(image) => (
																		<div
																			key={
																				image.id
																			}
																			className={cn(
																				"relative aspect-square rounded-md overflow-hidden cursor-pointer border-2",
																				backgroundImage ===
																					image
																						.src
																						.medium
																					? "border-primary"
																					: "border-transparent"
																			)}
																			onClick={() =>
																				setBackgroundImage(
																					image
																						.src
																						.medium
																				)
																			}>
																			<img
																				src={
																					image
																						.src
																						.medium ||
																					"/placeholder.svg"
																				}
																				alt={`Photo by ${image.photographer}`}
																				className='w-full h-full object-cover'
																			/>
																		</div>
																	)
																)}
															</div>
														</div>
													</>
												) : hasSearched ? (
													<div className='flex flex-col items-center justify-center py-4 text-center text-muted-foreground'>
														<p>
															No results found for
															&quot;{searchQuery}
															&quot;
														</p>
														<p className='text-sm'>
															Try a different
															search term
														</p>
													</div>
												) : (
													<>
														<Label>
															Preset Backgrounds
														</Label>
														<div className='h-[380px] overflow-y-auto pr-2 -mr-2'>
															<div className='grid grid-cols-2 gap-2'>
																{DEFAULT_BACKGROUNDS.map(
																	(
																		bg,
																		index
																	) => (
																		<div
																			key={
																				index
																			}
																			className={cn(
																				"relative aspect-square rounded-md overflow-hidden cursor-pointer border-2",
																				backgroundImage ===
																					bg
																					? "border-primary"
																					: "border-transparent"
																			)}
																			onClick={() =>
																				setBackgroundImage(
																					bg
																				)
																			}>
																			<img
																				src={
																					bg ||
																					"/placeholder.svg"
																				}
																				alt={`Background ${
																					index +
																					1
																				}`}
																				className='w-full h-full object-cover'
																			/>
																		</div>
																	)
																)}
															</div>
														</div>
													</>
												)}
											</div>

											<div className='space-y-2'>
												<Label htmlFor='custom-bg'>
													Upload Custom Background
												</Label>
												<div className='flex items-center gap-2'>
													<Button
														variant='outline'
														onClick={() =>
															document
																.getElementById(
																	"bg-upload"
																)
																?.click()
														}
														className='w-full'>
														<Upload className='mr-2 h-4 w-4' />
														Upload Image
													</Button>
													<input
														id='bg-upload'
														type='file'
														accept='image/*'
														className='hidden'
														onChange={
															handleBackgroundUpload
														}
													/>
												</div>
											</div>

											<div className='space-y-2'>
												<div className='flex justify-between'>
													<Label htmlFor='overlay-opacity'>
														Overlay Opacity
													</Label>
													<span>
														{backgroundOpacity}%
													</span>
												</div>
												<Slider
													id='overlay-opacity'
													min={0}
													max={100}
													step={1}
													value={[backgroundOpacity]}
													onValueChange={(value) =>
														setBackgroundOpacity(
															value[0]
														)
													}
												/>
											</div>
										</>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value='style' className='space-y-4 mt-4'>
							<Card>
								<CardHeader>
									<CardTitle>Text Style</CardTitle>
									<CardDescription>
										Customize font, size, weight and colors
									</CardDescription>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div className='space-y-2'>
										<Label htmlFor='font-family'>
											Font Family
										</Label>
										<Select
											value={fontFamily}
											onValueChange={setFontFamily}>
											<SelectTrigger>
												<SelectValue placeholder='Select font' />
											</SelectTrigger>
											<SelectContent>
												{FONTS.map((font) => (
													<SelectItem
														key={font.value}
														value={font.value}>
														{font.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='font-weight'>
											Font Weight
										</Label>
										<Select
											value={fontWeight}
											onValueChange={setFontWeight}>
											<SelectTrigger>
												<SelectValue placeholder='Select weight' />
											</SelectTrigger>
											<SelectContent>
												{FONT_WEIGHTS.map((weight) => (
													<SelectItem
														key={weight.value}
														value={weight.value}>
														{weight.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className='space-y-2'>
										<div className='flex justify-between'>
											<Label htmlFor='font-size'>
												Font Size
											</Label>
											<span>{fontSize}px</span>
										</div>
										<Slider
											id='font-size'
											min={8}
											max={72}
											step={1}
											value={[fontSize]}
											onValueChange={(value) =>
												setFontSize(value[0])
											}
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='text-color'>
											Text Color
										</Label>
										<div className='flex gap-2'>
											<div
												className='w-10 h-10 rounded border'
												style={{
													backgroundColor: textColor,
												}}></div>
											<Input
												id='text-color'
												type='color'
												value={textColor}
												onChange={(e) =>
													setTextColor(e.target.value)
												}
												className='w-full h-10'
											/>
										</div>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='watermark-color'>
											Watermark Color
										</Label>
										<div className='flex gap-2'>
											<div
												className='w-10 h-10 rounded border'
												style={{
													backgroundColor:
														watermarkColor,
												}}></div>
											<Input
												id='watermark-color'
												type='color'
												value={watermarkColor}
												onChange={(e) =>
													setWatermarkColor(
														e.target.value
													)
												}
												className='w-full h-10'
											/>
										</div>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='overlay-color'>
											Overlay Color
										</Label>
										<div className='flex gap-2'>
											<div
												className='w-10 h-10 rounded border'
												style={{
													backgroundColor:
														backgroundColor.replace(
															/[\d.]+\)$/g,
															"1)"
														),
												}}></div>
											<Input
												id='overlay-color'
												type='color'
												value={backgroundColor.replace(
													/rgba\((\d+),\s*(\d+),\s*(\d+).*/,
													"rgb($1,$2,$3)"
												)}
												onChange={(e) => {
													const rgb =
														e.target.value.match(
															/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i
														);
													if (rgb) {
														const r =
															Number.parseInt(
																rgb[1],
																16
															);
														const g =
															Number.parseInt(
																rgb[2],
																16
															);
														const b =
															Number.parseInt(
																rgb[3],
																16
															);
														setBackgroundColor(
															`rgba(${r}, ${g}, ${b}, ${
																backgroundOpacity /
																100
															})`
														);
													}
												}}
												className='w-full h-10'
											/>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</>
	);
}
