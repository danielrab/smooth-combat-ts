/* eslint-disable no-undef */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import switchTool from './util.js';
import { patchTargeting, unpatchTargeting } from './monkey-patches.js';
import settings from './settings.js';
function clearTargets() {
    game.user.targets.forEach((token) => token.setTarget(false));
}
function currentTargets() {
    return Array.from(game.user.targets);
}
function manualTargetSelect(amount) {
    const promise = new Promise((resolve) => {
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
export default function ensureTargets(amount) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(amount > 0)) {
            return [];
        }
        if (game.user.targets.size === amount) {
            return Array.from(game.user.targets);
        }
        if (settings.removeTargetsPre)
            clearTargets();
        patchTargeting();
        const startingTool = switchTool({ controlName: 'token', toolName: 'target' });
        const promise = new Promise((resolve) => {
            let hook;
            function smartResolve(result) {
                Hooks.off('targetToken', hook);
                unpatchTargeting();
                switchTool(startingTool);
                if (settings.removeRargetsPost)
                    clearTargets();
                resolve(result);
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
                        callback: () => __awaiter(this, void 0, void 0, function* () {
                            Hooks.off('targetToken', hook);
                            manualTargeting = true;
                            const res = yield manualTargetSelect(amount);
                            smartResolve(res);
                        }),
                    },
                },
                close: () => {
                    if (!manualTargeting)
                        smartResolve(null);
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
    });
}
