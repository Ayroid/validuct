import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "i.pravatar.cc",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "pbs.twimg.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
				pathname: "/**",
			},
		],
	},
	turbopack: {
		root: path.join(__dirname, ".."),
	},
};

export default nextConfig;
