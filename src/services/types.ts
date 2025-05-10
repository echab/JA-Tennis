import type { DataType } from '../domain/types';

const cache = new Map<string, Promise<DataType>>();

type Module = { default: DataType };

type TypeType = {
  code: string,
  name: string,
  defaultVersion: number,
  loader(version: number): Promise<Module>,
}

export const TYPES: Record<string, TypeType> = {
  FFT: { code: 'FFT', name: 'Federation Française de Tennis', defaultVersion: 5, loader: (version: number) => import('./fft/index') },
  FFTT: { code: 'FFTT', name: 'Federation Française de Tennis de Table', defaultVersion: 1, loader: (version: number) => import('./fftt/index') },
};

export async function loadType(type: string, version: number): Promise<DataType> {
  const key = `${type}-${version}`;
  let p = cache.get(key);
  if (p) {
    return p;
  }

  const loader = TYPES[type]?.loader;
  if (!loader) {
    throw new Error(`Unknown data type "${type}"`);
  }
  p = loader(version).then((mod) => mod.default);

  cache.set(key, p);
  return p;
}