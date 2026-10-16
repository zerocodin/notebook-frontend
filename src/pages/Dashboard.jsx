import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useSocket } from "../context/SocketContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CreateNote from "../components/CreateNote";
import NoteCard from "../components/NoteCard";
import NoteEditor from "../components/NoteEditor";
import { toastApiError, showSuccess, showInfo } from "../utils/toast";

export default function Dashboard() {
	const [owned, setOwned] = useState([]);
	const [shared, setShared] = useState([]);
	const [trash, setTrash] = useState([]);
	const [view, setView] = useState("Notes");
	const [activeTag, setActiveTag] = useState(null);
	const [query, setQuery] = useState("");
	const [editing, setEditing] = useState(null);

	const { socketRef, connected } = useSocket();

	const load = async () => {
		try {
			const res = await api.get("/notes");
			setOwned(res.data.owned);
			setShared(res.data.shared);
		} catch (err) {
			console.error("Failed to load notes:", err.response?.data || err.message);
		}
	};

	const loadTrash = async () => {
		try {
			const res = await api.get("/notes/trash");
			setTrash(res.data);
		} catch (err) {
			console.error("Failed to load trash:", err.response?.data || err.message);
		}
	};

	useEffect(() => {
		load();
	}, []);

	useEffect(() => {
		if (view === "Trash") loadTrash();
	}, [view]);

	// Reset tag filter when leaving Notes
	useEffect(() => {
		if (view !== "Notes") setActiveTag(null);
	}, [view]);

	// Socket listeners
	useEffect(() => {
		if (!connected) return;
		const socket = socketRef.current;
		if (!socket) return;

		console.log("[socket] dashboard listeners attached");

		const onCreated = (note) =>
			setOwned((prev) =>
				prev.some((n) => n._id === note._id)
					? prev
					: [{ ...note, permission: "owner" }, ...prev],
			);

		const onUpdated = (note) => {
			setOwned((prev) =>
				prev.map((n) =>
					n._id === note._id
						? { ...note, permission: n.permission || "owner" }
						: n,
				),
			);
			setShared((prev) =>
				prev.map((n) =>
					n._id === note._id ? { ...note, permission: n.permission } : n,
				),
			);
			setEditing((cur) =>
				cur && cur._id === note._id ? { ...cur, ...note } : cur,
			);
		};

		const onDeleted = ({ _id }) => {
			setOwned((prev) => prev.filter((n) => n._id !== _id));
			setShared((prev) => prev.filter((n) => n._id !== _id));
			setEditing((cur) => (cur && cur._id === _id ? null : cur));
		};

		const onShareGranted = (note) => {
			setShared((prev) =>
				prev.some((n) => n._id === note._id)
					? prev.map((n) => (n._id === note._id ? note : n))
					: [note, ...prev],
			);
		};

		const onShareRevoked = ({ noteId }) => {
			setShared((prev) => prev.filter((n) => n._id !== noteId));
			setEditing((cur) => (cur && cur._id === noteId ? null : cur));
		};

		socket.on("note:created", onCreated);
		socket.on("note:updated", onUpdated);
		socket.on("note:deleted", onDeleted);
		socket.on("share:granted", onShareGranted);
		socket.on("share:revoked", onShareRevoked);

		return () => {
			socket.off("note:created", onCreated);
			socket.off("note:updated", onUpdated);
			socket.off("note:deleted", onDeleted);
			socket.off("share:granted", onShareGranted);
			socket.off("share:revoked", onShareRevoked);
		};
	}, [connected, socketRef]);

	const createNote = async (data) => {
		try {
			const res = await api.post("/notes", data);
			setOwned((prev) =>
				prev.some((n) => n._id === res.data._id)
					? prev
					: [{ ...res.data, permission: "owner" }, ...prev],
			);
			showSuccess("Note created");
		} catch (err) {
			toastApiError(err, "Could not create note");
		}
	};
	const deleteNote = async (id) => {
		if (!confirm("Delete this note?")) return;
		try {
			await api.delete(`/notes/${id}`);
			setOwned((prev) => prev.filter((n) => n._id !== id));
			setShared((prev) => prev.filter((n) => n._id !== id));
			showSuccess("Note moved to trash");
		} catch (err) {
			toastApiError(err, "Could not delete note");
		}
	};

	// restoreNote
	const restoreNote = async (id) => {
		try {
			await api.post(`/notes/${id}/restore`);
			setTrash((prev) => prev.filter((n) => n._id !== id));
			load();
			showSuccess("Note restored");
		} catch (err) {
			toastApiError(err, "Could not restore note");
		}
	};

	// deleteForever
	const deleteForever = async (id) => {
		if (!confirm("Delete permanently? This cannot be undone.")) return;
		try {
			await api.delete(`/notes/${id}/permanent`);
			setTrash((prev) => prev.filter((n) => n._id !== id));
			showSuccess("Note permanently deleted");
		} catch (err) {
			toastApiError(err, "Could not delete note");
		}
	};

	const onSaved = (updated) => {
		setOwned((prev) =>
			prev.map((n) =>
				n._id === updated._id
					? { ...updated, permission: n.permission || "owner" }
					: n,
			),
		);
		setShared((prev) =>
			prev.map((n) =>
				n._id === updated._id ? { ...updated, permission: n.permission } : n,
			),
		);
	};

	const togglePin = async (note) => {
		const next = !note.isPinned;
		const sortPinned = (list) =>
			[...list]
				.map((n) => (n._id === note._id ? { ...n, isPinned: next } : n))
				.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
		if (view === "Notes") setOwned(sortPinned);
		else setShared(sortPinned);

		try {
			await api.put(`/notes/${note._id}`, { isPinned: next });
			showInfo(next ? "Pinned" : "Unpinned");
		} catch (err) {
			toastApiError(err, "Could not update pin");
		}
	};

	const notes = useMemo(() => {
		const list = view === "Notes" ? owned : shared;
		let filtered = list;
		if (activeTag) {
			filtered = filtered.filter((n) => n.tags?.includes(activeTag));
		}
		if (query) {
			const q = query.toLowerCase();
			filtered = filtered.filter(
				(n) =>
					n.title?.toLowerCase().includes(q) ||
					n.content?.toLowerCase().includes(q),
			);
		}
		return filtered;
	}, [view, owned, shared, query, activeTag]);

	// Collect all unique tags from owned + shared
	const allTags = useMemo(() => {
		const set = new Set();
		[...owned, ...shared].forEach((n) =>
			(n.tags || []).forEach((t) => set.add(t)),
		);
		return Array.from(set).sort();
	}, [owned, shared]);

	return (
		<div className="min-h-screen">
			<Navbar onSearch={setQuery} connected={connected} />
			<div className="flex">
				<Sidebar
					active={view}
					onChange={setView}
					tags={allTags}
					activeTag={activeTag}
					onTagChange={setActiveTag}
				/>
				<main className="flex-1 px-4 sm:px-6 py-6">
					{view === "Trash" ? (
						<div className="masonry">
							{trash.map((n) => (
								<div
									key={n._id}
									className="rounded-xl border border-keep-border bg-white p-4"
								>
									<h3 className="font-medium mb-1">{n.title || "Untitled"}</h3>
									<p className="text-sm text-gray-700 whitespace-pre-wrap">
										{n.content}
									</p>
									<div className="mt-3 flex gap-2 text-xs">
										<button
											onClick={() => restoreNote(n._id)}
											className="text-blue-600 hover:underline"
										>
											Restore
										</button>
										<button
											onClick={() => deleteForever(n._id)}
											className="text-red-600 hover:underline"
										>
											Delete forever
										</button>
									</div>
								</div>
							))}
							{trash.length === 0 && (
								<p className="text-center text-gray-500 mt-16">
									Trash is empty
								</p>
							)}
						</div>
					) : (
						<>
							{view === "Notes" && <CreateNote onCreate={createNote} />}

							{activeTag && (
								<div className="max-w-xl mx-auto mb-4 flex items-center gap-2 text-sm">
									<span className="text-gray-600">
										Filtering by <strong>#{activeTag}</strong>
									</span>
									<button
										onClick={() => setActiveTag(null)}
										className="text-blue-600 hover:underline"
									>
										Clear
									</button>
								</div>
							)}

							<div className="masonry">
								{notes.map((note) => (
									<NoteCard
										key={note._id}
										note={note}
										onOpen={setEditing}
										onDelete={deleteNote}
										onTogglePin={togglePin}
									/>
								))}
							</div>
							{notes.length === 0 && (
								<p className="text-center text-gray-500 mt-16">
									{view === "Notes"
										? "No notes yet"
										: "Nothing shared with you yet"}
								</p>
							)}
						</>
					)}
				</main>
			</div>
			{editing && editing._id && (
				<NoteEditor
					note={editing}
					onClose={() => setEditing(null)}
					onSaved={onSaved}
				/>
			)}
		</div>
	);
}
