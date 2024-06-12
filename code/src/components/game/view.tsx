import { createEffect, createSignal } from "solid-js";
import { gamekey, today, useGame } from "./service";

export function GameInfo() {
  const [game, setGame] = useGame();
  const [version, __] = createSignal<string>(
    import.meta.env.VITE_VERSION ?? "v0.1.0"
  );

  createEffect(() => {
    if (game.gamekey && game.gamekey != gamekey()) {
      localStorage.removeItem("pitch_game");
      setGame(today(gamekey()));
    }
  });

  return (
    <div class="flex flex-col">
      <div class="space-y-1">
        <div class="flex text-4xl space-x-2 items-center">
          <div>Pitch</div>
          <div>#{game.gamekey}</div>
          <div
            id="game-version"
            class="font-semibold w-min h-min dark:text-gray-200 text-xs border-2 px-1 dark:border-gray-200 rounded-lg border-black text-black"
          >
            {version()}
          </div>
        </div>
      </div>
      <div class="font-light">Let the music guide you.</div>
    </div>
  );
}
