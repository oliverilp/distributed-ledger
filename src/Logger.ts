import { Color } from "./domain/IConsoleItem";
import { uiAddConsoleLine } from "./UI";

export function logDebug(text: string) {
  uiAddConsoleLine(text);
}

export function logAddNewTransaction(amount: number) {
  uiAddConsoleLine(`Added new transaction with amount ${amount}₿.`, Color.Green);
}

export function logRejectdNewTransaction(amount: number) {
  uiAddConsoleLine(`Rejected transaction with amount ${amount}₿.`, Color.Red);
}

export function logMiningStarted() {
  uiAddConsoleLine(`Started mining.`);
}

export function logMiningFinished(millis: number) {
  uiAddConsoleLine(`Finished mining. Took ${millis / 1000} seconds.`);
}

export function logAddNewBlock(hash: string) {
  uiAddConsoleLine(`Added new block with hash ${hash.substring(0, 10)}.`, Color.Green);
}

export function logAddEmptyNewBlock(hash: string) {
  uiAddConsoleLine(`Added new empty block with hash ${hash.substring(0, 10)}.`, Color.Green);
}

export function logRejectNewBlock(hash: string) {
  uiAddConsoleLine(`Rejected new empty block with hash ${hash.substring(0, 10)}.`, Color.Red);
}
