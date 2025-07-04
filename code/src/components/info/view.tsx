import { makePersisted } from "@solid-primitives/storage";
import {
  Accessor,
  createContext,
  createEffect,
  createSignal,
  useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
import { useGame } from "../game/service";
import Info from "lucide-solid/icons/info";
import X from "lucide-solid/icons/x";
import RotateCcw from "lucide-solid/icons/rotate-ccw";

interface InfoDialogData {
  dialog_status: boolean;
}

type InfoDialog = [
  InfoDialogData,
  {
    close: () => void;
    open: () => void;
  }
];

const InfoDialogContext = createContext<InfoDialog>();

export function InfoDialogProvider(props: { children: any }) {
  let [dialog_data, set_dialog] = makePersisted(
    createStore<InfoDialogData>({ dialog_status: true }),
    {
      name: "pitch_info-dialog",
    }
  );

  const dialog: InfoDialog = [
    dialog_data,
    {
      close() {
        set_dialog("dialog_status", false);
        document.body.style.overflowY = "auto";
      },
      open() {
        set_dialog("dialog_status", true);
        document.body.style.position = "relative";
        document.body.style.overflowY = "hidden";
      },
    },
  ];

  return (
    <InfoDialogContext.Provider value={dialog}>
      {props.children}
    </InfoDialogContext.Provider>
  );
}

export function useInfoDialog(): InfoDialog {
  return useContext(InfoDialogContext) as InfoDialog;
}

export function InfoButton() {
  const [game, _] = useGame();
  const [__, { open }] = useInfoDialog();

  return (
    <div class="w-full">
      <button
        onClick={() => {
          open();
        }}
        class="w-full rounded-md p-2 flex items-center justify-center"
        id="info"
      >
        <Info class="size-6 bg-transparent" />
      </button>
    </div>
  );
}

export function InfoDialog() {
  const [isOpen, { close }] = useInfoDialog();
  const [game, setGame] = useGame();

  return (
    <div
      classList={{
        hidden: !isOpen.dialog_status,
        block: isOpen.dialog_status,
      }}
    >
      <div class="z-10 absolute top-0 left-0 right-0 bottom-0 h-screen justify-center items-center bg-black flex opacity-70"></div>
      <div class="z-20 absolute top-0 left-0 right-0 rounded-lg md:mx-auto m-4 md:w-96">
        <div
          id="dialog-content"
          class="p-8 flex flex-col space-y-2 w-full rounded-lg"
        >
          <div
            id="dialog-header"
            class="flex justify-between items-center text-3xl w-full"
          >
            <div>Pitch</div>
            <div class="flex gap-2">
              <IconButton
                icon={RotateCcw}
                onClick={() => {
                  setGame({
                    ...game,
                    revealedPitches: [],
                    selectedPitch: undefined,
                    selectedBox: undefined,
                  });
                  close();
                }}
              />
              <IconButton icon={X} onClick={close} />
            </div>
          </div>
          <div class="flex flex-col space-y-2">
            <div class="flex flex-col">
              <div class="text-xl">What is Pitch?</div>
              <div class="text-md font-light">
                Pitch is a daily puzzle game where you have to match the
                pitches.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconButton(props: { icon: any; onClick: () => void }) {
  return (
    <button onClick={props.onClick}>
      <props.icon class="size-6 bg-transparent" />
    </button>
  );
}
