import { Accessor, createSignal } from "solid-js";
import { Game, useGame } from "../game/service";
import Pause from "lucide-solid/icons/pause";
import Play from "lucide-solid/icons/play";
import LoaderCircle from "lucide-solid/icons/loader-circle";
import { playIndividual } from "../../util/pitches";
import { playNote } from "../../util/pitches";
import { shuffle } from "../../util/random";
import Check from "lucide-solid/icons/check";

export enum PlayButtonType {
  firstRow,
  secondRow,
  thirdRow,
  firstCol,
  secondCol,
  thirdCol,
}

function getNotes(type: PlayButtonType, pitches: string[]) {
  switch (type) {
    case PlayButtonType.firstCol:
      return pitches.filter((_, i) => i % 3 === 0);
    case PlayButtonType.secondCol:
      return pitches.filter((_, i) => i % 3 === 1);
    case PlayButtonType.thirdCol:
      return pitches.filter((_, i) => i % 3 === 2);
    case PlayButtonType.firstRow:
      return pitches.filter((_, i) => i < 3);
    case PlayButtonType.secondRow:
      return pitches.filter((_, i) => i >= 3 && i < 6);
    case PlayButtonType.thirdRow:
      return pitches.filter((_, i) => i >= 6);
  }
}

function isRow(type: PlayButtonType) {
  return (
    type === PlayButtonType.firstRow ||
    type === PlayButtonType.secondRow ||
    type === PlayButtonType.thirdRow
  );
}

function isCol(type: PlayButtonType) {
  return (
    type === PlayButtonType.firstCol ||
    type === PlayButtonType.secondCol ||
    type === PlayButtonType.thirdCol
  );
}

function isPlaying(type: PlayButtonType, index: number) {
  if (type === PlayButtonType.firstCol) {
    return index % 3 === 0;
  }

  if (type === PlayButtonType.secondCol) {
    return index % 3 === 1;
  }

  if (type === PlayButtonType.thirdCol) {
    return index % 3 === 2;
  }

  if (type === PlayButtonType.firstRow) {
    return index < 3;
  }

  if (type === PlayButtonType.secondRow) {
    return index >= 3 && index < 6;
  }

  if (type === PlayButtonType.thirdRow) {
    return index >= 6;
  }

  return false;
}

export function Board() {
  const [game, _] = useGame();

  const [playing, setPlaying] = createSignal(false);
  const [playingType, setPlayingType] = createSignal(PlayButtonType.firstCol);

  const tiles = [
    <div />,
    <PlayButton
      type={PlayButtonType.firstCol}
      setPlaying={setPlaying}
      setPlayingType={setPlayingType}
    />,
    <PlayButton
      type={PlayButtonType.secondCol}
      setPlaying={setPlaying}
      setPlayingType={setPlayingType}
    />,
    <PlayButton
      type={PlayButtonType.thirdCol}
      setPlaying={setPlaying}
      setPlayingType={setPlayingType}
    />,
    <PlayButton
      type={PlayButtonType.firstRow}
      setPlaying={setPlaying}
      setPlayingType={setPlayingType}
    />,
    ...game.pitches
      .filter((_, i) => i < 3)
      .map((note) => (
        <NoteTile note={note} playing={playing} playingType={playingType} />
      )),
    <PlayButton
      type={PlayButtonType.secondRow}
      setPlaying={setPlaying}
      setPlayingType={setPlayingType}
    />,
    ...game.pitches
      .filter((_, i) => i >= 3 && i < 6)
      .map((note) => (
        <NoteTile note={note} playing={playing} playingType={playingType} />
      )),
    <PlayButton
      type={PlayButtonType.thirdRow}
      setPlaying={setPlaying}
      setPlayingType={setPlayingType}
    />,
    ...game.pitches
      .filter((_, i) => i >= 6)
      .map((note) => (
        <NoteTile note={note} playing={playing} playingType={playingType} />
      )),
    <div />,
  ];

  return (
    <div class="flex flex-col space-y-4">
      <div class="grid grid-cols-4 grid-rows-4 gap-2 justify-center items-center content-stretch">
        {tiles}
      </div>
      <div class="flex flex-wrap gap-2 justify-center">
        {shuffle(game.pitches).map((note) => (
          <NoteButton note={note} />
        ))}
      </div>
      <Buttons />
    </div>
  );
}

function NoteButton(props: { note: string }) {
  const [game, setGame] = useGame();

  const correct = () => game.revealedPitches.includes(props.note);

  return (
    <button
      class="p-2 h-fit w-fit rounded-lg flex items-center justify-center border-2 transition-all duration-300 gap-2"
      onclick={() => {
        playIndividual(props.note);
        setGame({
          ...game,
          selectedPitch: props.note,
        });
      }}
      disabled={correct()}
      classList={{
        "border-stone-600 bg-stone-300": game.selectedPitch == props.note,
        "border-stone-400": game.selectedPitch != props.note,
        "opacity-50": correct(),
      }}
    >
      {correct() ? <Check class="size-6 bg-transparent" /> : ""}
      {props.note}
    </button>
  );
}

function NoteTile(props: {
  note: string;
  playing: Accessor<boolean>;
  playingType: Accessor<PlayButtonType>;
}) {
  const [game, setGame] = useGame();
  const index = game.pitches.indexOf(props.note);

  return (
    <button
      classList={{
        "opacity-50": game.revealedPitches.includes(props.note),
        "bg-stone-500": game.selectedBox == index,
        "border-2 border-stone-500":
          props.playing() && isPlaying(props.playingType(), index),
      }}
      disabled={game.revealedPitches.includes(props.note)}
      onclick={() => {
        setGame({
          ...game,
          selectedBox: index,
        });
      }}
      class="h-20 w-20 rounded-md bg-stone-300 transition-all duration-300 flex items-center justify-center"
    >
      {game.revealedPitches.includes(props.note) ? (
        <div class="flex items-center justify-center gap-2 bg-transparent">
          <Check class="size-6 bg-transparent" />
          {props.note}
        </div>
      ) : (
        <></>
      )}
    </button>
  );
}

function PlayButton(props: {
  type: PlayButtonType;
  setPlaying: (playing: boolean) => void;
  setPlayingType: (playingType: PlayButtonType) => void;
}) {
  const [game, _] = useGame();
  const [localPlaying, setLocalPlaying] = createSignal(false);

  return (
    <button
      onclick={() => {
        getNotes(props.type, game.pitches).forEach((note) => {
          playNote(note);
        });

        props.setPlaying(true);
        setLocalPlaying(true);
        props.setPlayingType(props.type);

        setTimeout(() => {
          props.setPlaying(false);
          setLocalPlaying(false);
          props.setPlayingType(PlayButtonType.firstCol);
        }, 2000);
      }}
      class="p-2 rounded-lg flex items-center justify-center transition-all duration-300 stroke-stone-500"
    >
      {localPlaying() ? (
        <LoaderCircle class="animate-spin size-6 bg-transparent" />
      ) : (
        <Play class="size-6 bg-transparent" />
      )}
    </button>
  );
}

export function Buttons() {
  const [game, _] = useGame();
  const gameOver = () => game.revealedPitches.length === game.pitches.length;
  const inProgress = () =>
    game.revealedPitches.length < game.pitches.length &&
    game.revealedPitches.length > 0;

  return (
    <div class="flex flex-col space-y-2">
      {gameOver() ? <ShareButton /> : <SubmitButton />}
    </div>
  );
}

function RetryButton() {
  const [game, setGame] = useGame();

  return (
    <button
      class="w-full rounded-md p-4 bg-dove-500 dark:bg-dove-300"
      onclick={() => {
        setGame({
          ...game,
          revealedPitches: [],
          selectedPitch: undefined,
          selectedBox: undefined,
        });
      }}
    >
      Retry
    </button>
  );
}

function getShare(game: Game) {
  const shareURL = `${import.meta.env.VITE_BASE_URL}`;

  let score = "";

  game.pitches.forEach((guess) => {
    switch (guess) {
      case "B":
        score += "🟥";
        break;
      case "A":
        score += "🟩";
        break;
      default:
        score += "🟨";
        break;
    }
  });

  if (game.pitches.length > 5) {
    score = `Score: ${game.pitches.length}`;
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
      >
        Share
      </button>
    </div>
  );
}

export function SubmitButton() {
  const [game, setGame] = useGame();
  const [correct, setCorrect] = createSignal(false);

  const canSubmit = () =>
    game.selectedPitch !== undefined && game.selectedBox !== undefined;

  return (
    <div class="w-full">
      <button
        onClick={() => {
          // annoying but needed for type safety
          if (canSubmit() && game.selectedPitch) {
            const index = game.pitches.indexOf(game.selectedPitch);
            if (index !== game.selectedBox) {
              setCorrect(false);
              return;
            }

            setGame({
              ...game,
              revealedPitches: [
                ...(game?.revealedPitches || []),
                game.selectedPitch,
              ],
              selectedPitch: undefined,
              selectedBox: undefined,
            });
          }
        }}
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
