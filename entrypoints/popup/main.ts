import {
  isFuriganaEnabled,
  setFuriganaEnabled,
} from "../../src/settings";
import "./style.css";

const enabledInput = document.querySelector<HTMLInputElement>("#enabled");

if (!enabledInput) {
  throw new Error("Missing enabled toggle");
}

enabledInput.checked = await isFuriganaEnabled();
enabledInput.addEventListener("change", () => {
  void setFuriganaEnabled(enabledInput.checked);
});
