export const moduleName = 'smooth-combat';
export const defaultSettings = {
  alternativeMacro: {
    name: 'Alternative item macros',
    default: true,
    hint: 'Change new item macros to make them work when no token is selected',
  },
  applyDamage: {
    name: 'Apply damage automatically',
    default: true,
  },
  debug: {
    name: 'Debug mode',
    default: false,
    hint: 'Print debug information in console',
  },
};

type FlattenDefaults<T> = {
  [K in keyof T]: T[K] extends {default: infer U} ? U : T[K]
}
export type Settings = FlattenDefaults<typeof defaultSettings>

export type Response = { result: any, requestId: number, userId: string }
export type Request = { requestId: number, functionName: string, args: any[] }
export type RequestEvent = {type: 'request', data: Request}
export type ResponseEvent = {type: 'response', data: Response}
export type Event = RequestEvent|ResponseEvent
