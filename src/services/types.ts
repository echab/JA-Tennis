import type { DataType } from '../domain/types';

const cache = new Map<string, Promise<DataType>>();

export async function loadType(type: string, version: number): Promise<DataType> {
  const key = `${type}-${version}`;
  let p = cache.get(key);
  if (p) {
    return p;
  }
  switch (type) {
    case 'FFT': {
      p = import('./fft/index') // TODO use version
        .then((mod) => mod.default);
      cache.set(key, p);
      return p;
    }
  }
  throw new Error(`Unknown data type "${type}"`);
}