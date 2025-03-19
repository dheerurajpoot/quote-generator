"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from "react";

export interface User {
	id: string;
	name: string | null;
	email: string;
	image?: string | null;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signIn: (email: string, password: string) => Promise<boolean>;
	signInWithGoogle: () => Promise<boolean>;
	signUp: (name: string, email: string, password: string) => Promise<boolean>;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check if user is logged in
		const checkAuth = async () => {
			try {
				// In a real app, this would be an API call to check session
				const storedUser = localStorage.getItem("user");
				if (storedUser) {
					setUser(JSON.parse(storedUser));
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
		try {
			setLoading(true);
			// In a real app, this would be an API call to authenticate
			// Simulating authentication for demo
			if (email && password) {
				const mockUser: User = {
					id: "user-" + Math.random().toString(36).substr(2, 9),
					name: email.split("@")[0],
					email,
				};
				setUser(mockUser);
				localStorage.setItem("user", JSON.stringify(mockUser));
				return true;
			}
			return false;
		} catch (error) {
			console.error("Sign in failed:", error);
			return false;
		} finally {
			setLoading(false);
		}
	};

	const signInWithGoogle = async () => {
		try {
			setLoading(true);
			// In a real app, this would redirect to Google OAuth
			// Simulating Google auth for demo
			const mockUser: User = {
				id: "google-" + Math.random().toString(36).substr(2, 9),
				name: "Google User",
				email: "user@gmail.com",
				image: "/placeholder.svg?height=40&width=40",
			};
			setUser(mockUser);
			localStorage.setItem("user", JSON.stringify(mockUser));
			return true;
		} catch (error) {
			console.error("Google sign in failed:", error);
			return false;
		} finally {
			setLoading(false);
		}
	};

	const signUp = async (name: string, email: string, password: string) => {
		try {
			setLoading(true);
			// In a real app, this would be an API call to register
			// Simulating registration for demo
			if (name && email && password) {
				const mockUser: User = {
					id: "user-" + Math.random().toString(36).substr(2, 9),
					name,
					email,
				};
				setUser(mockUser);
				localStorage.setItem("user", JSON.stringify(mockUser));
				return true;
			}
			return false;
		} catch (error) {
			console.error("Sign up failed:", error);
			return false;
		} finally {
			setLoading(false);
		}
	};

	const signOut = async () => {
		try {
			setLoading(true);
			// In a real app, this would be an API call to sign out
			setUser(null);
			localStorage.removeItem("user");
		} catch (error) {
			console.error("Sign out failed:", error);
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
				signInWithGoogle,
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
