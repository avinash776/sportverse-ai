# ==================================================
# SportVerse AI - Gemini LLM Client
# ==================================================
# Centralized wrapper around Google's Gemini API.
# Every AI response in the system flows through here.
# Includes automatic retry with back-off for rate limits.
# ==================================================

import os, json, re, time
from google import genai

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not set in environment variables!")

# Initialise the client once at module level
_client = genai.Client(api_key=GEMINI_API_KEY)

# Model preference order – will try each until one succeeds
MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-lite",
]

MAX_RETRIES = 3
RETRY_DELAY = 16  # seconds between retries


def ask_gemini(prompt: str, *, temperature: float = 0.8, max_tokens: int = 8192) -> str:
    """Send a prompt to Gemini and return the raw text response.
    Retries on rate-limit (429) errors with back-off."""
    last_err = None
    for model in MODELS:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                response = _client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config={
                        "temperature": temperature,
                        "max_output_tokens": max_tokens,
                    },
                )
                return response.text
            except Exception as e:
                last_err = e
                err_str = str(e)
                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                    wait = RETRY_DELAY * attempt
                    print(f"⏳ Rate limited on {model} (attempt {attempt}/{MAX_RETRIES}), retrying in {wait}s…")
                    time.sleep(wait)
                else:
                    raise
        # If all retries exhausted for this model, try next model
        print(f"⚠️  All retries exhausted for {model}, trying next model…")
    raise last_err  # type: ignore


def ask_gemini_json(prompt: str, *, temperature: float = 0.4, max_tokens: int = 8192) -> dict:
    """
    Send a prompt that expects a JSON response.
    Strips markdown fences and parses the result.
    Falls back to wrapping raw text on parse failure.
    """
    raw = ask_gemini(prompt, temperature=temperature, max_tokens=max_tokens)

    # Strip ```json ... ``` fences that Gemini sometimes adds
    cleaned = raw.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # If it still fails, try to find the first { ... } block
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        # Last resort – return the text wrapped
        return {"raw_response": raw}
