"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

interface ValidationStateChartProps {
	data: { state: string; count: number }[];
}

const STATE_COLORS: Record<string, string> = {
	"Needs Action": "#f59e0b", // amber-500
	"Ready to Build": "#10b981", // emerald-500
	Validated: "#0ea5e9", // sky-500
	Neutral: "#6b7280", // gray-500
};

export default function ValidationStateChart({ data }: ValidationStateChartProps) {
	const totalIdeas = data.reduce((sum, item) => sum + item.count, 0);

	if (totalIdeas === 0) {
		return (
			<div className="bg-card border-border/50 shadow-card rounded-xl border p-6">
				<h3 className="text-foreground mb-5 text-base font-semibold">
					Ideas by Validation State
				</h3>
				<div className="flex items-center justify-center h-64 text-muted-foreground">
					No ideas yet
				</div>
			</div>
		);
	}

	return (
		<div className="bg-card border-border/50 shadow-card rounded-xl border p-6">
			<h3 className="text-foreground mb-5 text-base font-semibold">
				Ideas by Validation State
			</h3>
			<div className="h-64">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={data} layout="vertical" margin={{ left: 20 }}>
						<XAxis type="number" hide />
						<YAxis
							type="category"
							dataKey="state"
							tick={{ fontSize: 12 }}
							tickLine={false}
							axisLine={false}
							width={100}
						/>
						<Tooltip
							content={({ active, payload }) => {
								if (active && payload && payload.length) {
									const data = payload[0].payload;
									return (
										<div className="bg-popover border-border rounded-lg border px-3 py-2 shadow-lg">
											<p className="text-foreground text-sm font-medium">
												{data.state}
											</p>
											<p className="text-muted-foreground text-xs">
												{data.count} ideas
											</p>
										</div>
									);
								}
								return null;
							}}
						/>
						<Bar dataKey="count" radius={[0, 4, 4, 0]}>
							{data.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={STATE_COLORS[entry.state] || "#6b7280"}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
