const m = Math

function getRandom(min, max) {
  return Math.random() * (max - min) + min
}

function clamp(value, min = 0, max = 100) {
  return value < min
    ? min
    : value > max
      ? max
      : value
}

function ppmToChance(ppm, speed) {
  return (ppm / 60) * speed
}

const defaultTalentUrl = 'https://classic.wowhead.com/talent-calc/warrior/30305001302-05050005525010051'
function parseTalents(url = defaultTalentUrl) {
  const numbers = url.split('/').pop()
  let [arms, fury, prot] = numbers.split('-')

  const getValue = (str, i) => {
    return (str && str.length > i)
      ? parseInt(str[i]) || 0
      : 0
  }

  return {
    improvedHS: getValue(arms, 0),
    tacticalMastery: getValue(arms, 4),
    angerManagement: getValue(arms, 7),
    deepWounds: getValue(arms, 8),
    twoHandSpec: getValue(arms, 9),
    impale: getValue(arms, 10),

    boomingVoice: getValue(fury, 0),
    cruelty: getValue(fury, 1),
    unbridledWrath: getValue(fury, 3),
    improvedBS: getValue(fury, 7),
    dualWieldSpec: getValue(fury, 8),
    impExecute: getValue(fury, 9),
    improvedSlam: getValue(fury, 11),
    deathWish: getValue(fury, 12),
    flurry: getValue(fury, 15),
    bloodthirst: getValue(fury, 16)
  }
}
