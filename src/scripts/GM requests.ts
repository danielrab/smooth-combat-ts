import getDebugger from './debug.js';
import { moduleName } from './constants.js';
import type {
  Event, Response, ResponseEvent, RequestEvent,
} from './constants.js';

function getOnlineUsers(): User[] {
  return game.users.entities.filter((u) => u.active);
}

function getAllGMs(): User[] {
  return getOnlineUsers().filter((u) => u.isGM);
}

function getGM(): User|null {
  const GMs = getAllGMs();
  if (GMs.length > 0) return GMs.sort((a, b) => a.id.localeCompare(b.id))[0];
  return null;
}

const requestableFunctions = {};
const pendingPromises = {};
let lastRequestId = 0;
let debug;

function respond(response: Response) {
  const responseEvent: ResponseEvent = { type: 'response', data: response };
  game.socket.emit(`module.${moduleName}`, responseEvent);
}

function request(functionName: string, args: any[], requestId) {
  const requestEnent: RequestEvent = {
    type: 'request',
    data: {
      functionName, args, requestId,
    },
  };
  game.socket.emit(`module.${moduleName}`, requestEnent);
}

export function init() {
  debug = getDebugger();
  game.socket.on(`module.${moduleName}`, async (event: Event, userId: string) => {
    if (event.type === 'request') {
      if (game.user !== getGM()) return;
      debug.log(`executing function "${event.data.functionName}" with arguments [${event.data.args}] on request of user with ID ${userId}`, true);
      const func = requestableFunctions[event.data.functionName];
      if (!func) console.error(`can't find requestable function "${event.data.functionName}"`);
      const result = await func(...event.data.args);
      respond({ result, requestId: event.data.requestId, userId });
    } else if (event.type === 'response') {
      if (event.data.userId !== game.user.id) return;
      if (!pendingPromises[event.data.requestId]) { console.error("can't find pending promise for requestable function"); return; }
      pendingPromises[event.data.requestId](event.data.result);
    }
  });
}

// eslint-disable-next-line no-unused-vars
export function makeRequestable<T extends(...args: any[]) => any>(func: T, functionName: string) {
  if (requestableFunctions[functionName]) console.warn(`overriding requestable function with key "${functionName}" this has a high chance of causing errors`);
  async function GMcallable(...args: Parameters<T>): Promise<ReturnType<T>> {
    if (game.user.isGM) {
      return func(...args);
    }
    if (!getGM()) {
      ui.notifications.error(`can't execute function "${functionName}" because there's no GM. Expect errors in the "${moduleName}" module`);
    }
    const promise = new Promise<ReturnType<T>>((resolve, reject) => {
      lastRequestId += 1;
      pendingPromises[lastRequestId] = resolve;
      request(functionName, args, lastRequestId);
      setTimeout(() => {
        if (pendingPromises[lastRequestId]) reject(new Error(`request for function "${functionName}" timed out`));
      }, 3000);
    });
    return promise;
  }
  requestableFunctions[functionName] = GMcallable;
  return GMcallable;
}
