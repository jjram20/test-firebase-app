from flask import Flask, jsonify, request
import os
import requests

app = Flask(__name__)

PISTON_URL = os.environ.get(
    "PISTON_URL",
    "http://10.10.1.2:2000/api/v2/execute",
)

ALLOWED_LANGUAGES = {
    "python",
    "javascript",
    "typescript",
}

MAX_CODE_SIZE = 10_000
MAX_FILES = 1
REQUEST_TIMEOUT = 15


@app.get("/")
def health():
    return jsonify({
        "status": "ok",
        "piston_url_configured": bool(PISTON_URL),
    })


@app.post("/")
def execute():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    language = data.get("language")
    files = data.get("files")

    if not language:
        return jsonify({"error": "Missing field: language"}), 400

    if language not in ALLOWED_LANGUAGES:
        return jsonify({
            "error": f"Language not allowed: {language}",
        }), 400

    if not isinstance(files, list) or not files:
        return jsonify({"error": "Missing or invalid field: files"}), 400

    if len(files) > MAX_FILES:
        return jsonify({
            "error": f"Only {MAX_FILES} file is allowed",
        }), 400

    total_size = sum(
        len(str(file.get("content", "")).encode("utf-8"))
        for file in files
        if isinstance(file, dict)
    )

    if total_size > MAX_CODE_SIZE:
        return jsonify({
            "error": f"Code exceeds the {MAX_CODE_SIZE}-byte limit",
        }), 413

    payload = {
        "language": language,
        "version": data.get("version", "*"),
        "files": files,
        "stdin": data.get("stdin", ""),
        "args": data.get("args", []),
        "compile_timeout": data.get("compile_timeout", 10_000),
        "run_timeout": data.get("run_timeout", 3_000),
        "compile_memory_limit": data.get(
            "compile_memory_limit",
            256_000_000,
        ),
        "run_memory_limit": data.get(
            "run_memory_limit",
            256_000_000,
        ),
    }

    try:
        response = requests.post(
            PISTON_URL,
            json=payload,
            timeout=REQUEST_TIMEOUT,
        )

        return (
            response.content,
            response.status_code,
            {
                "Content-Type": response.headers.get(
                    "Content-Type",
                    "application/json",
                ),
            },
        )

    except requests.Timeout:
        return jsonify({
            "error": "Piston execution timed out",
        }), 504

    except requests.ConnectionError:
        return jsonify({
            "error": "Piston service is unavailable",
        }), 503

    except requests.RequestException as error:
        app.logger.exception("Error calling Piston")

        return jsonify({
            "error": "Unable to execute code",
            "detail": str(error),
        }), 502


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    app.run(host="0.0.0.0", port=port)