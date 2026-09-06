import { components } from "../data/components";
import { filterComponents, type ComponentFilters } from "../lib/engineering";
import type { Component } from "../types/engineering";
import { waitForMockResponse } from "./abort";

export interface ComponentRepository {
  list(filters?: ComponentFilters, signal?: AbortSignal): Promise<Component[]>;
  getById(id: string, signal?: AbortSignal): Promise<Component | undefined>;
}

export class MockComponentRepository implements ComponentRepository {
  private readonly catalog: Component[];

  constructor(catalog: readonly Component[] = components) {
    this.catalog = [...catalog];
  }

  async list(filters: ComponentFilters = {}, signal?: AbortSignal): Promise<Component[]> {
    await waitForMockResponse(0, signal);
    if (signal?.aborted) throw new DOMException("The engineering request was cancelled.", "AbortError");
    return filterComponents(this.catalog, filters);
  }

  async getById(id: string, signal?: AbortSignal): Promise<Component | undefined> {
    await waitForMockResponse(0, signal);
    if (signal?.aborted) throw new DOMException("The engineering request was cancelled.", "AbortError");
    return this.catalog.find((component) => component.id === id);
  }
}

export const mockComponentRepository: ComponentRepository = new MockComponentRepository();
