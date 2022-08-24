export type TupleToUni<T> = T extends Array<infer E> ? E : never
export type VmodelEvent = {
  (UPDATE_MODEL_EVENT: string, value: string): void
}

export { isObject, isString } from '@vue/shared'
export { isNumber } from '@vueuse/core'

export const isUndefined = (val: any): val is undefined => val === undefined
