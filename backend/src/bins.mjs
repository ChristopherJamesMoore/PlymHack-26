export const BIN_MAP = {
  plastic: "Plastic recycling",
  glass: "Glass recycling",
  metal: "Metal recycling",
  paper: "Paper recycling",
  cardboard: "Cardboard recycling",
  general_waste: "General waste"
};

export function mapToBin(label) {
  return BIN_MAP[label] ?? "General waste";
}
