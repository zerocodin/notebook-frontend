import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import ShareModal from "./ShareModal";
import { toastApiError, showSuccess } from "../utils/toast";

const COLORS = ["#ffffff", "#fff9c4", "#f8bbd0", "#c5e1a5", "#b3e5fc", "#d1c4e9"];
const AUTOSAVE_MS = 1500;

export default function NoteEditor({ note, onClose, onSaved }) {
	const [title, setTitle] = useState(note.title || "");
	const [content, setContent] = useState(note.content || "");
	const [color, setColor] = useState(note.color || "#ffffff");
	const [tags, setTags] = useState(note.tags || []);
	const [tagInput, setTagInput] = useState("");
	const [shareOpen, setShareOpen] = useState(false);
	const [viewers, setViewers] = useState([]);
	const [status, setStatus] = useState("idle"); // idle | saving | saved
	const firstRender = useRef(true);

	const { socketRef, connected } = useSocket();
	const { user } = useAuth();

	const isOwner = !note.permission || note.permission === "owner";
	const canEdit = isOwner || note.permission === "edit";

	const addTag = () => {
		const t = tagInput.trim().toLowerCase();
		if (!t || tags.includes(t)) return setTagInput("");
		setTags([...tags, t]);
		setTagInput("");
	};

	const removeTag = (t) => setTags(tags.filter((x) => x !== t));

	// Presence
	useEffect(() => {
		if (!connected) return;
		const socket = socketRef.current;
		if (!socket || !user) return;

		socket.emit("note:join", {
			noteId: note._id,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				avatar: user.avatar || "",
			},
		});

		const onPresence = ({ noteId, users }) => {
			if (noteId !== note._id) return;
			setViewers(users);
		};
		socket.on("note:presence", onPresence);

		return () => {
			socket.emit("note:leave", { noteId: note._id });
			socket.off("note:presence", onPresence);
		};
	}, [socketRef, connected, user, note._id]);

	// Autosave (title, content, color, tags)
	useEffect(() => {
		if (!canEdit) return;
		if (firstRender.current) {
			firstRender.current = false;
			return;
		}
		setStatus("saving");
		const t = setTimeout(async () => {
			try {
				const res = await api.put(`/notes/${note._id}`, {
					title,
					content,
					color,
					tags,
				});
				onSaved(res.data);
				setStatus("saved");
				setTimeout(() => setStatus("idle"), 1200);
			} catch (err) {
				toastApiError(err, "Autosave failed");
				setStatus("idle");
			}
		}, AUTOSAVE_MS);

		return () => clearTimeout(t);
	}, [title, content, color, tags, note._id, canEdit]); // eslint-disable-line

	const saveAndClose = async () => {
		if (canEdit) {
			try {
				const res = await api.put(`/notes/${note._id}`, {
					title,
					content,
					color,
					tags,
				});
				onSaved(res.data);
			} catch (err) {
				console.error("Save failed:", err.response?.data || err.message);
			}
		}
		onClose();
	};

	const others = viewers.filter((v) => v.id !== user?.id);

	return (
		<div
			className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20 p-4"
			onClick={saveAndClose}
		>
			<div
				className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-keep-border"
				style={{ backgroundColor: color }}
				onClick={(e) => e.stopPropagation()}
			>
				{others.length > 0 && (
					<div className="flex items-center gap-2 px-5 pt-4">
						<div className="flex -space-x-2">
							{others.map((v) => (
								<div
									key={v.id}
									title={`${v.name} (${v.email})`}
									className="w-7 h-7 rounded-full overflow-hidden bg-yellow-200 text-yellow-900 text-xs font-medium flex items-center justify-center ring-2 ring-white"
								>
									{v.avatar ? (
										<img src={v.avatar} alt="" className="w-full h-full object-cover" />
									) : (
										v.name?.[0]?.toUpperCase() || "?"
									)}
								</div>
							))}
						</div>
						<span className="text-xs text-gray-600">
							{others.length === 1
								? `${others[0].name} is viewing`
								: `${others.length} others viewing`}
						</span>
					</div>
				)}

				<input
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Title"
					disabled={!canEdit}
					className="w-full px-5 pt-4 pb-2 text-lg font-medium bg-transparent focus:outline-none disabled:opacity-80"
				/>
				<textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Take a note..."
					disabled={!canEdit}
					rows={6}
					className="w-full px-5 py-2 bg-transparent resize-none focus:outline-none text-sm leading-relaxed disabled:opacity-80"
				/>

				{tags.length > 0 && (
					<div className="px-5 pb-2 flex flex-wrap gap-1.5">
						{tags.map((t) => (
							<span
								key={t}
								className="text-xs bg-black/10 rounded-full px-2 py-0.5 flex items-center gap-1"
							>
								#{t}
								{canEdit && (
									<button
										onClick={() => removeTag(t)}
										className="text-gray-500 hover:text-red-600"
									>
										×
									</button>
								)}
							</span>
						))}
					</div>
				)}

				{canEdit && (
					<div className="px-5 pb-2">
						<input
							value={tagInput}
							onChange={(e) => setTagInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addTag();
								}
							}}
							placeholder="Add tag and press Enter"
							className="text-xs bg-transparent focus:outline-none border-b border-black/10 w-40"
						/>
					</div>
				)}

				<div className="flex items-center justify-between px-5 py-3 border-t border-black/5">
					<div className="flex items-center gap-3">
						<div className="flex gap-2">
							{COLORS.map((c) => (
								<button
									key={c}
									type="button"
									disabled={!canEdit}
									onClick={() => setColor(c)}
									className={`w-6 h-6 rounded-full border border-black/10 transition hover:scale-110 disabled:cursor-not-allowed ${
										color === c ? "ring-2 ring-gray-500 ring-offset-1" : ""
									}`}
									style={{ backgroundColor: c }}
								/>
							))}
						</div>
						{canEdit && status !== "idle" && (
							<span className="text-xs text-gray-500">
								{status === "saving" ? "Saving…" : "Saved"}
							</span>
						)}
					</div>

					<div className="flex items-center gap-2">
						{isOwner && (
							<button
								onClick={() => setShareOpen(true)}
								className="text-sm px-4 py-1.5 rounded-full hover:bg-black/10 transition"
							>
								Share
							</button>
						)}
						<button
							onClick={saveAndClose}
							className="text-sm px-4 py-1.5 rounded-full bg-yellow-400 hover:bg-yellow-500 font-medium text-gray-900 transition"
						>
							Close
						</button>
					</div>
				</div>
			</div>

			{shareOpen && (
				<ShareModal note={note} onClose={() => setShareOpen(false)} />
			)}
		</div>
	);
}