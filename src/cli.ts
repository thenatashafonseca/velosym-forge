#!/usr/bin/env node
import { program } from "commander";
import { glob } from "glob";
import { scanFile, shouldScan, fixFile, FileResult } from "./engine";

program
  .name("velosym-forge")
  .description("Anti-Slop Linter — enforces brutalist code standards")
  .version("0.1.0")
  .argument("[paths...]", "Files or glob patterns to scan", ["src/**/*"])
  .option("--fix", "Auto-fix: strip redundant comments, slop markers, and dead code")
  .option("--no-fail", "Do not exit with code 1 on violations")
  .action(async (paths: string[], opts) => {
    const files: string[] = [];
    for (const p of paths) {
      const matched = await glob(p, { nodir: true });
      files.push(...matched);
    }

    const scannable = files.filter(shouldScan);
    if (scannable.length === 0) {
      console.log("No scannable files found.");
      process.exit(0);
    }

    if (opts.fix) {
      let totalFixed = 0;
      for (const f of scannable) {
        const { fixed } = fixFile(f);
        if (fixed > 0) {
          console.log(`🔧 ${f}: removed ${fixed} line(s)`);
          totalFixed += fixed;
        }
      }
      console.log(`\n${totalFixed === 0 ? "✅ Nothing to fix" : `🔧 Fixed ${totalFixed} line(s)`} across ${scannable.length} file(s).`);
      process.exit(0);
    }

    let totalViolations = 0;
    const results: FileResult[] = [];

    for (const f of scannable) {
      const result = scanFile(f);
      if (result.violations.length > 0) {
        results.push(result);
        totalViolations += result.violations.length;
      }
    }

    for (const r of results) {
      console.log(`\n📄 ${r.file}`);
      for (const v of r.violations) {
        console.log(`  L${v.line} [${v.rule}]${v.fixable ? " (fixable)" : ""} ${v.message}`);
        console.log(`    > ${v.text}`);
      }
    }

    console.log(`\n${totalViolations === 0 ? "✅ Clean" : `❌ ${totalViolations} violation(s)`} across ${scannable.length} file(s).`);

    if (totalViolations > 0 && opts.fail !== false) {
      process.exit(1);
    }
  });

program.parse();
