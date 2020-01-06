export const m = Math

export function getRandom(min, max) {
  return m.random() * (max - min) + min
}

export function getRandomInt(min, max) {
  return m.round(m.random() * (max - min) + min)
}

export function clamp(value, min = 0, max = 100) {
  return value < min
    ? min
    : value > max
      ? max
      : value
}

export function ppmToChance(ppm, speed) {
  return (ppm / 60) * speed
}
