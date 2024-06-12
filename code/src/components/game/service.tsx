import { makePersisted } from "@solid-primitives/storage";
import { createContext, useContext } from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";
import { options } from "../../util/colors";

export interface Game {
  gamekey: number;
  numcorrect: number;
  color: string;
  ingredients: string[];
  correct: string[];
  all: string[];
  selected: string[];
  guesses: number[];
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
  const numcorrect = 3;
  const noise = 0.8;
  const { base, correct, all } = options(gamekey, numcorrect, 16, noise);

  return {
    gamekey,
    guesses: [],
    correct: [],
    color: base,
    ingredients: correct,
    numcorrect,
    all,
    selected: [],
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
