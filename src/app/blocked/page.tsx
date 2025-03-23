import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BlockedPage() {
	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50'>
			<div className='max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg'>
				<div className='text-center'>
					<h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
						Account Blocked
					</h2>
					<p className='mt-2 text-sm text-gray-600'>
						Your account has been blocked by an administrator.
						Please contact support for more information.
					</p>
				</div>
				<div className='mt-8 space-y-6'>
					<div className='flex items-center justify-center'>
						<Button asChild>
							<Link href='/contact'>Contact Support</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
