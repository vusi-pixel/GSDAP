import { ProviderAdapter } from './adapter.interface';
import { CourseraAdapter } from './coursera.adapter';
import { GoogleAdapter } from './google.adapter';
import { MicrosoftAdapter } from './microsoft.adapter';
import { NvidiaAdapter } from './nvidia.adapter';
import { TvetAdapter } from './tvet.adapter';

export const providerAdapters: Map<string, ProviderAdapter> = new Map([
  ['coursera', new CourseraAdapter()],
  ['google', new GoogleAdapter()],
  ['microsoft', new MicrosoftAdapter()],
  ['nvidia', new NvidiaAdapter()],
  ['tvet', new TvetAdapter()],
]);

export function getAdapter(name: string): ProviderAdapter | undefined {
  return providerAdapters.get(name);
}

export { CourseraAdapter, GoogleAdapter, MicrosoftAdapter, NvidiaAdapter, TvetAdapter };
