import subprocess
import time
import sys
import os

def main():
    print("=" * 65)
    print("🚀 STARTING AI CAREER + FINANCE COPILOT (FULL STACK SYSTEM)")
    print("=" * 65)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(base_dir, "backend")
    frontend_dir = os.path.join(base_dir, "frontend")

    # 1. Start FastAPI Backend
    print("\n[1/2] Starting FastAPI Backend on http://127.0.0.1:8000...")
    backend_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=backend_dir
    )

    # 2. Start Vite Frontend
    print("[2/2] Starting React + Vite Frontend on http://localhost:5173...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_process = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=frontend_dir
    )

    print("\n" + "=" * 65)
    print("✨ APPLICATION RUNNING!")
    print("👉 Frontend UI: http://localhost:5173")
    print("👉 Backend API: http://127.0.0.1:8000/docs")
    print("=" * 65)
    print("Press Ctrl+C in this terminal to stop both servers.")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping services...")
        backend_process.terminate()
        frontend_process.terminate()
        print("Done.")

if __name__ == "__main__":
    main()
