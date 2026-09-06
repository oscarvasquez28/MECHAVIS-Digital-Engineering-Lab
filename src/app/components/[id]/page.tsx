import { notFound } from "next/navigation";
import { components } from "@/data/components";
import { EngineeringWorkspace } from "@/features/viewer/engineering-workspace";
export function generateStaticParams() { return components.map((c) => ({id:c.id})); }
export default async function ComponentPage({params}:{params:Promise<{id:string}>}) { const {id} = await params; const component = components.find((c) => c.id === id); if(!component) notFound(); return <EngineeringWorkspace component={component}/>; }
