export const District = [
  "all",
  "blackriver",
  "flacq",
  "grandport",
  "moka",
  "pamplemousses",
  "plainewilhems",
  "portlouis",
  "rivieredurempart",
  "savanne",
  "rodrigues",
];

export const Region: Record<string, string[]> = {
  north: ["pamplemousses", "rivieredurempart", "portlouis"],
  east: ["flacq", "grandport"],
  west: ["blackriver"],
  central: ["plainewilhems", "moka"],
  south: ["savanne"],
  rodrigues: ["rodrigues"],
};
