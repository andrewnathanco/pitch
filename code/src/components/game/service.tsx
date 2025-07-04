import { makePersisted } from "@solid-primitives/storage";
import seedrandom from "seedrandom";
import { createContext, useContext } from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";
import { pitchOptions } from "../../util/pitches";

export interface Game {
  gamekey: number;
  pitches: string[];
  selectedPitch?: string;
  selectedBox?: number;
  revealedPitches: string[];
}

export function gamekey() {
  const now: Date = new Date();
  // starting date
  const specificDate: Date = new Date(2024, 4, 24, 0, 0, 0);
  const duration: number =
    (now.getTime() - specificDate.getTime()) / (1000 * 60 * 60 * 24);

  return Math.floor(duration);
}

export function today(gamekey: number): Game {
  const rng = seedrandom(gamekey.toString());

  const pitches = [];
  for (let i = 0; i < 9; i++) {
    const pitch = pitchOptions[Math.floor(rng() * pitchOptions.length)];
    pitches.push(pitch);
  }

  return {
    gamekey,
    pitches,
    revealedPitches: [],
  };
}

const GameContext = createContext<[Game, SetStoreFunction<Game>]>([
  {} as Game,
  () => {},
]);

export function GameProvider(props: any) {
  let value = makePersisted(createStore(today(gamekey())), {
    name: "pitch_game",
  });

  return (
    <GameContext.Provider value={value}>{props.children}</GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
