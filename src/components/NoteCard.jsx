import { useAuth } from "../context/AuthContext";

export default function NoteCard({ note, onOpen, onDelete, onTogglePin }) {
	const { user } = useAuth();
	const isOwner = !note.permission || note.permission === "owner";
	const canEdit = isOwner || note.permission === "edit";

	const ownerName = isOwner ? user?.name : note.owner?.name;
	const ownerAvatar = isOwner ? user?.avatar : note.owner?.avatar;

	return (
		<div
			onClick={() => onOpen(note)}
			className="group relative rounded-xl border border-keep-border p-4 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
			style={{ backgroundColor: note.color || "#fff" }}
		>
			{note.isPinned && (
				<span className="absolute top-3 left-3 text-xs" title="Pinned">
					📌
				</span>
			)}

			{note.title && (
				<h3 className="font-medium mb-1 pr-8 pl-4">{note.title}</h3>
			)}
			<p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed pl-4">
				{note.content}
			</p>

			{note.tags?.length > 0 && (
				<div className="flex flex-wrap gap-1 mt-2 pl-4">
					{note.tags.map((t) => (
						<span
							key={t}
							className="text-[10px] bg-black/10 rounded-full px-2 py-0.5"
						>
							#{t}
						</span>
					))}
				</div>
			)}

			<div className="flex items-center gap-2 mt-3 pl-4">
				<div className="w-5 h-5 rounded-full overflow-hidden bg-yellow-100 text-yellow-800 text-[10px] flex items-center justify-center">
					{ownerAvatar ? (
						<img
							src={ownerAvatar}
							alt=""
							className="w-full h-full object-cover"
						/>
					) : (
						ownerName?.[0]?.toUpperCase() || "?"
					)}
				</div>
				{!isOwner && (
					<span className="text-[11px] text-gray-600">{ownerName}</span>
				)}
			</div>

			{!isOwner && (
				<span className="absolute top-3 right-3 text-[11px] bg-black/10 px-2 py-0.5 rounded-full">
					{note.permission === "edit" ? "Can edit" : "View only"}
				</span>
			)}

			<div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
				{canEdit && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							onTogglePin(note);
						}}
						className="text-xs text-gray-500 hover:text-yellow-600"
						title={note.isPinned ? "Unpin" : "Pin"}
					>
						{note.isPinned ? "Unpin" : "Pin"}
					</button>
				)}
				{isOwner && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							onDelete(note._id);
						}}
						className="text-xs text-gray-500 hover:text-red-600"
					>
						Delete
					</button>
				)}
			</div>
		</div>
	);
}