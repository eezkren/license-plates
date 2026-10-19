// Empties dist/ before a build, so a renamed or deleted module cannot ship stale.
import { rmSync } from "node:fs";
import { URL } from "node:url";

rmSync(new URL("../dist", import.meta.url), { recursive: true, force: true });
