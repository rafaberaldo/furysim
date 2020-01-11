# Mechanics

* FurySim follows strictly everything in [Magey's Wiki][magey].
* What is not tested/confirmed from Magey, was found in [Vanilla Wiki][wiki].
* Other stuff that is not documented anywhere was asked on Fight Club's Discord.
* Non confirmed mechanics are assumptions due to lack of data.

> Consider everything in this list implemented, unless stated otherwise.

## Sim specifics / Limitations

* Sim is Patchwerk-style fight.
* Weapon damage is randomized like everything else.
* Rage gain, Damage dealt and Attack power are rounded.
* Attack speed is not rounded.
* Flurry buff duration is not tracked (would never run off).
* Only Fury tree and up to 2HSpec/Impale from Arms are tracked.
* Sim assumes you're never taking any damage (so no Enrage, Parry haste etc).
* [Batching][batching] is not implemented.
* Deep Wounds is not implemented.
* Battle Shout triggers a GCD at the start of fight.
* Windfury have a 100 ms internal cooldown to simulate correct behavior.
* Non confirmed weapon procs are set to 1 PPM.
* It runs a lot faster in Chrome than Firefox (can't do anything about it).
* About fight timeline:
  * Events at same time does not *always* shows in correct order.
  * ``BUFF_FADED`` is not shown at the exact time, it logs after next event happens.

## Confirmed Mechanics

* When Heroic Strike is queued, offhand swings can't miss [[source][hsbug]].
* Heroic Strike consumes a Flurry charge.
* Swings are one-roll table, skills are two-roll table [[source][attacktable]].
* Anger Management generates 1 rage every 3 seconds.
* Orc racial Blood Fury scales with Strength, not from flat Attack Power [[source][bf]].
* Windfury [[source][wf]]:
  * Resets swing timer.
  * Gives 2* charges that swings can consume for extra AP (* 1 charge if procced by swing).
  * If charges are not consumed in 1.5 secs the buff is lost.
  * Can proc other extra-attacks effects and can be procced by them on a chain.
  * Can't proc itself.
  * Can't be procced twice on a chain.
* You lose 4.8% of critical from auras when attacking bosses [[source][critsupp]].
* You lose 1% hit from gear if the delta between weapon skill and target defense is > 10 [[source][hitcap]].
* Whirlwind and Cleave do not refund rage [[source][refund]].
* Execute damage calculation is instantly but rage removal happens on next batch [[source][batching]].
  * *To roughly simulate batching, rage is removed after any procs occur.*
* A single attack can proc both weapon enchant and an extra-attack.
* A single attack can't proc multiple extra-attacks if procced by swing.
* A single attack can proc multiple extra-attacks if procced by skill (NOT IMPLEMENTED).
* When increasing attack speed mid-swing the remainder of swing timer will be hastened.

## Non Confirmed Mechanics

* Dual Wield penalty is ``80% * base_miss + 20%``.
* Offhand initial swing start at 50%.
* Skill miss refunds 80% of rage. Execute miss refunds 84% of extra rage.
* Dodged swing rage gain is 75% of average damage.
* Glanced swing rage gain is based on the damage.
* Winfury don't consume charges on misses.
* Priority for extra-attacks is WF > MH / OH > Trinket.
* Armor can't go negative.

[magey]: https://github.com/magey/classic-warrior/wiki
[wiki]: https://vanilla-wow.fandom.com/wiki/Vanilla_WoW_Wiki
[hsbug]: https://us.forums.blizzard.com/en/wow/t/wow-classic-%E2%80%9Cnot-a-bug%E2%80%9D-list-updated-12132019/175887/115
[batching]: https://github.com/magey/classic-warrior/wiki/Spell-batching
[wf]: https://github.com/magey/classic-warrior/wiki/Windfury-Totem
[attacktable]: https://github.com/magey/classic-warrior/wiki/Attack-table
[critsupp]: https://us.forums.blizzard.com/en/wow/t/bug-berserker-stance/196414/8
[hitcap]: https://www.wowhead.com/news=292085/hit-cap-in-classic-wow-clarifications
[bf]: https://github.com/magey/classic-warrior/issues/2
[refund]: https://github.com/magey/classic-warrior/issues/27
