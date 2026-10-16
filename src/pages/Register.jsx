import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";

export default function Register() {
	const { register } = useAuth();
	const navigate = useNavigate();
	const [form, setForm] = useState({ name: "", email: "", password: "" });

	const submit = async (e) => {
		e.preventDefault();
		setError("");
		try {
			await register(form.name, form.email, form.password);
			navigate("/");
		} catch (err) {
			toastApiError(err, "Login failed");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-keep-bg">
			<form
				onSubmit={submit}
				className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
			>
				<h1 className="text-2xl font-semibold mb-6 text-center">
					Create account
				</h1>
				{error && <p className="text-red-500 text-sm mb-3">{error}</p>}
				<input
					placeholder="Name"
					autoComplete="name"
					className="w-full border rounded px-3 py-2 mb-3"
					value={form.name}
					onChange={(e) => setForm({ ...form, name: e.target.value })}
					required
				/>
				<input
					type="email"
					placeholder="Email"
					autoComplete="email"
					className="w-full border rounded px-3 py-2 mb-3"
					value={form.email}
					onChange={(e) => setForm({ ...form, email: e.target.value })}
					required
				/>
				<PasswordInput
					value={form.password}
					onChange={(e) => setForm({ ...form, password: e.target.value })}
					placeholder="Password (min 6)"
					autoComplete="new-password"
					className="mb-4"
				/>
				<button className="w-full bg-yellow-400 hover:bg-yellow-500 py-2 rounded font-medium">
					Register
				</button>
				<p className="text-sm text-center mt-4">
					Have an account?{" "}
					<Link to="/login" className="text-blue-600 hover:underline">
						Sign in
					</Link>
				</p>
			</form>
		</div>
	);
}
