import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { User } from "@/models/user.model";
import { connectDb } from "@/lib/dbconfig";

export async function POST(request: NextRequest) {
	try {
		await connectDb();
		const reqBody = await request.json();
		const { name, email, password } = reqBody;
		console.log("details: ", name, email, password);

		const user = await User.findOne({ email });

		if (user) {
			return NextResponse.json(
				{ message: "Account already exist with this Email!" },
				{ status: 301 }
			);
		}
		const salt = await bcryptjs.genSalt(10);
		const hashedPassword = await bcryptjs.hash(password, salt);
		const newUser = new User({
			name,
			email,
			password: hashedPassword,
		});
		const savedUser = await newUser.save();
		// // send verification mail
		// await sendMail({
		// 	email,
		// 	emailType: "VERIFY",
		// 	userId: savedUser._id,
		// });

		return NextResponse.json({
			message: "Account Created Successfully",
			success: true,
		});
	} catch (error: any) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
