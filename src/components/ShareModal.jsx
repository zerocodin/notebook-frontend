import { useEffect, useState } from "react";
import api from "../api/axios";
import { toastApiError, showSuccess } from "../utils/toast";

export default function ShareModal({ note, onClose }) {
	const [email, setEmail] = useState("");
	const [permission, setPermission] = useState("view");
	const [shares, setShares] = useState([]);
	const [error, setError] = useState("");
	const [inviteUrl, setInviteUrl] = useState("");
	const [inviteLoading, setInviteLoading] = useState(false);

	const loadShares = async () => {
		try {
			const res = await api.get(`/notes/${note._id}/shares`);
			setShares(res.data);
		} catch (err) {
			setError(err.response?.data?.message || "Could not load shares");
		}
	};

	useEffect(() => {
		loadShares();
	}, []);

	const share = async () => {
		if (!email.trim()) return;
		const optimistic = {
			_id: `temp-${Date.now()}`,
			permission,
			sharedWith: { email: email.trim().toLowerCase() },
			pending: true,
		};
		setShares((prev) => [...prev, optimistic]);
		const emailBackup = email;
		setEmail("");

		try {
			const res = await api.post(`/notes/${note._id}/share`, {
				email: emailBackup,
				permission,
			});
			setShares((prev) =>
				prev.map((s) => (s._id === optimistic._id ? res.data : s)),
			);
			showSuccess(`Shared with ${emailBackup}`);
		} catch (err) {
			setShares((prev) => prev.filter((s) => s._id !== optimistic._id));
			toastApiError(err, "Could not share");
		}
	};

	const revoke = async (id) => {
		try {
			await api.delete(`/shares/${id}`);
			loadShares();
			showSuccess("Access removed");
		} catch (err) {
			toastApiError(err, "Could not remove");
		}
	};

	const createInvite = async () => {
		setInviteLoading(true);
		try {
			const res = await api.post(`/notes/${note._id}/invite`, { permission });
			setInviteUrl(res.data.url);
			try {
				await navigator.clipboard.writeText(res.data.url);
				showSuccess("Invite link copied to clipboard");
			} catch {
				showSuccess("Invite link created");
			}
		} catch (err) {
			toastApiError(err, "Could not create invite link");
		} finally {
			setInviteLoading(false);
		}
	};

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-30 p-4"
			onClick={onClose}
		>
			<div
				className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
				onClick={(e) => e.stopPropagation()}
			>
				<h2 className="text-lg font-medium mb-4">Share note</h2>

				{error && <p className="text-red-500 text-sm mb-2">{error}</p>}

				<input
					placeholder="Friend's email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && share()}
					className="w-full border rounded px-3 py-2 mb-3"
				/>
				<select
					value={permission}
					onChange={(e) => setPermission(e.target.value)}
					className="w-full border rounded px-3 py-2 mb-4"
				>
					<option value="view">Can view</option>
					<option value="edit">Can edit</option>
				</select>

				<button
					onClick={share}
					className="w-full bg-yellow-400 hover:bg-yellow-500 py-2 rounded font-medium mb-4"
				>
					Share with user
				</button>

				<div className="border-t border-keep-border pt-4 mb-4">
					<p className="text-xs text-gray-500 mb-2">
						Or send an invite link (works for people who haven't signed up)
					</p>
					<button
						onClick={createInvite}
						disabled={inviteLoading}
						className="w-full border border-keep-border hover:bg-gray-50 py-2 rounded font-medium disabled:opacity-60"
					>
						{inviteLoading ? "Creating…" : "Create & copy invite link"}
					</button>

					{inviteUrl && (
						<div className="mt-2 flex items-center gap-2">
							<input
								value={inviteUrl}
								readOnly
								onFocus={(e) => e.target.select()}
								className="flex-1 text-xs border rounded px-2 py-1 bg-gray-50"
							/>
							<button
								onClick={() => navigator.clipboard.writeText(inviteUrl)}
								className="text-xs text-blue-600 hover:underline"
							>
								Copy
							</button>
						</div>
					)}
				</div>

				<h3 className="text-sm font-medium mb-2">People with access</h3>
				<ul className="space-y-2">
					{shares.map((s) => (
						<li
							key={s._id}
							className="flex items-center justify-between text-sm"
						>
							<span>
								{s.sharedWith?.email} · {s.permission}{" "}
								{s.pending && <span className="text-gray-400">(sending…)</span>}
							</span>
							<button
								onClick={() => revoke(s._id)}
								disabled={s.pending}
								className="text-red-500 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
							>
								Remove
							</button>
						</li>
					))}
					{shares.length === 0 && (
						<li className="text-sm text-gray-500">Not shared yet</li>
					)}
				</ul>

				<button
					onClick={onClose}
					className="mt-6 w-full text-sm py-2 rounded hover:bg-gray-100"
				>
					Close
				</button>
			</div>
		</div>
	);
}
