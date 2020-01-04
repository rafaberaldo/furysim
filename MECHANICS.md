# Mechanics

## About

FurySim follows strictly everything in this Wiki: https://github.com/magey/classic-warrior/wiki.
What was not tested/confirmed from Magey's Github is found here: https://vanilla-wow.fandom.com/wiki/Vanilla_WoW_Wiki.
Other stuff that is not documented anywhere was asked on Fight Club's Discord.
Non confirmed mechanics are assumptions due to lack of data.

Anything else that is not on this list consider not implemented.

## Sim specifics / Limitations

* Sim is Patchwerk-style fight.
* Weapon damage is randomized like everything else.
* Rage gain, Damage dealt and Attack power are rounded.
* Attack speed is not rounded.
* Flurry buff duration is not tracked (would never run off).
* Only Fury tree and up to Two-Hand Spec and Impale from Arms are tracked.
* Sim assumes you're never taking any damage (so no Enrage, Parry haste etc).
* Batching is not implemented.
* Deep Wounds is not implemented.
* Battle Shout triggers a GCD at the start of fight.
* Slam implementation is the Autoslam ("Slam macro") version.
* Windfury have a 100 ms internal cooldown to prevent procs off itself and/or multiple procs on a chain.
* About fight timeline:
  * Events at same time does not always shows in correct order.
  * ``BUFF_FADED`` is not shown at the exact time, it logs after next event happens.

## Confirmed

* When Heroic Strike is queued, offhand swings can't miss.
* Heroic Strike consumes a Flurry charge.
* Swings are one-roll table, skills are two-roll table.
* Anger Management generates 1 rage every 3 seconds.
* Orc racial Blood Fury scales with Strength, not from flat Attack Power.
* Windfury:
  * Resets swing timer.
  * Gives 2* charges that swings can consume for extra AP (* 1 charge if procced by swing).
  * If charges are not consumed in 1.5 secs the buff is lost.
  * Can proc other extra-attacks effects and can be procced by them on a chain.
  * Can't proc itself.
  * Can't be procced twice at same chain.
* You lose 4.8% of critical from auras when attacking bosses.
* You lose 1% hit from gear if the delta between weapon skill and target defense is > 10.
* Whirlwind and Cleave do not refund rage.
* Execute damage calculation is instantly but rage removal happens on next batch.
  * *To roughly simulate batching, rage is removed after any procs occur.*
* A single attack can proc both weapon enchant and an extra-attack.
* A single attack can't proc multiple extra-attacks (if procced by swing, not implemented).

## Non confirmed

* Dual Wield penalty is ``80% * base_miss + 20%``.
* Offhand initial swing start at 50%.
* Skill miss refunds 80% of rage. Execute miss refunds 84% of extra rage.
* Dodged swing rage gain is 75% of average damage.
* Glanced swing rage gain is based on the damage.
* Winfury don't consume charges on misses.
* Priority for extra-attacks is WF > MH / OH > Trinket.
* Armor can't go negative.
* When Autoslam miss/dodge, swing is lost.

## Sources

* https://github.com/magey/classic-warrior/wiki/Attack-table
* https://github.com/magey/classic-warrior/wiki/Windfury-Totem
* https://github.com/magey/classic-warrior/wiki/Crit-aura-suppression
* https://github.com/magey/classic-warrior/wiki/Spell-batching
* https://www.wowhead.com/news=292085/hit-cap-in-classic-wow-clarifications
* https://us.forums.blizzard.com/en/wow/t/wow-classic-not-a-bug-list-updated-12-13-2019/175887
