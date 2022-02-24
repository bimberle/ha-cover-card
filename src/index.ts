import { HaCoverCard } from "./custom-element/ha-cover-card";
import { printVersion } from "./utils";

// Registering card
customElements.define("ha-cover-card", HaCoverCard);

printVersion();