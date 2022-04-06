import p5Types from "p5";

const inputKeys = ["w", "s", "a", "d"] as const;
type InputKeys = typeof inputKeys[number];

export const inputKeyMap: Record<InputKeys, boolean> = {
  w: false,
  s: false,
  a: false,
  d: false,
};

export const pressedEvent = (p5: p5Types) => {
  // check if p5.key is in inputKeyMap
  if (inputKeys.includes(p5.key as InputKeys)) {
    inputKeyMap[p5.key as InputKeys] = true;
  }
};

export const releasedEvent = (p5: p5Types) => {
  // check if p5.key is in inputKeyMap
  if (inputKeys.includes(p5.key as InputKeys)) {
    inputKeyMap[p5.key as InputKeys] = false;
  }
};
