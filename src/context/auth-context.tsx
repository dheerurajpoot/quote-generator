"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";

export interface User {
	_id: string;
	name: string;
	email: string;
	role: "user" | "admin";
	token?: string;
	image?: string | null;
	isBlocked: boolean;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signIn: (email: string, password: string) => Promise<boolean>;
	signUp: (name: string, email: string, password: string) => Promise<boolean>;
	signOut: () => Promise<void>;
	isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const storedUser = localStorage.getItem("user");
				if (storedUser) {
					const parsedUser = JSON.parse(storedUser);
					setUser(parsedUser);

					// Set user role cookie for middleware
					if (parsedUser.role === "admin") {
						document.cookie = `user_role=admin; path=/; max-age=${
							60 * 60 * 24 * 7
						}`; // 7 days
					}
				}
			} catch (error) {
				console.error("Auth check failed:", error);
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
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
				const isAdmin = userData.role === "admin";
				setUser(userData);
				localStorage.setItem("user", JSON.stringify(userData));

				// Set user role cookie for middleware
				if (isAdmin) {
					document.cookie = `user_role=admin; path=/; max-age=${
						60 * 60 * 24 * 7
					}`; // 7 days
				}

				toast.success("Login successful!");
				return true;
			}
			return false;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				const errorMessage =
					error.response?.data?.message || "Login failed";
				toast.error(errorMessage);
				console.error("SignIn Error:", errorMessage);
			} else if (error instanceof Error) {
				toast.error(error.message);
				console.error("SignIn Error:", error.message);
			} else {
				toast.error("An unknown error occurred");
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
				toast.success(
					res.data.message || "Account created successfully!"
				);
				return true;
			}
			return false;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				const errorMessage =
					error.response?.data?.message || "Signup failed";
				toast.error(errorMessage);
				console.error("SignUp Error:", errorMessage);
			} else if (error instanceof Error) {
				toast.error(error.message);
				console.error("SignUp Error:", error.message);
			} else {
				toast.error("An unknown error occurred");
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
			// Clear cookies
			document.cookie = "session=; path=/; max-age=0";
			document.cookie = "user_role=; path=/; max-age=0";
			setUser(null);
			toast.success("Logged out successfully!");
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				const errorMessage =
					error.response?.data?.message || "Logout failed";
				toast.error(errorMessage);
				console.error("Sign out failed:", errorMessage);
			} else if (error instanceof Error) {
				toast.error(error.message);
				console.error("Sign out failed:", error.message);
			} else {
				toast.error("An unknown error occurred");
				console.error("Sign out failed: Unknown error");
			}
		} finally {
			setLoading(false);
		}
	};

	const isAdmin = () => {
		return user?.role === "admin";
	};
	if (!user) return;

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				signIn,
				signUp,
				signOut,
				isAdmin,
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
