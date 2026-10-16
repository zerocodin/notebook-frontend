const items = [
	{ key: "Notes", icon: "📝" },
	{ key: "Shared with me", icon: "👥" },
	{ key: "Trash", icon: "🗑️" },
];

export default function Sidebar({
	active,
	onChange,
	tags = [],
	activeTag,
	onTagChange,
}) {
	return (
		<aside className="hidden md:flex flex-col w-60 py-6 px-3 gap-1">
			{items.map(({ key, icon }) => (
				<button
					key={key}
					onClick={() => onChange(key)}
					className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm transition
            ${
							active === key
								? "bg-yellow-100 text-yellow-900 font-medium"
								: "text-gray-700 hover:bg-gray-100"
						}`}
				>
					<span>{icon}</span>
					{key}
				</button>
			))}

			{tags.length > 0 && (
				<div className="mt-6 px-4">
					<p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
						Tags
					</p>
					<div className="flex flex-wrap gap-1.5">
						{tags.map((t) => (
							<button
								key={t}
								onClick={() => {
									onChange("Notes");
									onTagChange(activeTag === t ? null : t);
								}}
								className={`text-xs rounded-full px-2.5 py-1 transition ${
									activeTag === t
										? "bg-yellow-200 text-yellow-900"
										: "bg-gray-100 hover:bg-gray-200 text-gray-700"
								}`}
							>
								#{t}
							</button>
						))}
					</div>
				</div>
			)}
		</aside>
	);
}