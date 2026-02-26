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

export function fixFile(filePath: string): { fixed: number } {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const result = scanFile(filePath);
  const fixableLines = new Set(
    result.violations.filter((v) => v.fixable).map((v) => v.line)
  );

  if (fixableLines.size === 0) return { fixed: 0 };

  // Remove fixable lines, then collapse consecutive blank lines
  const filtered = lines.filter((_, i) => !fixableLines.has(i + 1));
  const collapsed: string[] = [];
  for (const line of filtered) {
    if (line.trim() === "" && collapsed.length > 0 && collapsed[collapsed.length - 1].trim() === "") {
      continue;
    }
    collapsed.push(line);
  }

  fs.writeFileSync(filePath, collapsed.join("\n"), "utf-8");
  return { fixed: fixableLines.size };
}
