"""Executa em lote as provas individuais da segunda fase de uma edicao UECE."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=True, type=Path)
    args = parser.parse_args()
    config = json.loads(args.config.read_text(encoding="utf-8"))
    extractor = Path("scripts/question-bank/extract-paper.py")
    for paper in config["papers"]:
        first = str(paper.get("first", 1))
        last = str(paper.get("last", 20))
        command = [
            sys.executable, str(extractor),
            "--pdf", paper["pdf"], "--answer-key", config["answerKey"],
            "--exam", config["exam"], "--phase", "2",
            "--subject", paper["subject"], "--area", paper["area"],
            "--first", first, "--last", last, "--booklet", "G1", "--points", "3",
            "--answer-status", config.get("answerStatus", "OFFICIAL"),
        ]
        if "answerFirst" in paper:
            command.extend(["--answer-first", str(paper["answerFirst"])])
        if "numberOffset" in paper:
            command.extend(["--number-offset", str(paper["numberOffset"])])
        subprocess.run(command, check=True)
    print(f"Edicao {config['exam']}, segunda fase: {len(config['papers'])} provas individuais concluidas.")


if __name__ == "__main__":
    main()
