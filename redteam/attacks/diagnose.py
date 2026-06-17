"""
Diagnostic — surfaces the real error behind PyRIT's generic wrapper.

Two stages:
  1. Direct httpx hit (no PyRIT) — proves env/auth/endpoint work
  2. Single PyRIT attempt with full traceback — exposes the real error

Run from redteam/harness/:
    python diagnose.py
"""

import asyncio
import traceback

import httpx

from runner import (
    COOKIE_HEADER,
    TARGET_HOST,
    TARGET_PATH,
    BENIGN_JOB_DESC,
    PAYLOAD_DIR,
    build_target,
    parse_sse_response,
)


def stage1_direct_httpx() -> bool:
    print("=" * 64)
    print(" STAGE 1: Direct httpx (no PyRIT)")
    print("=" * 64)

    payload = (PAYLOAD_DIR / "01_injection_basic.txt").read_text().strip()
    body = {
        "resumeText": payload,
        "resumeURL": "https://example.com/dummy.pdf",
        "jobDesc": BENIGN_JOB_DESC,
    }
    url = f"http://{TARGET_HOST}{TARGET_PATH}"
    headers = {"Cookie": COOKIE_HEADER, "Content-Type": "application/json"}

    print(f"POST {url}")
    print(f"Cookie length: {len(COOKIE_HEADER)} chars")
    print()

    try:
        with httpx.Client(timeout=180.0) as client:
            r = client.post(url, json=body, headers=headers)
    except httpx.ConnectError as e:
        print(f"✗ CONNECTION REFUSED — is `npm run dev` running on port 3000?")
        print(f"  {e}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {type(e).__name__}: {e}")
        traceback.print_exc()
        return False

    print(f"Status:        {r.status_code}")
    print(f"Content-Type:  {r.headers.get('content-type')}")
    print(f"Body length:   {len(r.text)} chars")
    print()
    print("--- Response body (first 1200 chars) ---")
    print(r.text[:1200])
    print("--- End ---")
    print()

    if r.status_code in (401, 403):
        print("✗ AUTH FAILED — cookie invalid/expired. Re-extract from DevTools.")
        return False
    if r.status_code != 200:
        print(f"✗ Endpoint reachable but rejected with {r.status_code}.")
        return False

    parsed = parse_sse_response(r.text)
    print("--- parse_sse_response output (first 400 chars) ---")
    print(parsed[:400])
    print("--- End ---")
    print()
    print("✓ Stage 1 passed — env is fine, the bug is in PyRIT integration.")
    return True


async def stage2_pyrit_single():
    print()
    print("=" * 64)
    print(" STAGE 2: Single PyRIT attempt with full traceback")
    print("=" * 64)

    from pyrit.memory import CentralMemory
    from pyrit.executor.attack import PromptSendingAttack

    payload = (PAYLOAD_DIR / "01_injection_basic.txt").read_text().strip()

    try:
        target = build_target()
        print(f"Target type: {type(target).__name__}")

        attack = PromptSendingAttack(objective_target=target)
        print(f"Attack type: {type(attack).__name__}")
        print()
        print(f"Executing with objective: {payload[:80]}...")
        print()

        result = await attack.execute_async(objective=payload)

        print(f"✓ Attack returned: {type(result).__name__}")
        print(f"  Result attrs: {[a for a in dir(result) if not a.startswith('_')]}")

        memory = CentralMemory.get_memory_instance()
        for attr in ("conversation_id", "conversationId", "id"):
            if hasattr(result, attr):
                conv_id = getattr(result, attr)
                print(f"  conv id via .{attr}: {conv_id}")
                pieces = memory.get_prompt_request_pieces(conversation_id=conv_id)
                print(f"  {len(pieces)} pieces in conversation:")
                for i, p in enumerate(pieces):
                    val = (p.converted_value or "")[:150]
                    print(f"    [{i}] role={p.role}  value={val!r}")
                break

    except Exception as e:
        print(f"✗ Failure: {type(e).__name__}: {e}")
        print()
        print("--- Full traceback ---")
        traceback.print_exc()
        print("--- End traceback ---")
        print()
        # Walk the cause chain
        cur = e
        depth = 0
        seen = {id(cur)}
        while depth < 6:
            nxt = cur.__cause__ or cur.__context__
            if nxt is None or id(nxt) in seen:
                break
            seen.add(id(nxt))
            cur = nxt
            depth += 1
            print(f"  Caused by [{depth}]: {type(cur).__name__}: {cur}")


async def main():
    if COOKIE_HEADER == "PASTE_FULL_COOKIE_HEADER_HERE":
        print("ERROR: set COOKIE_HEADER in runner.py first.")
        return

    if stage1_direct_httpx():
        await stage2_pyrit_single()
    else:
        print()
        print("Skipping Stage 2 — fix the environmental issue in Stage 1 first.")


if __name__ == "__main__":
    asyncio.run(main())
