import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
export const metadata: Metadata = { title:"MECHAVIS — Digital Engineering Lab", description:"Explore the geometry, materials and behavior of mechanical components in an interactive digital environment." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><AppShell>{children}</AppShell></body></html>; }
