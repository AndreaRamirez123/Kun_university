// Generador pseudoaleatorio con semilla: la isla sale igual en cada visita
// y en cada render (Math.random no es válido durante el render de React).
export function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}
