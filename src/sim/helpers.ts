export const m = Math

export function getRandom(min: number, max: number) {
  return m.random() * (max - min) + min
}

export function getRandomInt(min: number, max: number) {
  return m.round(m.random() * (max - min) + min)
}

export function clamp(value: number, min: number = 0, max: number = 100) {
  return value < min
    ? min
    : value > max
      ? max
      : value
}

export function ppmToChance(ppm: number, speed: number) {
  return (ppm / 60) * speed
}
