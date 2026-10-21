/**
 * `pnpm evals [nombre] [--sin-investigacion]`
 * Corre los 15 casos, los califica con el juez LLM y compara con el baseline.
 * Cuesta dinero (≈ $0.25–0.40 USD por caso con investigación): se corre a mano, no en CI.
 */
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const noResearch = args.includes("--sin-investigacion");
const name = args.find((a) => !a.startsWith("--")) ?? "actual";
const tsx = (script: string, rest: string[]) =>
  execFileSync("npx", ["tsx", "--tsconfig", "evals/tsconfig.json", script, ...rest], { stdio: "inherit" });

tsx("evals/run.ts", [name, ...(noResearch ? [] : ["--research"])]);
tsx("evals/judge.ts", [name]);
tsx("evals/compare.ts", [name]);
