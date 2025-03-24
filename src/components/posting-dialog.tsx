import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Facebook, Instagram, Loader2 } from "lucide-react";

interface PostingDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onPost: (platforms: string[]) => Promise<void>;
	connectedPlatforms: string[];
}

export function PostingDialog({
	isOpen,
	onClose,
	onPost,
	connectedPlatforms,
}: PostingDialogProps) {
	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
	const [isPosting, setIsPosting] = useState(false);

	const handlePlatformToggle = (platform: string) => {
		if (selectedPlatforms.includes(platform)) {
			setSelectedPlatforms(
				selectedPlatforms.filter((p) => p !== platform)
			);
		} else {
			setSelectedPlatforms([...selectedPlatforms, platform]);
		}
	};

	const handlePost = async () => {
		if (selectedPlatforms.length === 0) return;

		setIsPosting(true);
		try {
			await onPost(selectedPlatforms);
			onClose();
		} catch (error) {
			console.error("Error posting:", error);
		} finally {
			setIsPosting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Share Quote</DialogTitle>
				</DialogHeader>
				<div className='space-y-4'>
					{connectedPlatforms.length === 0 ? (
						<p className='text-sm text-muted-foreground'>
							Please connect at least one social media platform to
							share your quote.
						</p>
					) : (
						<div className='space-y-2'>
							<div className='flex items-center space-x-2'>
								<Checkbox
									id='facebook'
									checked={selectedPlatforms.includes(
										"facebook"
									)}
									onCheckedChange={() =>
										handlePlatformToggle("facebook")
									}
									disabled={
										!connectedPlatforms.includes("facebook")
									}
								/>
								<Label
									htmlFor='facebook'
									className='flex items-center cursor-pointer'>
									<Facebook className='h-4 w-4 text-blue-600 mr-2' />
									Facebook
									{!connectedPlatforms.includes(
										"facebook"
									) && (
										<span className='ml-2 text-xs text-muted-foreground'>
											(Not Connected)
										</span>
									)}
								</Label>
							</div>
							<div className='flex items-center space-x-2'>
								<Checkbox
									id='instagram'
									checked={selectedPlatforms.includes(
										"instagram"
									)}
									onCheckedChange={() =>
										handlePlatformToggle("instagram")
									}
									disabled={
										!connectedPlatforms.includes(
											"instagram"
										)
									}
								/>
								<Label
									htmlFor='instagram'
									className='flex items-center cursor-pointer'>
									<Instagram className='h-4 w-4 text-pink-600 mr-2' />
									Instagram
									{!connectedPlatforms.includes(
										"instagram"
									) && (
										<span className='ml-2 text-xs text-muted-foreground'>
											(Not Connected)
										</span>
									)}
								</Label>
							</div>
						</div>
					)}
				</div>
				<div className='flex justify-end space-x-2'>
					<Button variant='outline' onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={handlePost}
						disabled={selectedPlatforms.length === 0 || isPosting}>
						{isPosting ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Posting...
							</>
						) : (
							"Post"
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
