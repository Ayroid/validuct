export { auth as proxy } from "@/auth";

export const config = {
	matcher: ["/home", "/idea/new", "/idea/:path*/edit", "/:username/edit"],
};
