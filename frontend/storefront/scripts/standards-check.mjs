import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const TARGET_DIRS = ["app", "src"];
const FILE_EXTENSIONS = new Set([".ts", ".tsx"]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      out.push(...walk(full));
      continue;
    }
    const dot = entry.lastIndexOf(".");
    const ext = dot >= 0 ? entry.slice(dot) : "";
    if (FILE_EXTENSIONS.has(ext)) {
      out.push(full);
    }
  }
  return out;
}

function findViolations(file, pattern, code) {
  const lines = code.split("\n");
  const matches = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (pattern.test(lines[i])) {
      matches.push({ line: i + 1, content: lines[i].trim() });
    }
  }
  return matches.map((m) => `${relative(ROOT, file)}:${m.line} -> ${m.content}`);
}

const rules = [
  {
    id: "no-explicit-any",
    message: "Avoid explicit any. Use typed contracts/interfaces.",
    pattern: /(^|[<(:,\s])any([>,)\s;=]|$)/
  },
  {
    id: "no-forward-ref-react19",
    message: "React 19 style: avoid forwardRef usage.",
    pattern: /\bforwardRef\s*\(/
  },
  {
    id: "no-use-context-react19",
    message: "React 19 style: prefer use(Context) over useContext(Context).",
    pattern: /\buseContext\s*\(/
  }
];

const files = TARGET_DIRS.flatMap((dir) => walk(join(ROOT, dir)));
const failures = [];

for (const file of files) {
  const code = readFileSync(file, "utf8");
  for (const rule of rules) {
    const hits = findViolations(file, rule.pattern, code);
    if (hits.length > 0) {
      failures.push({
        rule: rule.id,
        message: rule.message,
        hits
      });
    }
  }
}

if (failures.length > 0) {
  console.error("Storefront standards check failed:");
  for (const failure of failures) {
    console.error(`\n[${failure.rule}] ${failure.message}`);
    for (const hit of failure.hits) {
      console.error(`- ${hit}`);
    }
  }
  process.exit(1);
}

console.log("Storefront standards check passed.");
