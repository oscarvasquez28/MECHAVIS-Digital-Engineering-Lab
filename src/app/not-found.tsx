import Link from "next/link";
export default function NotFound() { return <div className="empty-state"><span className="eyebrow">404 / COMPONENT NOT FOUND</span><h1>Outside the assembly.</h1><p>This part or workspace is not in the current library.</p><Link className="button" href="/components">Return to component explorer</Link></div>; }
