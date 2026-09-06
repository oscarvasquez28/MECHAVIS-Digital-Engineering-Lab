import { AIWorkspace } from "@/features/assistant/ai-workspace";

export default async function AIPage({ searchParams }: { searchParams?: Promise<{ component?: string | string[] }> }) {
  const params = await searchParams;
  const component = Array.isArray(params?.component) ? params.component[0] : params?.component;
  return <AIWorkspace key={component || "input-shaft"} defaultComponentId={component}/>;
}
