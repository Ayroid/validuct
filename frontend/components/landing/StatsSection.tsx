export default function StatsSection() {
	return (
		<section className="mt-auto shrink-0 bg-muted px-6 py-12 text-center">
			<div className="mx-auto flex max-w-[1080px] flex-wrap justify-center gap-12">
				{[
					{ number: "47+", label: "Ideas Validated" },
					{ number: "20+", label: "Active Builders" },
					{ number: "4", label: "Demand Signals" },
					{ number: "< 2 min", label: "To Post an Idea" },
				].map((item) => (
					<div
						key={item.label}
						className="flex flex-col items-center gap-1"
					>
						<div className="font-display text-[32px]">
							{item.number}
						</div>
						<div className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-muted-extra)]">
							{item.label}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
