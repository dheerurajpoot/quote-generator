"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from "react";
import axios from "axios";

export interface User {
	_id: string;
	name: string;
	email: string;
	role?: string;
	token?: string;
	image?: string | null;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signIn: (email: string, password: string) => Promise<boolean>;
	signUp: (name: string, email: string, password: string) => Promise<boolean>;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check localStorage for existing user session
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		}
		setLoading(false);
	}, []);

	const signIn = async (email: string, password: string) => {
		setLoading(true);
		try {
			const res = await axios.post("/api/auth/login", {
				email,
				password,
			});
			if (res.data.success) {
				const userData = res.data.user;
				setUser(userData);
				localStorage.setItem("user", JSON.stringify(userData));
				return true;
			}
			return false;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				console.error(
					"SignIn Error:",
					error.response?.data?.message || error.message
				);
			} else if (error instanceof Error) {
				console.error("SignIn Error:", error.message);
			} else {
				console.error("SignIn Error: Unknown error occurred");
			}
			return false;
		} finally {
			setLoading(false);
		}
	};

	const signUp = async (name: string, email: string, password: string) => {
		setLoading(true);
		try {
			const res = await axios.post("/api/auth/signup", {
				name,
				email,
				password,
			});

			if (res.data.success) {
				return true;
			}
			return false;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				console.error(
					"SignUp Error:",
					error.response?.data?.message || error.message
				);
			} else if (error instanceof Error) {
				console.error("SignUp Error:", error.message);
			} else {
				console.error("SignUp Error: Unknown error occurred");
			}
			return false;
		} finally {
			setLoading(false);
		}
	};

	const signOut = async () => {
		try {
			setLoading(true);
			await axios.get("/api/auth/logout");
			localStorage.removeItem("user");
			setUser(null);
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				console.error(
					"Sign out failed:",
					error.response?.data?.message || error.message
				);
			} else if (error instanceof Error) {
				console.error("Sign out failed:", error.message);
			} else {
				console.error("Sign out failed: Unknown error");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				signIn,
				signUp,
				signOut,
			}}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
