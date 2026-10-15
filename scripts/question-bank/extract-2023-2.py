"""Extrai a Prova de Conhecimentos Gerais completa da UECE 2023.2."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


BASE = Path("UECE/VESTIBULAR UECE_/1 PROVAS E GABARITOS/UECE 2023.2 - 1A FASE_")
EXTRACTOR = Path("scripts/question-bank/extract-paper.py")
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


def main() -> None:
    for subject, area, first, last, language in SUBJECTS:
        command = [
            sys.executable,
            str(EXTRACTOR),
            "--pdf", str(BASE / "vtb20232f1g1.pdf"),
            "--answer-key", str(BASE / "GABARITO.pdf"),
            "--exam", "2023.2",
            "--phase", "1",
            "--subject", subject,
            "--area", area,
            "--first", str(first),
            "--last", str(last),
            "--booklet", "G1",
            "--points", "2",
        ]
        if language:
            command.extend(("--language", language))
        subprocess.run(command, check=True)

    print("Edicao 2023.2, primeira fase: extracao concluida.")


if __name__ == "__main__":
    main()

