import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { showSuccess, toastApiError } from "../utils/toast";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		api
			.get("/auth/me")
			.then((res) => setUser(res.data.user))
			.catch(() => setUser(null))
			.finally(() => setLoading(false));
	}, []);

	const login = async (email, password) => {
		const res = await api.post("/auth/login", { email, password });
		localStorage.setItem("token", res.data.token);
		setUser(res.data.user);
		showSuccess(`Welcome back, ${res.data.user.name}`);
	};

	const register = async (name, email, password) => {
		const res = await api.post("/auth/register", { name, email, password });
		localStorage.setItem("token", res.data.token);
		setUser(res.data.user);
		showSuccess(`Account created. Welcome, ${res.data.user.name}`);
	};

	const logout = async () => {
		try {
			await api.post("/auth/logout");
		} catch (err) {
			toastApiError(err, "Logout failed");
		}
		localStorage.removeItem("token");
		setUser(null);
		showSuccess("Signed out");
	};

	const updateUser = (next) => setUser((prev) => ({ ...prev, ...next }));

	return (
		<AuthContext.Provider
			value={{ user, loading, login, register, logout, updateUser }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);