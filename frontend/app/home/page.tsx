import Navbar from "@/components/Navbar";
import Timeline from "@/components/Timeline";
import IdeaShare from "@/components/IdeaShare";

export default function TimelinePage() {
	return (
		<div className="bg-background min-h-screen">
			<Navbar />
			<div className="mx-auto max-w-5xl">
				<IdeaShare />
				<Timeline />
			</div>
		</div>
	);
}
