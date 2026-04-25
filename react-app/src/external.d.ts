declare module 'react' {
  export type CSSProperties = Record<string, string | number | undefined>;
  export type ReactNode = any;
  export interface MutableRefObject<T> {
    current: T;
  }
  export type ComponentType<P = any> = (props: P) => any;
  export const StrictMode: ComponentType<{ children?: ReactNode }>;
  export const Suspense: ComponentType<{ children?: ReactNode; fallback?: ReactNode }>;
  export function lazy<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>): T;
  export function startTransition(scope: () => void): void;
  export function useDeferredValue<T>(value: T): T;
  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T;
  export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prevState: T) => T)) => void];
  export function useRef<T>(initialValue: T): MutableRefObject<T>;
}

declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): {
    render(node: any): void;
    unmount(): void;
  };
}

declare module 'react/jsx-runtime' {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
}

declare module 'three' {
  const THREE: any;
  export = THREE;
}

declare namespace JSX {
  type Element = any;

  interface IntrinsicElements {
    [elementName: string]: any;
  }
}
