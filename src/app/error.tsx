"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="empty-state"><span className="eyebrow">WORKSPACE INTERRUPTED</span><h1>Let’s recalibrate.</h1><p>The workspace could not be loaded. Your local preferences are safe.</p><button className="button" onClick={reset}>Reload workspace</button></div>; }
