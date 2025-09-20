#!/bin/bash
# Test runner script for AI Agent service

set -e

echo "🧪 Running AI Agent Service Tests"
echo "=================================="

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Use python3
PYTHON_CMD=python3
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Install test dependencies if needed
echo "📦 Installing test dependencies..."
$PYTHON_CMD -m pip install -r requirements-test.txt 2>/dev/null || true

# Run different test suites
echo ""
echo "🔍 Running unit tests..."
$PYTHON_CMD -m pytest tests/ -m "unit" -v

echo ""
echo "🔗 Running integration tests..."
$PYTHON_CMD -m pytest tests/ -m "integration" -v

echo ""
echo "🛡️  Running compliance tests..."
$PYTHON_CMD -m pytest tests/ -m "lgpd" -v

echo ""
echo "📡 Running WebSocket tests..."
$PYTHON_CMD -m pytest tests/ -m "websocket" -v

echo ""
echo "📊 Running all tests with coverage..."
$PYTHON_CMD -m pytest tests/ --cov=services --cov-report=term-missing --cov-report=html

echo ""
echo "✅ All tests completed!"
echo "Coverage report available at: htmlcov/index.html"