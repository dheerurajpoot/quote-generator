"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";

interface UPIPaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	amount: number;
	planName: string;
	onPaymentSubmit: (transactionId: string) => Promise<void>;
}

export function UPIPaymentModal({
	isOpen,
	onClose,
	amount,
	planName,
	onPaymentSubmit,
}: UPIPaymentModalProps) {
	const [transactionId, setTransactionId] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const handleSubmit = async () => {
		if (!transactionId.trim()) {
			setError("Please enter the transaction ID");
			return;
		}

		setIsSubmitting(true);
		setError("");
		try {
			await onPaymentSubmit(transactionId.trim());
			setSuccess(true);
			setTimeout(() => {
				onClose();
				setSuccess(false);
				setTransactionId("");
			}, 2000);
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(
					err.message || "Failed to submit payment. Please try again."
				);
			} else {
				setError("Failed to submit payment. Please try again.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		if (!isSubmitting) {
			onClose();
			setTransactionId("");
			setError("");
			setSuccess(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='sm:max-w-lg'>
				<DialogHeader>
					<DialogTitle className='text-center'>
						UPI Payment - {planName}
					</DialogTitle>
				</DialogHeader>

				<div className='space-y-6'>
					{/* QR Code Section */}
					<div className='text-center'>
						<div className='bg-gray-100 flex flex-col items-center justify-center rounded-lg p-6 mb-4'>
							<Image
								src='/qrcode.jpeg'
								alt='QR Code'
								width={200}
								height={200}
							/>
							<p className='text-sm text-gray-500 mt-2'>
								Scan this QR code with any UPI app
							</p>
						</div>

						<div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
							<h3 className='font-semibold text-blue-900 mb-2'>
								Payment Details
							</h3>
							<div className='space-y-2 text-sm'>
								<div className='flex justify-between'>
									<span className='text-gray-600'>
										Amount:
									</span>
									<span className='font-semibold'>
										₹{amount}
									</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-gray-600'>Plan:</span>
									<span className='font-semibold'>
										{planName}
									</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-gray-600'>
										UPI ID:
									</span>
									<span className='font-semibold text-blue-600'>
										adsenseservices90@axl
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Instructions */}
					<div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
						<h4 className='font-semibold text-yellow-800 mb-2'>
							How to pay:
						</h4>
						<ol className='text-sm text-yellow-700 space-y-1 list-decimal list-inside'>
							<li>
								Scan the QR code with any UPI app (GPay,
								PhonePe, Paytm, etc.)
							</li>
							<li>Verify the amount and UPI ID</li>
							<li>Complete the payment</li>
							<li>Copy the transaction ID from the app</li>
							<li>Paste it below and submit</li>
						</ol>
					</div>

					{/* Transaction ID Input */}
					<div className='space-y-2'>
						<Label htmlFor='transactionId'>Transaction ID</Label>
						<Input
							id='transactionId'
							placeholder='Enter transaction ID from UPI app'
							value={transactionId}
							onChange={(e) => setTransactionId(e.target.value)}
							disabled={isSubmitting}
						/>
					</div>

					{/* Error Alert */}
					{error && (
						<Alert variant='destructive'>
							<AlertCircle className='h-4 w-4' />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{/* Success Alert */}
					{success && (
						<Alert className='bg-green-50 border-green-200'>
							<CheckCircle className='h-4 w-4 text-green-600' />
							<AlertDescription className='text-green-800'>
								Payment submitted successfully! Your
								subscription will be activated after
								verification.
							</AlertDescription>
						</Alert>
					)}

					{/* Action Buttons */}
					<div className='flex gap-3'>
						<Button
							variant='outline'
							onClick={handleClose}
							disabled={isSubmitting}
							className='flex-1'>
							Cancel
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={isSubmitting || !transactionId.trim()}
							className='flex-1'>
							{isSubmitting ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Submitting...
								</>
							) : (
								"Submit Payment"
							)}
						</Button>
					</div>

					{/* Note */}
					<p className='text-xs text-gray-500 text-center'>
						Note: Your subscription will be activated within 24
						hours after payment verification by our team.
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
