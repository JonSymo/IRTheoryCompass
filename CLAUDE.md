# IRtheorycompass

## Project Overview

IRtheorycompass is a web application that helps users explore, learn about, and compare International Relations (IR) theories such as realism, liberalism, constructivism, Marxism, feminism, the English School, and others. The app serves as an educational tool for students, researchers, and anyone interested in understanding how different IR theoretical frameworks explain world politics.

## Tech Stack

- **Language:** Python 3.12+
- **Web Framework:** TBD (Flask, Django, or FastAPI — to be decided based on project needs)
- **Frontend:** HTML/CSS/JS (templating or a separate frontend TBD)
- **Database:** TBD
- **Package Manager:** pip with requirements.txt or pyproject.toml

## Project Structure

```
IRtheorycompass/
├── CLAUDE.md
├── README.md
├── requirements.txt
├── src/
│   ├── __init__.py
│   ├── app.py          # Application entry point
│   ├── models/         # Data models for IR theories
│   ├── routes/         # Route handlers / API endpoints
│   ├── templates/      # HTML templates (if using server-side rendering)
│   ├── static/         # CSS, JS, images
│   └── utils/          # Shared utilities
├── tests/
│   ├── __init__.py
│   └── ...
└── data/               # Static data files (theory definitions, etc.)
```

## Build & Run Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run the development server
python src/app.py

# Run tests
pytest tests/
```

## Coding Conventions

- Follow PEP 8 for Python style
- Use type hints for function signatures
- Write docstrings for public modules, classes, and functions
- Keep functions focused and small
- Use snake_case for variables and functions, PascalCase for classes
- Prefer explicit imports over wildcard imports

## Testing

- Use pytest as the test runner
- Place tests in the `tests/` directory mirroring the `src/` structure
- Aim for tests on core logic (theory comparison, data retrieval, etc.)

## Key Domain Concepts

- **IR Theories:** The major schools of thought in International Relations (realism, liberalism, constructivism, etc.)
- **Theory Comparison:** Side-by-side analysis of how theories differ on key dimensions (state vs. non-state actors, cooperation vs. conflict, material vs. ideational factors)
- **Key Thinkers:** Scholars associated with each theory (e.g., Morgenthau, Keohane, Wendt)
- **Core Assumptions:** The foundational premises each theory holds about international politics
