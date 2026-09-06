import { AnalysisWorkspace } from "@/features/analysis/analysis-workspace";

export default async function AnalysisPage({ searchParams }: { searchParams?: Promise<{ component?: string | string[] }> }) {
  const params = await searchParams;
  const component = Array.isArray(params?.component) ? params.component[0] : params?.component;
  return <AnalysisWorkspace key={component || "input-shaft"} defaultComponentId={component}/>;
}
