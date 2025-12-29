import Navbar from "@/components/Navbar";
import Timeline from "@/components/Timeline";
import IdeaShareSection from "@/components/IdeaShareSection";

export default function TimelinePage() {
	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<IdeaShareSection />
			<Timeline />
		</div>
	);
}
