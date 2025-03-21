import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
	return (
		<div className='container flex items-center justify-center min-h-[calc(100vh-8rem)] py-12'>
			<Card className='max-w-md w-full'>
				<CardHeader className='text-center'>
					<div className='flex justify-center mb-4'>
						<div className='p-3 rounded-full bg-destructive/10'>
							<ShieldAlert className='h-10 w-10 text-destructive' />
						</div>
					</div>
					<CardTitle className='text-2xl'>Access Denied</CardTitle>
					<CardDescription>
						You don't have permission to access this page
					</CardDescription>
				</CardHeader>
				<CardContent className='text-center'>
					<p>
						This area is restricted to administrators only. If you
						believe you should have access, please contact support.
					</p>
				</CardContent>
				<CardFooter className='flex justify-center'>
					<Button asChild>
						<Link href='/'>Return to Home</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
