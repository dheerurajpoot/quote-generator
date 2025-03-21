import { connectDb } from "@/lib/dbconfig";
import { NextResponse } from "next/server";

export const revalidate = 0;
export async function GET() {
	try {
		await connectDb();
		const response = new NextResponse();
		response.cookies.set("token", "", {
			httpOnly: true,
			expires: new Date(0),
			path: "/",
		});

		return response;
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.log(error);
			return NextResponse.json(
				{ message: error.message },
				{ status: 500 }
			);
		}
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
