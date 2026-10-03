import os
import sys

# Add project root and backend to Python path for Vercel Serverless Execution
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)
if os.path.join(project_root, "backend") not in sys.path:
    sys.path.insert(0, os.path.join(project_root, "backend"))

from backend.app.main import app
