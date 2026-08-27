import random
import string
import threading
import time
from flask import Flask, request, jsonify

app = Flask(__name__)

PIN_LENGTH = 6
JAM_TTL_SECONDS = 60 * 60 * 6
GUEST_TTL_SECONDS = 30
CLEANUP_INTERVAL = 30

_lock = threading.RLock()
_jams = {}


def log(message):
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {message}", flush=True)


def _gen_pin():
    with _lock:
        while True:
            pin = "".join(random.choices(string.digits, k=PIN_LENGTH))
            if pin not in _jams:
                return pin


def _gen_token():
    return "".join(random.choices(string.ascii_letters + string.digits, k=32))


def _now():
    return time.time()


@app.after_request
def add_cors(resp):
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return resp


@app.route("/jam/create", methods=["OPTIONS"])
@app.route("/jam/<pin>/join", methods=["OPTIONS"])
@app.route("/jam/<pin>/leave", methods=["OPTIONS"])
@app.route("/jam/<pin>/state", methods=["OPTIONS"])
def preflight(pin=None):
    return jsonify({})


def _cleanup_loop():
    while True:
        time.sleep(CLEANUP_INTERVAL)
        now = _now()

        with _lock:
            dead = []

            for pin, jam in _jams.items():
                if now - jam["host_last_seen"] > JAM_TTL_SECONDS:
                    dead.append(pin)
                    continue

                stale = [
                    t for t, seen in jam["guests"].items()
                    if now - seen > GUEST_TTL_SECONDS
                ]

                for t in stale:
                    del jam["guests"][t]
                    log(f"[CLEANUP] Guest removed from jam {pin}")

            for pin in dead:
                del _jams[pin]
                log(f"[CLEANUP] Jam {pin} expired")

threading.Thread(target=_cleanup_loop, daemon=True).start()


@app.route("/jam/create", methods=["POST"])
def create_jam():
    token = _gen_token()

    with _lock:
        pin = _gen_pin()

        _jams[pin] = {
            "host_token": token,
            "created_at": _now(),
            "host_last_seen": _now(),
            "guests": {},
            "state": {
                "uri": None,
                "position_ms": 0,
                "is_playing": False,
                "updated_at": _now(),
            },
        }

    log(f"[CREATE] Jam created | PIN={pin}")

    return jsonify({
        "pin": pin,
        "token": token
    })


@app.route("/jam/<pin>/join", methods=["POST"])
def join_jam(pin):
    with _lock:
        jam = _jams.get(pin)

        if not jam:
            log(f"[JOIN] Failed | PIN={pin} | Jam not found")
            return jsonify({"error": "not_found"}), 404

        token = _gen_token()
        jam["guests"][token] = _now()

        guest_count = len(jam["guests"])

        log(
            f"[JOIN] Guest joined | PIN={pin} | "
            f"Guests={guest_count}"
        )

        return jsonify({
            "token": token,
            "state": jam["state"]
        })


@app.route("/jam/<pin>/leave", methods=["POST"])
def leave_jam(pin):
    body = request.get_json(silent=True) or {}
    token = body.get("token", "")

    with _lock:
        jam = _jams.get(pin)

        if not jam:
            log(f"[LEAVE] Jam already gone | PIN={pin}")
            return jsonify({"ok": True})

        if token == jam["host_token"]:
            del _jams[pin]

            log(f"[LEAVE] Host left | PIN={pin} | Jam ended")

            return jsonify({
                "ok": True,
                "ended": True
            })

        if token in jam["guests"]:
            jam["guests"].pop(token, None)

            log(
                f"[LEAVE] Guest left | PIN={pin} | "
                f"Guests={len(jam['guests'])}"
            )
        else:
            log(f"[LEAVE] Invalid token | PIN={pin}")

    return jsonify({"ok": True})


@app.route("/jam/<pin>/state", methods=["GET"])
def get_state(pin):
    token = request.args.get("token", "")

    with _lock:
        jam = _jams.get(pin)

        if not jam:
            log(f"[GET] Jam not found | PIN={pin}")
            return jsonify({"ended": True}), 404

        if token == jam["host_token"]:
            jam["host_last_seen"] = _now()
            client_type = "HOST"

        elif token in jam["guests"]:
            jam["guests"][token] = _now()
            client_type = "GUEST"

        else:
            log(f"[GET] Invalid token | PIN={pin}")
            return jsonify({"error": "invalid_token"}), 403

        state = jam["state"]

        log(
            f"[GET] {client_type} | PIN={pin} | "
            f"Track={state['uri']} | "
            f"Position={state['position_ms']}ms | "
            f"Playing={state['is_playing']} | "
            f"Guests={len(jam['guests'])}"
        )

        return jsonify({
            "ended": False,
            "server_time": _now(),
            "guest_count": len(jam["guests"]),
            "state": state,
        })


@app.route("/jam/<pin>/state", methods=["POST"])
def post_state(pin):
    body = request.get_json(silent=True) or {}
    token = body.get("token", "")

    with _lock:
        jam = _jams.get(pin)

        if not jam:
            log(f"[POST] Jam not found | PIN={pin}")
            return jsonify({"ended": True}), 404

        if token != jam["host_token"]:
            log(f"[POST] Forbidden state update | PIN={pin}")
            return jsonify({"error": "forbidden"}), 403

        jam["host_last_seen"] = _now()

        jam["state"] = {
            "uri": body.get("uri"),
            "position_ms": int(body.get("position_ms") or 0),
            "is_playing": bool(body.get("is_playing", False)),
            "updated_at": _now(),
        }

        state = jam["state"]

        log(
            f"[UPDATE] HOST state | PIN={pin} | "
            f"Track={state['uri']} | "
            f"Position={state['position_ms']}ms | "
            f"Playing={state['is_playing']} | "
            f"Guests={len(jam['guests'])}"
        )

        return jsonify({"ok": True})


if __name__ == "__main__":
    log("Listening on http://0.0.0.0:7429")

    app.run(
        host="0.0.0.0",
        port=7429,
        threaded=True
    )