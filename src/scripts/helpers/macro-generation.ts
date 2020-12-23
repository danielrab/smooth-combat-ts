function indent(statement: string, value = 2) {
  return statement.split('\n').map((line) => ' '.repeat(value) + line).join('\n');
}

function block(statement: string) {
  return `{\n${indent(statement)}\n}`;
}

function assign(varName: string, value: string) {
  return `${varName} = ${value}`;
}

function declare(varName: string, value?: string) {
  if (!value) return `let ${varName};`;
  return `let ${assign(varName, value)};`;
}

function IF(condition: string, statement: string, ELSE?: string) {
  if (!ELSE) return `if (${condition}) ${block(statement)}`;
  return `if (${condition}) ${block(statement)} else ${block(ELSE)}`;
}

function or(statement1: string, statement2: string) {
  if (!statement2) return statement1;
  if (!statement1) return statement2;
  return `(${statement1}) || (${statement2})`;
}

// eslint-disable-next-line no-unused-vars
function equals(statement1: string, statement2: string) {
  return `(${statement1}) === (${statement2})`;
}

function getTokenActor(id: string) {
  if (!id) return null;
  return `game.actors.tokens["${id}"]`;
}

function getActor(id: string) {
  if (!id) return null;
  return `game.actors.get("${id}")`;
}

function getItem(actor: string, id: string) {
  return `${actor}?.items.get('${id}')`;
}

function useSpell(actor: string, item: string) {
  return `${actor}.useSpell(${item})`;
}

function roll(item: string) {
  return `${item}.roll()`;
}

function smartItemUse(actor: string, item: string, itemData) {
  if (itemData.data.type === 'spell') return useSpell(actor, item);
  return roll(item);
}

function rollItemMacro(itemName: string) {
  return `game.dnd5e.rollItemMacro("${itemName}")`;
}

function newItemMacro(itemData) {
  const actorVar = 'the_actor';
  const itemVar = 'item';
  const lines = [
    declare(actorVar, or(getTokenActor(itemData.tokenId), getActor(itemData.actorId))),
    declare(itemVar, getItem(actorVar, itemData.data._id)),
    IF(itemVar,
      smartItemUse(actorVar, itemVar, itemData),
      rollItemMacro(itemData.data.name)),
  ];
  return lines.join('\n');
}

export default function onItemHotbarDrop(hotbar, item) {
  if (item.type !== 'Item') return;
  if (!['weapon', 'spell'].includes(item.data.type)) return;
  Hooks.once('preCreateMacro', (script) => { script.command = newItemMacro(item); });
}