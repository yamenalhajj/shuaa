"""Vercel Python function entrypoint — re-exports the FastAPI ASGI app.

Vercel's Python runtime looks for an `app` variable under `api/`; the
actual application code lives in `app/` (a separate, unrelated directory
name — this file just bridges the two).
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app  # noqa: E402,F401
