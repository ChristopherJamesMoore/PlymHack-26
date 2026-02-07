export const BIN_MAP = {
  bottle: "Plastic recycling",
  cup: "Plastic recycling",
  wine_glass: "Glass recycling",
  can: "Metal recycling",
  book: "Paper recycling",
  box: "Cardboard",
  paper: "Paper recycling"
};

export function mapToBin(label) {
  return BIN_MAP[label] ?? "General waste";
}
