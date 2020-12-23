/* eslint-disable no-new-func */
/* eslint-disable func-names */

// #region targeting
const { setTarget } = Token.prototype;

export function patchTargeting() {
  Token.prototype.setTarget = function (targeted, options) {
    options.releaseOthers = !options.releaseOthers;
    setTarget.call(this, targeted, options);
  };
}

export function unpatchTargeting() {
  Token.prototype.setTarget = setTarget;
}
// #endregion

// #region actor
// #endregion

export function applyPermanetPatches() {

}
