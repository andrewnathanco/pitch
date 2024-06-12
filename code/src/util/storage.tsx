import { Signal, createEffect, createSignal } from "solid-js";

export function createStoredSignal<T extends object>(
  name: string,
  init: T
): Signal<T> {
  const localState = localStorage.getItem(name);
  const signal = createSignal<T>(localState ? JSON.parse(localState) : init);
  createEffect(() => localStorage.setItem(name, JSON.stringify(signal[0]())));
  return signal;
}
