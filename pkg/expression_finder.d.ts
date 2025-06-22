/* tslint:disable */
/* eslint-disable */
export function set_panic_hook(): void;
/**
 * JavaScriptから呼び出されるエントリーポイント関数
 */
export function find_calculation_wasm(numbers: Uint32Array, target: number, limit: number): Expression[];
/**
 * プログラミング形式(prog)とLaTeX形式(tex)の数式を保持する構造体
 */
export class Expression {
  private constructor();
  free(): void;
  prog: string;
  tex: string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_expression_free: (a: number, b: number) => void;
  readonly __wbg_get_expression_prog: (a: number) => [number, number];
  readonly __wbg_set_expression_prog: (a: number, b: number, c: number) => void;
  readonly __wbg_get_expression_tex: (a: number) => [number, number];
  readonly __wbg_set_expression_tex: (a: number, b: number, c: number) => void;
  readonly find_calculation_wasm: (a: number, b: number, c: number, d: number) => [number, number];
  readonly set_panic_hook: () => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_3: WebAssembly.Table;
  readonly __externref_drop_slice: (a: number, b: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
