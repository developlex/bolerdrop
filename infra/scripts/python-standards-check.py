#!/usr/bin/env python3
"""Minimal Python standards gate for first-party services.

Enforces a small set of non-negotiable safety/quality rules without external deps.
"""

from __future__ import annotations

import ast
import sys
from pathlib import Path


RULES = {
    "PY001": "Wildcard imports are forbidden.",
    "PY002": "Bare except is forbidden.",
    "PY003": "eval/exec is forbidden.",
    "PY004": "os.system is forbidden.",
    "PY005": "subprocess with shell=True is forbidden.",
}


def _iter_py_files(targets: list[str]) -> list[Path]:
    files: list[Path] = []
    for raw in targets:
        path = Path(raw)
        if not path.exists():
            raise FileNotFoundError(f"Target not found: {raw}")
        if path.is_file():
            if path.suffix == ".py":
                files.append(path)
            continue
        for p in path.rglob("*.py"):
            if "__pycache__" in p.parts:
                continue
            files.append(p)
    return sorted(files)


def _name_of(node: ast.AST) -> str | None:
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        base = _name_of(node.value)
        if base is None:
            return None
        return f"{base}.{node.attr}"
    return None


def _check_file(path: Path) -> list[str]:
    src = path.read_text(encoding="utf-8")
    try:
        tree = ast.parse(src, filename=str(path))
    except SyntaxError as exc:
        line = exc.lineno or 1
        return [f"{path}:{line}: PY000 Syntax error: {exc.msg}"]

    violations: list[str] = []

    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom):
            if any(alias.name == "*" for alias in node.names):
                violations.append(f"{path}:{node.lineno}: PY001 {RULES['PY001']}")

        if isinstance(node, ast.ExceptHandler):
            if node.type is None:
                violations.append(f"{path}:{node.lineno}: PY002 {RULES['PY002']}")

        if isinstance(node, ast.Call):
            call_name = _name_of(node.func)
            if call_name in {"eval", "exec"}:
                violations.append(f"{path}:{node.lineno}: PY003 {RULES['PY003']}")
            if call_name == "os.system":
                violations.append(f"{path}:{node.lineno}: PY004 {RULES['PY004']}")
            if call_name and call_name.startswith("subprocess."):
                for kw in node.keywords:
                    if kw.arg == "shell" and isinstance(kw.value, ast.Constant) and kw.value.value is True:
                        violations.append(f"{path}:{node.lineno}: PY005 {RULES['PY005']}")
                        break

    return violations


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("Usage: python3 infra/scripts/python-standards-check.py <path> [<path> ...]")
        return 2

    try:
        files = _iter_py_files(argv[1:])
    except FileNotFoundError as exc:
        print(str(exc))
        return 2

    if not files:
        print("No Python files found in provided targets.")
        return 0

    all_violations: list[str] = []
    for file in files:
        all_violations.extend(_check_file(file))

    if all_violations:
        print("Python standards check failed:")
        for violation in all_violations:
            print(f"- {violation}")
        return 1

    print(f"Python standards check passed for {len(files)} file(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
