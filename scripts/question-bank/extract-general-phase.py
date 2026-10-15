"""Extrai uma primeira fase no formato de 85 questoes adotado pela UECE."""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


SUBJECTS = [
    ("portuguese", "languages and codes", 1, 12, None),
    ("mathematics", "nature and mathematics", 13, 22, None),
    ("history", "human sciences", 23, 30, None),
    ("geography", "human sciences", 31, 38, None),
    ("physics", "nature and mathematics", 39, 46, None),
    ("chemistry", "nature and mathematics", 47, 54, None),
    ("biology", "nature and mathematics", 55, 62, None),
    ("physical-education", "languages and codes", 63, 67, None),
    ("philosophy", "human sciences", 68, 72, None),
    ("sociology", "human sciences", 73, 77, None),
    ("spanish", "languages and codes", 78, 85, "ESPANHOLA"),
    ("french", "languages and codes", 78, 85, "FRANCESA"),
    ("english", "languages and codes", 78, 85, "INGLESA"),
]

SUBJECTS_2020 = [
    ("portuguese", "languages and codes", 1, 12, None),
    ("mathematics", "nature and mathematics", 13, 22, None),
    ("history", "human sciences", 23, 30, None),
    ("geography", "human sciences", 31, 38, None),
    ("physics", "nature and mathematics", 39, 46, None),
    ("chemistry", "nature and mathematics", 47, 54, None),
    ("biology", "nature and mathematics", 55, 62, None),
    ("philosophy", "human sciences", 63, 67, None),
    ("sociology", "human sciences", 68, 72, None),
    ("spanish", "languages and codes", 73, 80, "ESPANHOLA"),
    ("french", "languages and codes", 73, 80, "FRANCESA"),
    ("english", "languages and codes", 73, 80, "INGLESA"),
]

SUBJECTS_2018 = [
    ("portuguese", "languages and codes", 1, 12, None),
    ("mathematics", "nature and mathematics", 13, 22, None),
    ("history", "human sciences", 23, 30, None),
    ("geography", "human sciences", 31, 38, None),
    ("physics", "nature and mathematics", 39, 46, None),
    ("chemistry", "nature and mathematics", 47, 54, None),
    ("biology", "nature and mathematics", 55, 62, None),
    ("spanish", "languages and codes", 63, 70, "ESPANHOLA"),
    ("french", "languages and codes", 63, 70, "FRANCESA"),
    ("english", "languages and codes", 63, 70, "INGLESA"),
]

SUBJECTS_2016 = [
    ("portuguese", "languages and codes", 1, 14, None),
    ("mathematics", "nature and mathematics", 15, 24, None),
    ("history", "human sciences", 25, 30, None),
    ("geography", "human sciences", 31, 36, None),
    ("physics", "nature and mathematics", 37, 42, None),
    ("chemistry", "nature and mathematics", 43, 48, None),
    ("biology", "nature and mathematics", 49, 54, None),
    ("spanish", "languages and codes", 55, 60, "ESPANHOLA"),
    ("french", "languages and codes", 55, 60, "FRANCESA"),
    ("english", "languages and codes", 55, 60, "INGLESA"),
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", required=True, type=Path)
    parser.add_argument("--answer-key", required=True, type=Path)
    parser.add_argument("--exam", required=True)
    parser.add_argument("--layout", default="85", choices=("60", "70", "80", "85"))
    parser.add_argument("--answer-status", default="OFFICIAL", choices=("PRELIMINARY", "OFFICIAL"))
    args = parser.parse_args()
    extractor = Path("scripts/question-bank/extract-paper.py")
    subjects = {"60": SUBJECTS_2016, "70": SUBJECTS_2018, "80": SUBJECTS_2020, "85": SUBJECTS}[args.layout]
    for subject, area, first, last, language in subjects:
        command = [
            sys.executable, str(extractor), "--pdf", str(args.pdf),
            "--answer-key", str(args.answer_key), "--exam", args.exam,
            "--phase", "1", "--subject", subject, "--area", area,
            "--first", str(first), "--last", str(last), "--booklet", "G1",
            "--points", "2",
            "--answer-status", args.answer_status,
        ]
        if language:
            command.extend(("--language", language))
        subprocess.run(command, check=True)
    print(f"Edicao {args.exam}, primeira fase: extracao concluida.")


if __name__ == "__main__":
    main()

