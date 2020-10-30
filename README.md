manifest url: https://raw.githubusercontent.com/danielrab/smooth-combat/master/module.json <br><br>
This module was inspired primarily by MidiQOL and tries to provide automation of combat for dnd5e. <br>
Currently it is on a very early stage of development, so it only dealt with weapon attacks (not spells and feats). <br>
My main goal when developing this module is first and foremost smooth user experience. It means that if a click or a keypress is avoidable, I will try to avoid it. It also means that on every step, the information must be presented in the cleanest form, and the user should have full control over every step of the process. <br>
For now, what the module does is: <br>
1) When an item is dragged to the macro panel, the script that is created is replaced with one that allows to roll the attack even if no token is selected.
2) When a weapon is used, the following will happen: <br>
2.1) You will be switched to target selection. <br>
2.2) All targets will be cleared. <br>
2.3) You will be asked to select a target and given an option to abort the execution or to select another amount of targets. <br>
2.4) Selection of multiple targets will be inverted (no need to hold shift to select multiple). <br>
2.5) Once you selected the target(s), an attack will be rolled for each target and damage will be rolled for each attack that hits showing each damage formula and their damage types separately (in case the enemy has resistance to some but not all of the damage dealt) <br>
2.6) After all of this you will be returned to the tool and layer you were at, and the target selection will return to normal. <br>
2.7) Damage will be applied using resistances, immunities, and vulnerabilities of the hit creatures (the weapons are assumed to be nonmagical until i find a way to differentiate between magical and nonmagical weapons). <br><br>
when using an item, alt will use advantage, ctrl will use disadvantage, shift will use versitile. <br><br>
planned in the near future:<br>
1) sttings.
2) a damage card for the DM to know how much damage was actually dealt after the resistances, as well as have an option to reverse it.
3) ability to define a secondary use with multiple formulas. (currently versitle replaces only the first one).
4) ability to define a weapon as magical for purposes of bypassing resistances.
5) automatic disadvantage for ranged weapons depending on range.
6) ability to define a token as in partial cover.
