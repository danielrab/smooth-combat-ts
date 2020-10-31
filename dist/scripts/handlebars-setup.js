/* eslint-disable func-names */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Handlebars.registerHelper('ifObject', function (item, options) {
    if (typeof item === 'object')
        return options.fn(this);
    return options.inverse(this);
});
Handlebars.registerHelper('when', function (operand1, operator, operand2, options) {
    const operators = {
        eq: operand1 === operand2,
        noteq: operand1 !== operand2,
        gt: Number(operand1) > Number(operand2),
        or: operand1 || operand2,
        and: operand1 && operand2,
        '%': operand1 % operand2 === 0,
    };
    if (operators[operator])
        return options.fn(this);
    return options.inverse(this);
});
Hooks.on('init', () => __awaiter(this, void 0, void 0, function* () {
    const folderInfo = yield FilePicker.browse('data', 'modules/smooth-combat/templates/*.hbs');
    loadTemplates(folderInfo.files);
}));
