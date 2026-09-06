import { describe, expect, it } from "vitest";
import { analysisData } from "../../src/data/analysis";
import { components, getComponent, ILLUSTRATIVE_DISCLAIMER } from "../../src/data/components";
import { manufacturingData } from "../../src/data/manufacturing";
import { materials } from "../../src/data/materials";
import { compareComponents, filterComponents, measureDistance, safetyFactor } from "../../src/lib/engineering";
import { MockComponentRepository } from "../../src/services/component-repository";
import { mockAssistant } from "../../src/services/mock-assistant";
import type { Component, ModelKind } from "../../src/types/engineering";

const shaft = getComponent("input-shaft")!;
const alloyShaft = getComponent("alloy-shaft")!;
const partIds: Record<ModelKind, string[]> = {
  shaft: ["shaft", "journal", "shoulder", "spline", "thread", "gear", "bearing", "spacer", "retainer"],
  spindle: ["body", "taper", "journal", "thread"],
  coil: ["coil", "workpiece", "terminal"],
  planetary: ["sun", "planet", "carrier"],
  rotor: ["shaft", "rotor", "fan"],
  housing: ["housing", "seat", "bolt"],
  coupling: ["hub", "insert", "bolt"],
  gear: ["gear", "hub"],
  bearing: ["outer", "inner", "balls", "cage"],
};

function expectReferences(component: Component, response: Awaited<ReturnType<typeof mockAssistant.respond>>) {
  const ids = component.hotspots.map((hotspot) => hotspot.id);
  expect(response.message.length).toBeGreaterThan(60);
  expect(response.assumptions.length).toBeGreaterThan(0);
  for (const id of response.referencedHotspotIds) expect(ids).toContain(id);
  for (const action of response.actions) {
    expect(action.type).toBe("focus");
    expect(ids).toContain(action.hotspotId);
    expect(response.referencedHotspotIds).toContain(action.hotspotId);
  }
  for (const insight of response.insights) {
    if (insight.hotspotId) {
      expect(ids).toContain(insight.hotspotId);
      expect(response.referencedHotspotIds).toContain(insight.hotspotId);
    }
  }
}

describe("illustrative engineering catalog", () => {
  it("contains exactly the requested part identities", () => {
    expect(components.map(({ id }) => id)).toEqual([
      "input-shaft", "precision-spindle", "induction-coil", "planetary-gear", "rotor-assembly",
      "bearing-housing", "drive-coupling", "transmission-gear", "precision-bearing", "alloy-shaft",
    ]);
    expect(components.map(({ partNumber }) => partNumber)).toEqual([
      "IS-1042", "SP-2201", "IC-3017", "PG-7812", "RA-4410", "BH-1930", "DC-5511", "TG-8801", "BR-6208", "IS-1043",
    ]);
    expect(getComponent("not-a-component")).toBeUndefined();
    expect(ILLUSTRATIVE_DISCLAIMER).toMatch(/illustrative/i);
    expect(ILLUSTRATIVE_DISCLAIMER).toMatch(/not.*certified/i);
  });

  it.each(components)("$id has complete, internally consistent data", (component) => {
    expect(materials).toContainEqual(component.material);
    expect(component.manufacturingProcess).toEqual(manufacturingData[component.id]);
    expect(component.analysis).toEqual(analysisData[component.id]);
    expect(component.manufacturingProcess.length).toBeGreaterThanOrEqual(4);
    expect(component.inspection.length).toBeGreaterThanOrEqual(3);
    expect(component.failureModes.length).toBeGreaterThanOrEqual(3);
    expect(component.insights.length).toBeGreaterThanOrEqual(3);
    expect(component.dimensions.length).toBeGreaterThanOrEqual(4);
    expect(component.mechanicalProperties.length).toBeGreaterThanOrEqual(4);
    expect(component.applications.length).toBeGreaterThanOrEqual(2);
    expect(component.overallLength).toBeGreaterThan(0);
    expect(component.diameter).toBeGreaterThan(0);
    expect(component.weight).toBeGreaterThan(0);
    const ids = component.hotspots.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const hotspot of component.hotspots) {
      expect(partIds[component.modelKind]).toContain(hotspot.partId);
      expect(hotspot.position).toHaveLength(3);
      expect(hotspot.position.every(Number.isFinite)).toBe(true);
      expect(hotspot.position.every((coordinate) => Math.abs(coordinate) < 5)).toBe(true);
      expect(hotspot.surfaceFinish.length).toBeGreaterThan(0);
      expect(hotspot.tolerance.length).toBeGreaterThan(0);
    }
    for (const failure of component.failureModes) expect(ids).toContain(failure.hotspotId);
    for (const insight of component.insights) if (insight.hotspotId) expect(ids).toContain(insight.hotspotId);
    expect(component.analysis.maxStress).toBeGreaterThan(0);
    expect(component.analysis.criticalArea).toBeTruthy();
    expect(component.material.yieldStrength).toBeLessThanOrEqual(component.material.tensileStrength);
    expect(component.material.costIndex).toBeGreaterThan(0);
  });

  it("resolves material alternative IDs", () => {
    const ids = materials.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const material of materials) {
      for (const alternative of material.alternatives) {
        expect(ids).toContain(alternative);
        expect(alternative).not.toBe(material.id);
      }
    }
  });

  it("keeps the alloy-shaft comparison at identical geometry and illustrative load", () => {
    expect(shaft.material.name).toContain("4140");
    expect(alloyShaft.material.name).toContain("4340");
    expect(alloyShaft.dimensions).toEqual(shaft.dimensions);
    expect(alloyShaft.overallLength).toBe(285);
    expect(alloyShaft.diameter).toBe(shaft.diameter);
    expect(alloyShaft.analysis.maxStress).toBe(shaft.analysis.maxStress);
    expect(alloyShaft.hotspots.map(({ partId, position }) => ({ partId, position }))).toEqual(
      shaft.hotspots.map(({ partId, position }) => ({ partId, position })),
    );
  });

  it("uses agreed shaft model-local hotspot coordinates", () => {
    const expectedY: Record<string, number> = { shoulder: 0.6, journal: 1.5, spline: -1.8, thread: 2.4, gear: -0.8 };
    for (const component of [shaft, alloyShaft]) {
      for (const [partId, y] of Object.entries(expectedY)) {
        const hotspot = component.hotspots.find((entry) => entry.partId === partId)!;
        expect(hotspot.position[1]).toBe(y);
        const radius = Math.hypot(hotspot.position[0], hotspot.position[2]);
        expect(radius).toBeGreaterThanOrEqual(0.3);
        expect(radius).toBeLessThanOrEqual(0.5);
      }
      for (const hotspot of component.hotspots) expect(Math.abs(hotspot.position[1])).toBeLessThanOrEqual(2.8);
    }
  });
});

describe("catalog filtering", () => {
  it("supports empty filters without changing the input", () => {
    const before = components.map(({ id }) => id);
    const result = filterComponents(components, {});
    expect(result).toEqual(components);
    expect(result).not.toBe(components);
    expect(filterComponents(components, { category: "all", material: "All", query: "  " })).toEqual(components);
    expect(components.map(({ id }) => id)).toEqual(before);
  });

  it("searches names, numbers, materials, processes, and applications without case sensitivity", () => {
    expect(filterComponents(components, { query: "  IS-1042 " })).toEqual([shaft]);
    expect(filterComponents(components, { query: "4340" })).toContain(alloyShaft);
    expect(filterComponents(components, { query: "induction" }).map(({ id }) => id)).toContain("induction-coil");
    expect(filterComponents(components, { query: "copper coil" }).map(({ id }) => id)).toContain("induction-coil");
    expect(filterComponents(components, { query: "does not exist" })).toEqual([]);
  });

  it("combines all facets using AND and accepts material/process IDs", () => {
    const filters = {
      query: "shaft", category: shaft.category.toLowerCase(), material: shaft.material.id,
      process: shaft.manufacturingProcess[0].id, application: shaft.applications[0].toLowerCase(),
      criticality: shaft.criticality.toLowerCase(),
    };
    expect(filterComponents(components, filters)).toEqual([shaft]);
    expect(filterComponents(components, { material: "AISI 4340" })).toContain(alloyShaft);
    expect(filterComponents(components, { process: "grinding" })).toContain(shaft);
    expect(filterComponents(components, { criticality: "Low" }).every((component) => component.criticality === "Low")).toBe(true);
    expect(filterComponents(components, { ...filters, category: "Bearings" })).toEqual([]);
  });
});

describe("engineering helpers", () => {
  it("measures model-local Euclidean distance in millimetres", () => {
    expect(measureDistance([0, 0, 0], [3, 4, 0], 50)).toBe(250);
    expect(measureDistance([0, -2.8, 0], [0, 2.8, 0], 50)).toBeCloseTo(280);
    expect(measureDistance([0.3, 1.5, 0.1], [0.3, 1.5, 0.1], 50)).toBe(0);
    expect(measureDistance([-1, 2, 3], [2, -2, 3], 1)).toBe(5);
  });

  it("rejects invalid measurement inputs", () => {
    expect(() => measureDistance([NaN, 0, 0], [0, 0, 0], 50)).toThrow(RangeError);
    expect(() => measureDistance([0, 0, 0], [0, 0, 0], 0)).toThrow(RangeError);
    expect(() => measureDistance([0, 0, 0], [0, 0, 0], Infinity)).toThrow(RangeError);
    expect(() => measureDistance([0, 0, 0], [0, 0, 0], -1)).toThrow(RangeError);
  });

  it("calculates the illustrative static yield safety factor", () => {
    expect(safetyFactor(shaft)).toBeCloseTo(shaft.material.yieldStrength / shaft.analysis.maxStress);
    expect(safetyFactor(alloyShaft)).toBeGreaterThan(safetyFactor(shaft));
    expect(safetyFactor({ ...shaft, analysis: { ...shaft.analysis, maxStress: 0 } })).toBe(Infinity);
    expect(() => safetyFactor({ ...shaft, analysis: { ...shaft.analysis, maxStress: -10 } })).toThrow(RangeError);
    expect(() => safetyFactor({ ...shaft, material: { ...shaft.material, yieldStrength: NaN } })).toThrow(RangeError);
  });

  it("compares actual strength, relative cost, and a stated balanced metric", () => {
    const strength = compareComponents(shaft, alloyShaft, "strength");
    const cost = compareComponents(shaft, alloyShaft, "cost");
    const balanced = compareComponents(shaft, alloyShaft, "balance");
    expect(strength).toContain(alloyShaft.partNumber);
    expect(strength).toMatch(/4340|930/);
    expect(strength).toMatch(/safety factor/i);
    expect(cost).toContain(shaft.partNumber);
    expect(cost).toMatch(/cost index/i);
    expect(balanced).toMatch(/balance|balanced/i);
    expect(balanced).toMatch(/illustrative/i);
    expect(compareComponents(shaft, shaft, "strength")).toMatch(/same component|identical/i);
    expect(compareComponents(shaft, getComponent("precision-bearing")!, "strength")).toMatch(/different geometr|not.*interchangeable|different load/i);
  });
});

describe("mock component repository", () => {
  const repository = new MockComponentRepository(components);

  it("lists filtered components and resolves known and unknown IDs", async () => {
    expect(await repository.list({ query: "IS-1042" })).toEqual([shaft]);
    expect(await repository.getById("input-shaft")).toEqual(shaft);
    expect(await repository.getById("missing")).toBeUndefined();
  });

  it("honors cancellation", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(repository.list({}, controller.signal)).rejects.toMatchObject({ name: "AbortError" });
    await expect(repository.getById("input-shaft", controller.signal)).rejects.toMatchObject({ name: "AbortError" });
  });
});

describe("contextual mock engineering assistant", () => {
  it.each(["Explain this component", "Show critical areas", "Suggest alternative materials", "Explain manufacturing", "Predict failure modes", "Optimize this design"])("handles the AI action: %s", async (prompt) => {
    const response = await mockAssistant.respond(shaft, prompt);
    expectReferences(shaft, response);
    expect(response.referencedHotspotIds.length).toBeGreaterThan(0);
    expect(response.actions.length).toBeGreaterThan(0);
  });

  it("explains the selected feature with a matching focus action", async () => {
    const hotspot = shaft.hotspots.find(({ partId }) => partId === "thread")!;
    const response = await mockAssistant.respond(shaft, "Explain this feature", hotspot.id);
    expectReferences(shaft, response);
    expect(response.message).toContain(hotspot.name);
    expect(response.message).toContain(hotspot.tolerance);
    expect(response.referencedHotspotIds).toContain(hotspot.id);
    expect(response.actions).toContainEqual({ type: "focus", hotspotId: hotspot.id });
  });

  it.each(components)("anchors all six actions to $id, not a generic shaft", async (component) => {
    for (const prompt of ["explain", "critical", "alternatives", "manufacturing", "failure", "optimize"]) {
      const response = await mockAssistant.respond(component, prompt);
      expectReferences(component, response);
      expect(response.message).toContain(component.partNumber);
    }
  });

  it("keeps copper-coil heating separate from the steel workpiece", async () => {
    const coil = getComponent("induction-coil")!;
    const response = await mockAssistant.respond(coil, "Explain manufacturing and thermal behavior");
    expectReferences(coil, response);
    expect(response.message).toMatch(/copper/i);
    expect(response.message).toMatch(/steel workpiece/i);
    expect(response.message).toMatch(/cool|water/i);
    expect(response.assumptions.join(" ")).toMatch(/workpiece/i);
  });

  it("discusses material-specific alternatives and manufacturing trade-offs", async () => {
    const response = await mockAssistant.respond(shaft, "Suggest alternative materials");
    expect(response.message).toContain("4340");
    expect(response.message).toMatch(/cost|heat treatment|harden/i);
    const gear = getComponent("transmission-gear")!;
    const manufacturing = await mockAssistant.respond(gear, "Explain manufacturing");
    expect(manufacturing.message).toMatch(/carburiz/i);
    expect(manufacturing.message).toMatch(/inspection|inspect/i);
  });

  it("uses the selected feature's actual failure mode", async () => {
    const mode = shaft.failureModes.find((failure) => failure.hotspotId === "spline-root")!;
    const response = await mockAssistant.respond(shaft, "What can fail here?", mode.hotspotId);
    expect(response.message).toContain(mode.name);
    expect(response.message).toContain(mode.prevention);
    expect(response.referencedHotspotIds).toContain(mode.hotspotId);
  });

  it("quantifies diameter reduction as a conditional solid circular-shaft estimate", async () => {
    const response = await mockAssistant.respond(shaft, "What if I reduce the diameter by 10%?");
    expectReferences(shaft, response);
    expect(response.message).toContain("37.2%");
    expect(response.message).toContain("19.0%");
    expect(response.message).toContain("1.93");
    expect(response.message).toMatch(/fatigue|stiffness/);
    expect(response.assumptions.join(" ")).toMatch(/solid circular|unchanged load/);
  });

  it("supports explicit millimetre reductions and rejects impossible reductions", async () => {
    const response = await mockAssistant.respond(shaft, "Reduce diameter from 50 mm to 45 mm");
    expect(response.message).toContain("37.2%");
    const impossible = await mockAssistant.respond(shaft, "Reduce diameter by 100%");
    expect(impossible.message).toMatch(/between 0 and 100|positive diameter/);
    expect(impossible.message).not.toMatch(/Infinity|NaN/);
  });

  it("does not apply a shaft scaling law to a copper coil or bearing", async () => {
    const response = await mockAssistant.respond(getComponent("induction-coil")!, "Reduce diameter by 10%");
    expect(response.message).toMatch(/not.*solid|cannot.*shaft|not.*apply/i);
    expect(response.message).toMatch(/coupling|clearance|coolant/i);
    expect(response.message).not.toContain("37.2%");
  });

  it("provides a bounded unknown fallback and ignores stale hotspot IDs", async () => {
    const response = await mockAssistant.respond(shaft, "What is the weather on Mars?", "stale-hotspot");
    expectReferences(shaft, response);
    expect(response.message).toMatch(/cannot|can't|limited|don't have/i);
    expect(response.message).toMatch(/manufacturing/i);
    expect(response.assumptions.join(" ")).toMatch(/stale|not found|not part/i);
    expect(response.referencedHotspotIds).not.toContain("stale-hotspot");
  });

  it("rejects both pre-aborted and immediately cancelled requests", async () => {
    const before = new AbortController();
    before.abort();
    await expect(mockAssistant.respond(shaft, "explain", undefined, before.signal)).rejects.toMatchObject({ name: "AbortError" });
    const during = new AbortController();
    const pending = mockAssistant.respond(shaft, "explain", undefined, during.signal);
    during.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });
});
