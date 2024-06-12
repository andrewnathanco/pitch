import seedrandom, { PRNG } from "seedrandom";

function shuffle(rng: PRNG, array: any[]): any[] {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(rng() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

function hexToRgb(hex: string): RGBColor {
  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, "");

  // Parse the r, g, b values
  let bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;

  return { r, g, b };
}

function rgbToHex(color: RGBColor): string {
  const { r, g, b } = color;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}

function randomPart(
  rng: PRNG,
  num: number,
  noise: number,
  dir: number | null = null
): number {
  // minimum avaiable choise from the number
  let min = Math.max(num - noise, 0);

  // maximum avaiable choise from the number
  let max = Math.min(num + noise, 255);

  // go above
  let rangebottom = min;
  let rangetop = max;
  if (dir == 0) {
    // range bottom
    rangebottom = min;
    rangetop = num;
  }

  if (dir == 1) {
    rangebottom = num;
    rangetop = max;
  }

  let opts = rangetop - rangebottom;
  let ans = Math.floor(rng() * opts + rangebottom);
  return ans;
}

interface ColorData {
  key: "r" | "g" | "b";
  num: number;
  total: number;
  diff: number;
}

function getColorData(
  num: number,
  numColors: number,
  noise: number,
  key: "r" | "g" | "b"
): ColorData {
  let total = num * numColors;
  // we either
  // since we can only have number between 0 and 255 we need to see
  // which of those has the shortest diff and use that one
  let diff = Math.min(Math.min(Math.abs(255 - num), Math.abs(num)), noise);

  return {
    key,
    num,
    total,
    diff,
  };
}

function calculateLast(colorData: ColorData, colorParts: number[]): number {
  const last =
    colorData.total - Math.floor(colorParts.reduce((acc, prev) => acc + prev));
  return last;
}

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

function divide(
  rng: PRNG,
  hexColor: string,
  numColors: number,
  noise: number = 255
): string[] {
  let { r, g, b } = hexToRgb(hexColor);

  let minOffset = noise;

  let rData = getColorData(r, numColors, minOffset, "r");
  let gData = getColorData(g, numColors, minOffset, "g");
  let bData = getColorData(b, numColors, minOffset, "b");

  let colors: RGBColor[] = [];

  // let's populate the first n - 1 with random colors within an acceptable average range
  for (let i = 0; i < numColors - 1; i++) {
    let dir = i % 2;
    let color: RGBColor = { r: 0, g: 0, b: 0 };
    for (let datum of [rData, gData, bData]) {
      // get options for each data (we need to calculate the last one)
      color[datum.key] = Math.floor(
        randomPart(rng, datum.num, datum.diff, dir)
      );
    }

    colors.push(color);
  }

  // let's calculate the last color
  const lastColor: RGBColor = { r: 0, g: 0, b: 0 };
  for (let datum of [rData, gData, bData]) {
    // get the last value
    const last = calculateLast(
      datum,
      colors.map((color) => color[datum.key])
    );

    // add that to the parts for this color
    lastColor[datum.key] = last;
  }

  colors.push(lastColor);
  return colors.map((color) => rgbToHex(color));
}

function mix(hexColors: string[]): string {
  let totalR = 0,
    totalG = 0,
    totalB = 0;
  let count = hexColors.length;

  for (let hex of hexColors) {
    let { r, g, b } = hexToRgb(hex);
    totalR += r;
    totalG += g;
    totalB += b;
  }

  let avgR = Math.round(totalR / count);
  let avgG = Math.round(totalG / count);
  let avgB = Math.round(totalB / count);

  return rgbToHex({ r: avgR, g: avgG, b: avgB });
}

function randomColor(rng: PRNG, shrink: number): string {
  let rangetop = 255 - shrink;
  let rangebottom = 0 + shrink;
  let opts = rangetop - rangebottom;

  let r = Math.floor(rangebottom + rng() * opts);
  let b = Math.floor(rangebottom + rng() * opts);
  let g = Math.floor(rangebottom + rng() * opts);

  return rgbToHex({
    r,
    g,
    b,
  });
}

export interface GameData {
  base: string;
  correct: string[];
  all: string[];
}

function options(
  gameKey: number,
  numCorrect: number,
  total: number,
  noise: number = 1,
  variance: number = 100
): GameData {
  noise = Math.ceil(noise * 255);

  const rng = seedrandom(gameKey.toString());
  const todayColor = randomColor(rng, variance);

  const colOpt: ("r" | "g" | "b")[] = ["r", "g", "b"];
  const options: string[] = [];
  const correctColors = divide(rng, todayColor, numCorrect);
  const all = [...correctColors];

  // let's create the other groups by giving a bit of noise to the correctColors
  for (let i = 0; i < 4; i++) {
    let colors = divide(rng, todayColor, numCorrect);

    colors.forEach((item) => {
      let itemRGB = hexToRgb(item);

      itemRGB.r = randomPart(rng, itemRGB.r, noise);
      itemRGB.g = randomPart(rng, itemRGB.g, noise);
      itemRGB.b = randomPart(rng, itemRGB.b, noise);

      item = rgbToHex(itemRGB);
    });

    all.push(...colors);
  }

  const amountLeft = total - all.length;
  for (let i = 0; i < amountLeft; i++) {
    const randomPick = Math.floor(rng() * correctColors.length);
    const baseColor = correctColors[randomPick];
    const baseRgb = hexToRgb(baseColor);
    const newColor: RGBColor = { r: 0, g: 0, b: 0 };
    for (let col of colOpt) {
      newColor[col] = Math.min(
        Math.floor(rng() * noise) + Math.min(baseRgb[col], 255),
        255
      );
    }

    all.push(rgbToHex(newColor));
  }

  return {
    base: todayColor,
    correct: correctColors,
    all: shuffle(rng, all),
  };
}

export { mix, divide, options, randomColor };
