# Mechanics

## About

FurySim follows strictly everything in this Wiki: [https://github.com/magey/classic-warrior/wiki].
Some stuff that is not found on that Wiki was found in this one: [https://vanilla-wow.fandom.com/wiki/Vanilla_WoW_Wiki].
Other stuff that was not found anywhere was asked on Fight Club's Discord.

FurySim does not average anything, everything is rolled on the fly.
Everything on this list is already implemented, non confirmed mechanics
are assumptions due to lack of data.

## Sim specifics / Limitations

* Sim is Patchwerk-style fight.
* Rage gain, Damage dealt and Attack power are rounded.
* Attack speed is not rounded.
* Flurry buff duration is not tracked (would never run off).
* Only Fury tree and up to Two-Hand Spec and Impale from Arms are tracked (for now).
* Sim assumes you're never taking any damage (so no Enrage, Parry haste etc).
* Batching is not implemented.
* Deep Wounds is not implemented.
* Battle Shout triggers a GCD at the start of fight.
* Execute phase is the last 14% of fight duration.
* Windfury and items with extra-attack mechanic have a 10ms internal cooldown.
  * This prevents procs off itself, and proccing twice in the same swing.
* Timeline for ``debug: true``:
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
  * *To roughly simulate batching, rage is removed after any extra-attacks occur.*

## Non confirmed

* Dual Wield penalty is ``80% * base_miss + 20%``.
* Offhand initial swing delay/desync is between 200 and 300 ms.
* Skill miss refunds 80% of rage. Execute miss refunds 84% of extra rage.
* Dodged swing rage gain is 75% of average damage.
* Glanced swing rage gain is based on the damage.
* Winfury don't consume charges on misses.
* A single attack can proc both weapon enchant and an extra-attack.
* A single attack can't proc multiple extra-attacks (not the same as chain proc).
* Priority for extra-attacks is WF > MH > OH > Trinket.

## Sources

* [https://github.com/magey/classic-warrior/wiki/Attack-table]
* [https://github.com/magey/classic-warrior/wiki/Windfury-Totem]
* [https://github.com/magey/classic-warrior/wiki/Crit-aura-suppression]
* [https://github.com/magey/classic-warrior/wiki/Spell-batching]
* [https://www.wowhead.com/news=292085/hit-cap-in-classic-wow-clarifications]
* [https://us.forums.blizzard.com/en/wow/t/wow-classic-not-a-bug-list-updated-12-13-2019/175887]
