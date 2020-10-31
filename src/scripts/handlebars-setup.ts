/* eslint-disable func-names */

Handlebars.registerHelper('ifObject', function (item, options) {
  if (typeof item === 'object') return options.fn(this);
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

  if (operators[operator]) return options.fn(this);
  return options.inverse(this);
});

Hooks.on('init', async () => {
  const folderInfo = await FilePicker.browse('data', 'modules/smooth-combat/templates/*.hbs');
  loadTemplates(folderInfo.files);
});
