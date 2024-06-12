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
        class="w-full rounded-md p-2 text-woodsmoke-50 dark:text-woodsmoke-950 dark:bg-dove-200 bg-dove-800"
        id="info"
      >
        Info
      </button>
    </div>
  );
}

export function InfoDialog() {
  const [isOpen, { close }] = useInfoDialog();

  return (
    <div
      classList={{
        hidden: !isOpen.dialog_status,
        block: isOpen.dialog_status,
      }}
    >
      <div class="z-10 absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-black flex opacity-70"></div>
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
            <button
              onClick={() => {
                close();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="w-6 h-6"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
          <div class="flex flex-col space-y-2">
            <div class="flex flex-col">
              <div class="text-xl">What is Pitch?</div>
              <div class="text-md font-light">
                Pitch is a daily puzzle game where you have to find all of the
                colors that average up to another color.
              </div>
            </div>
            <div class="flex flex-col space-y-4">
              <div class="flex flex-col">
                <div class="text-xl">Tiles</div>
                <div class="font-light">
                  Once you select three tiles you can submit your answer. If any
                  are right they will become hollow. Keep going until all are
                  hollow.
                </div>
              </div>
              <div class="flex flex-col space-y-2">
                <ul class="flex space-x-8">
                  <li class="flex flex-col space-y-2 items-center">
                    <div class="h-20 w-20 border-8 border-woodsmoke-600 bg-woodsmoke-600 rounded-md"></div>
                    <div>Selected</div>
                  </li>
                  <li class="flex flex-col space-y-2 items-center">
                    <div class="h-20 w-20 border-8 border-woodsmoke-600 bg-woodsmoke-600 rounded-md shrink-lg"></div>
                    <div>Unselected</div>
                  </li>
                  <li class="flex flex-col space-y-2 items-center">
                    <div class="h-20 w-20 border-8 border-woodsmoke-600 rounded-md"></div>
                    <div>Correct</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
