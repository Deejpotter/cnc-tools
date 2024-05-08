export type BoxSize = {
  name: string;
  letter: string;
  length: number;
  width: number;
  height: number;
};

export const boxSizes: BoxSize[] = [
  {
    name: "Smallest box",
    letter: "A",
    length: 26,
    width: 17,
    height: 12,
  },
  {
    name: "Small standard box",
    letter: "B",
    length: 31,
    width: 25,
    height: 12,
  },
  {
    name: "Small square box",
    letter: "C",
    length: 30,
    width: 30,
    height: 20,
  },
  {
    name: "Old 500 box",
    letter: "D",
    length: 58,
    width: 25,
    height: 20,
  },
  {
    name: "Big square box",
    letter: "E",
    length: 44,
    width: 36,
    height: 25,
  },
  {
    name: "Aluminium plate box",
    letter: "F",
    length: 46,
    width: 35,
    height: 7,
  },
  {
    name: "3m box",
    letter: "G",
    length: 311,
    width: 17,
    height: 17,
  },
  {
    name: "Skinny 500 box",
    letter: "H",
    length: 64,
    width: 12,
    height: 12,
  },
  {
    name: "Fat 500 box",
    letter: "I",
    length: 64,
    width: 20,
    height: 20,
  },
  {
    name: "Skinny 1000 box",
    letter: "J",
    length: 117,
    width: 12,
    height: 12,
  },
  {
    name: "Fat 1000 box",
    letter: "K",
    length: 117,
    width: 20,
    height: 20,
  },
  {
    name: "Skinny 1500 box",
    letter: "L",
    length: 168,
    width: 12,
    height: 12,
  },
  {
    name: "Fat 1500 box",
    letter: "M",
    length: 168,
    width: 20,
    height: 20,
  },
];

export default boxSizes;