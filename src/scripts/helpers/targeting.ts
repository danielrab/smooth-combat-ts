/* eslint-disable no-undef */

import { switchTool } from './misc.js';
import { patchTargeting, unpatchTargeting } from './patches.js';
import { settings } from '../settings.js';

function clearTargets() {
  for (const token of game.user.targets) token.setTarget(false);
}

function currentTargets() {
  return Array.from(game.user.targets);
}

function manualTargetSelect(amount): Promise<Token[]> {
  const promise = new Promise<Token[]>((resolve) => {
    const dialog = new Dialog({
      title: 'Choose Target(s)',
      content: `<p>${amount} targets recommended</p>`,
      buttons: {
        abort: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Done',
        },
      },
      close: () => resolve(currentTargets()),
    }, { top: 0 });
    dialog.render(true);
  });
  return promise;
}

export default async function ensureTargets(amount): Promise<Actor[]> {
  if (!(amount > 0)) {
    return [];
  }
  if (game.user.targets.size === amount) {
    return Array.from(game.user.targets).map((token) => token.actor);
  }
  if (settings.removeTargetsPre) clearTargets();
  patchTargeting();

  const startingTool = switchTool({ controlName: 'token', toolName: 'target' });

  const promise = new Promise<Actor[]>((resolve) => {
    let hook;
    function smartResolve(result: Token[]) {
      Hooks.off('targetToken', hook);
      unpatchTargeting();
      switchTool(startingTool);
      if (settings.removeRargetsPost) clearTargets();
      resolve(result ? result.map((token) => token.actor) : null);
    }

    let manualTargeting = false;
    const dialog = new Dialog({
      title: 'Choose Target(s)',
      content: `<p>You must choose ${amount} target(s)</p>`,
      buttons: {
        abort: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Abort',
          callback: () => smartResolve(null),
        },
        manualSelect: {
          label: 'Select other amount',
          callback: async () => {
            Hooks.off('targetToken', hook);
            manualTargeting = true;
            const res = await manualTargetSelect(amount);
            smartResolve(res);
          },
        },
      },
      close: () => {
        if (!manualTargeting) smartResolve(null);
      },
    }, { top: 0 });

    hook = Hooks.on('targetToken', () => {
      if (game.user.targets.size === amount) {
        smartResolve(currentTargets());
        dialog.close();
      }
    });
    dialog.render(true);
  });

  return promise;
}
