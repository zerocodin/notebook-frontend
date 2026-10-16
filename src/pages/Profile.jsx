import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toastApiError, showSuccess } from "../utils/toast";

const API_ORIGIN = (
	import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/api\/?$/, "");

export default function Profile() {
	const { user, updateUser } = useAuth();
	const navigate = useNavigate();
	const fileRef = useRef(null);

	const [name, setName] = useState(user?.name || "");
	const [bio, setBio] = useState(user?.bio || "");
	const [saving, setSaving] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		setName(user?.name || "");
		setBio(user?.bio || "");
	}, [user]);

	const saveProfile = async () => {
		setSaving(true);
		try {
			const res = await api.put("/users/me", { name, bio });
			updateUser(res.data.user);
			showSuccess("Profile saved");
		} catch (err) {
			toastApiError(err, "Could not save profile");
		} finally {
			setSaving(false);
		}
	};

	const onPickFile = () => fileRef.current?.click();

	const onFileChange = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 2 * 1024 * 1024) {
			setError("Image must be under 2 MB");
			return;
		}

		const form = new FormData();
		form.append("avatar", file);

		setUploading(true);
		setError("");
		setMessage("");
		try {
			const res = await api.post("/users/me/avatar", form, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			updateUser(res.data.user);
			showSuccess("Avatar updated");
		} catch (err) {
			toastApiError(err, "Upload failed");
		} finally {
			setUploading(false);
			e.target.value = "";
		}
	};

	const removeAvatar = async () => {
		if (!confirm("Remove your avatar?")) return;
		try {
			const res = await api.delete("/users/me/avatar");
			updateUser(res.data.user);
			showSuccess("Avatar removed");
		} catch (err) {
			toastApiError(err, "Could not remove avatar");
		}
	};

	const avatarSrc = user?.avatar ? `${API_ORIGIN}${user.avatar}` : null;

	return (
		<div className="min-h-screen bg-keep-bg">
			<header className="bg-white border-b border-keep-border">
				<div className="max-w-3xl mx-auto flex items-center gap-3 px-4 sm:px-6 py-3">
					<button
						onClick={() => navigate(-1)}
						className="text-sm text-gray-600 hover:text-gray-900"
					>
						← Back
					</button>
					<h1 className="text-lg font-medium">Profile</h1>
				</div>
			</header>

			<main className="max-w-3xl mx-auto p-4 sm:p-6">
				<div className="bg-white rounded-2xl border border-keep-border shadow-sm p-6 sm:p-8">
					{/* Avatar */}
					<div className="flex items-center gap-6">
						<div className="relative">
							<div className="w-24 h-24 rounded-full overflow-hidden bg-yellow-100 text-yellow-800 flex items-center justify-center text-3xl font-medium ring-2 ring-white shadow">
								{avatarSrc ? (
									<img
										src={avatarSrc}
										alt="avatar"
										className="w-full h-full object-cover"
										onError={(e) => {
											e.currentTarget.style.display = "none";
										}}
									/>
								) : (
									user?.name?.[0]?.toUpperCase() || "?"
								)}
							</div>
							{uploading && (
								<div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white text-xs">
									Uploading…
								</div>
							)}
						</div>

						<div className="flex flex-col gap-2">
							<div className="flex gap-2">
								<button
									onClick={onPickFile}
									disabled={uploading}
									className="text-sm px-4 py-1.5 rounded-full bg-yellow-400 hover:bg-yellow-500 font-medium text-gray-900 disabled:opacity-60"
								>
									{user?.avatar ? "Change photo" : "Upload photo"}
								</button>
								{user?.avatar && (
									<button
										onClick={removeAvatar}
										className="text-sm px-4 py-1.5 rounded-full text-red-600 hover:bg-red-50"
									>
										Remove
									</button>
								)}
							</div>
							<p className="text-xs text-gray-500">
								PNG, JPG, WEBP or GIF. Max 2 MB.
							</p>
							<input
								ref={fileRef}
								type="file"
								accept="image/*"
								onChange={onFileChange}
								className="hidden"
							/>
						</div>
					</div>

					<hr className="my-6 border-keep-border" />

					{/* Editable fields */}
					<div className="space-y-4">
						<div>
							<label className="block text-sm text-gray-600 mb-1">Name</label>
							<input
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="w-full border border-keep-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
							/>
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Bio</label>
							<textarea
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								rows={3}
								maxLength={200}
								placeholder="A short description about you"
								className="w-full border border-keep-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 resize-none"
							/>
							<p className="text-xs text-gray-500 mt-1">{bio.length}/200</p>
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Email</label>
							<input
								value={user?.email || ""}
								disabled
								className="w-full border border-keep-border rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
							/>
							<p className="text-xs text-gray-500 mt-1">
								Email can't be changed here.
							</p>
						</div>
					</div>

					{(message || error) && (
						<p
							className={`text-sm mt-4 ${
								error ? "text-red-600" : "text-green-600"
							}`}
						>
							{error || message}
						</p>
					)}

					<div className="mt-6 flex justify-end gap-2">
						<button
							onClick={() => {
								setName(user?.name || "");
								setBio(user?.bio || "");
								setError("");
								setMessage("");
							}}
							className="text-sm px-4 py-1.5 rounded-full text-gray-600 hover:bg-gray-100"
						>
							Reset
						</button>
						<button
							onClick={saveProfile}
							disabled={saving}
							className="text-sm px-5 py-1.5 rounded-full bg-yellow-400 hover:bg-yellow-500 font-medium text-gray-900 disabled:opacity-60"
						>
							{saving ? "Saving…" : "Save changes"}
						</button>
					</div>
				</div>
			</main>
		</div>
	);
}
