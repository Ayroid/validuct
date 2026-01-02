import Navbar from "@/components/Navbar";
import Timeline from "@/components/Timeline";
import IdeaShare from "@/components/IdeaShare";

export default function TimelinePage() {
	return (
		<div className="bg-background mx-auto min-h-screen max-w-5xl">
			<Navbar />
			<IdeaShare />
			<Timeline />
		</div>
	);
}
