#!/bin/bash

# Exit on error
set -e

echo "Running tests for MutSyncHub Analytics..."

# Set up environment
export PYTHONPATH=/home/peter/mutsynchub/server

# Activate virtual environment
source server/venv/bin/activate

# Install dependencies
pip install -r server/requirements.txt --no-cache-dir

# Run tests with full output
python -m pytest server/tests/test_import.py -vv --capture=no
