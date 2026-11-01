"""
TrendTide Standalone Server Runner
Run this script directly from inside the trendtide directory:
    python run_server.py
"""
import sys
import os

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(PROJECT_ROOT, ".."))

for path in [REPO_ROOT, PROJECT_ROOT]:
    if path not in sys.path:
        sys.path.insert(0, path)

try:
    from trendtide.server.app import app
except ImportError:
    from server.app import app

if __name__ == "__main__":
    print("=" * 60)
    print("Starting TrendTide Server on http://127.0.0.1:5001")
    print("=" * 60)
    try:
        app.run(host="127.0.0.1", port=5001, debug=False, threaded=True)
    except Exception as e:
        print(f"Server encountered error: {e}")
        import traceback
        traceback.print_exc()

