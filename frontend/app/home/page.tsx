import Navbar from "@/components/Navbar";
import Timeline from "@/components/Timeline";
import IdeaShare from "@/components/IdeaShare";

export default function TimelinePage() {
	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<IdeaShare />
			<Timeline />
		</div>
	);
}
