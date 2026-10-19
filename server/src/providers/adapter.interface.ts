import { NormalizedCourse } from '../../../shared/src/index';

export interface ProviderAdapter {
  name: string;
  fetchCatalog(): Promise<NormalizedCourse[]>;
  getDeepLink(course: { url: string; externalId?: string | null }): string;
}
