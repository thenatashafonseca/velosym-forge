import * as fs from "fs";
import { rules, Violation } from "./rules";

export interface FileResult {
  file: string;
  violations: Violation[];
}

const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

export function shouldScan(filePath: string): boolean {
  return EXTENSIONS.has(filePath.slice(filePath.lastIndexOf(".")));
}

export function scanFile(filePath: string): FileResult {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const violations: Violation[] = [];

  for (let i = 0; i < lines.length; i++) {
    for (const rule of rules) {
      const v = rule.check(lines[i], i + 1, lines);
      if (v) violations.push(v);
    }
  }

  return { file: filePath, violations };
}
