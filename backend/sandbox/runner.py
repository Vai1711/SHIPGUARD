"""Subprocess test runner — executes pytest in an isolated subprocess,
captures stdout, stderr, and exit codes. Zero LLM interpretation.
"""

from __future__ import annotations

import subprocess
import sys
import time
from typing import Any, Dict


def run_pytest(
    test_path: str,
    cwd: str | None = None,
    timeout: float = 30.0,
) -> Dict[str, Any]:
    """Run a single pytest file in a subprocess.

    Returns:
        dict with keys: exit_code, stdout, stderr, duration_ms
    """
    start = time.monotonic()

    try:
        proc = subprocess.run(
            [
                sys.executable,
                "-m",
                "pytest",
                test_path,
                "-x",
                "-v",
                "--tb=short",
                "--no-header",
                "-q",
            ],
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=cwd,
        )

        duration_ms = (time.monotonic() - start) * 1000

        return {
            "exit_code": proc.returncode,
            "stdout": proc.stdout,
            "stderr": proc.stderr,
            "duration_ms": round(duration_ms, 2),
        }

    except subprocess.TimeoutExpired:
        duration_ms = (time.monotonic() - start) * 1000
        return {
            "exit_code": -1,
            "stdout": "",
            "stderr": f"TIMEOUT: pytest exceeded {timeout}s limit",
            "duration_ms": round(duration_ms, 2),
        }

    except FileNotFoundError:
        return {
            "exit_code": -2,
            "stdout": "",
            "stderr": f"Python interpreter not found: {sys.executable}",
            "duration_ms": 0,
        }

    except Exception as exc:
        duration_ms = (time.monotonic() - start) * 1000
        return {
            "exit_code": -3,
            "stdout": "",
            "stderr": f"Runner error: {exc}",
            "duration_ms": round(duration_ms, 2),
        }


def run_script(script_path: str, cwd: str | None = None, timeout: float = 10.0) -> Dict[str, Any]:
    """Run a standalone Python script and capture its output."""
    start = time.monotonic()

    try:
        proc = subprocess.run(
            [sys.executable, script_path],
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=cwd,
        )
        duration_ms = (time.monotonic() - start) * 1000

        return {
            "exit_code": proc.returncode,
            "stdout": proc.stdout,
            "stderr": proc.stderr,
            "duration_ms": round(duration_ms, 2),
        }

    except subprocess.TimeoutExpired:
        duration_ms = (time.monotonic() - start) * 1000
        return {
            "exit_code": -1,
            "stdout": "",
            "stderr": f"TIMEOUT: script exceeded {timeout}s",
            "duration_ms": round(duration_ms, 2),
        }

    except Exception as exc:
        duration_ms = (time.monotonic() - start) * 1000
        return {
            "exit_code": -3,
            "stdout": "",
            "stderr": str(exc),
            "duration_ms": round(duration_ms, 2),
        }
