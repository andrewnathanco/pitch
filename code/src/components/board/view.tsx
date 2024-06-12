import { mix } from "../../util/colors";
import { Game, useGame } from "../game/service";
import { useInfoDialog } from "../info/view";
import tone from "tone";

const midi = "bright_acoustic_piano-mp3";
const base = `https://github.com/gleitz/midi-js-soundfonts/raw/gh-pages/FatBoy/${midi}`;
const notes = ["A0", "C3", "D4", "D3", "B2", "F2", "E4", "C2", "G4"];
const audio = new Audio();

const playnote = (note: string) => {
  const endpoint = `${base}/${note}.mp3`;
  const audio = new Audio(endpoint);
  audio.play();
};

const playindividual = (note: string) => {
  audio.pause();
  const endpoint = `${base}/${note}.mp3`;
  audio.src = endpoint;
  audio.play();
};

export function Board() {
  return (
    <div class="flex flex-col space-y-4">
      <div class="grid grid-cols-4 gap-4">
        <div class="flex items-center justify-center">
          <Empty />
        </div>
        <div class="flex items-center justify-center h-20 w-20">
          <PlayButton />
        </div>
        <div class="flex items-center justify-center">
          <PlayButton />
        </div>
        <div class="flex items-center justify-center">
          <PlayButton />
        </div>

        <div class="flex items-center justify-center">
          <PlayButton />
        </div>
        <div class="flex items-center justify-center">
          <NoteTile />
        </div>
        <div class="flex items-center justify-center">
          <NoteTile />
        </div>
        <div class="flex items-center justify-center">
          <NoteTile />
        </div>

        <div class="flex items-center justify-center">
          <PlayButton />
        </div>
        <div class="flex items-center justify-center">
          <NoteTile />
        </div>
        <div class="flex items-center justify-center">
          <NoteTile />
        </div>
        <div class="flex items-center justify-center">
          <NoteTile />
        </div>

        <div class="flex items-center justify-center">
          <PlayButton />
        </div>
        <div class="flex items-center justify-center">
          <NoteTile />
        </div>
        <div class="flex items-center justify-center">
          <NoteTile />
        </div>
        <div class="flex items-center justify-center">
          <NoteTile />
        </div>
      </div>
      <div class="flex space-x-2">
        {notes.map((note) => {
          return (
            <button
              class="p-2 rounded-md bg-gray-600"
              onclick={() => {
                playindividual(note);
              }}
            >
              {note}
            </button>
          );
        })}
      </div>
      <SubmitButton />
    </div>
  );
}

function Empty() {
  return (
    <div class="p-2 h-20 w-20">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="transparent"
        class="size-6 bg-transparent"
      >
        <path
          fill-rule="evenodd"
          d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
  );
}

function NoteTile() {
  return <div class="h-20 w-20 bg-blue-300 rounded-md"></div>;
}

function PlayButton() {
  return (
    <button
      onclick={() => {
        notes.forEach(playnote);
      }}
      class="p-2 h-fit w-fit rounded-lg bg-stone-900"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="white"
        class="size-6 bg-transparent"
      >
        <path
          fill-rule="evenodd"
          d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  );
}

export function Buttons() {
  const [game, _] = useGame();

  const gameOver = () => !!game.guesses?.find((g) => g == game.numcorrect);

  return (
    <div class="flex flex-col space-y-2">
      {gameOver() ? <ShareButton /> : <SubmitButton />}
    </div>
  );
}

function getShare(game: Game) {
  const shareURL = `${import.meta.env.VITE_BASE_URL}`;

  let score = "";

  game.guesses.forEach((guess) => {
    switch (guess) {
      case 0:
        score += "🟥";
        break;
      case game.numcorrect:
        score += "🟩";
        break;
      default:
        score += "🟨";
        break;
    }
  });

  if (game.guesses.length > 5) {
    score = `Score: ${game.guesses.length}`;
  }

  return [`Pitch #${game.gamekey}\n${score}`, shareURL];
}

export function ShareButton() {
  const [game, _] = useGame();

  return (
    <div class="w-full">
      <button
        onClick={() => {
          const [text, url] = getShare(game);

          try {
            navigator?.share({
              text,
              url,
            });
          } catch {
            navigator?.clipboard?.writeText(`${text}\n${url}`);
          }
        }}
        class="w-full rounded-md p-4 text-woodsmoke-50 dark:text-woodsmoke-950 dark:bg-killarney-500 bg-killarney-600"
        id="submit"
      >
        Share
      </button>
    </div>
  );
}

export function SubmitButton() {
  const [game, setGame] = useGame();

  const canSubmit = () => game?.selected?.length == game.numcorrect;

  return (
    <div class="w-full">
      <button
        onClick={() => {}}
        classList={{
          "bg-dove-900 dark:bg-dove-100": canSubmit(),
          "bg-dove-500 dark:bg-dove-300": !canSubmit(),
        }}
        class="w-full rounded-md p-4 text-gray-100 dark:text-black"
        id="submit"
      >
        Submit
      </button>
    </div>
  );
}
