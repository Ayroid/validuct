import CTA from "@/components/CTA";
import Navbar from "@/components/Navbar";
import Timeline from "@/components/Timeline";

export default function Home() {
	return (
		<div className="min-h-screen bg-[#eeeeee]">
			<Navbar />
			<CTA />
			<Timeline />
		</div>
	);
}
