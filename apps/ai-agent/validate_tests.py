#!/usr/bin/env python3
"""
Validate test structure and imports.
"""

import sys
import os
from pathlib import Path

def validate_test_structure():
    """Validate that all test files are properly structured."""
    print("🔍 Validating test structure...")
    
    # Check if tests directory exists
    tests_dir = Path("tests")
    if not tests_dir.exists():
        print("❌ Tests directory not found")
        return False
    
    # Expected test files
    expected_files = [
        "conftest.py",
        "test_database_service.py",
        "test_websocket_manager.py",
        "test_agent_service.py",
        "test_integration.py"
    ]
    
    # Check each file
    all_good = True
    for file in expected_files:
        file_path = tests_dir / file
        if file_path.exists():
            print(f"✅ {file}")
        else:
            print(f"❌ {file} - missing")
            all_good = False
    
    return all_good

def validate_imports():
    """Validate that imports work correctly."""
    print("\n🔍 Validating imports...")
    
    try:
        # Test importing main modules
        sys.path.insert(0, ".")
        
        from services.database_service import DatabaseService
        from services.websocket_manager import WebSocketManager
        from services.agent_service import AgentService
        from config import Settings
        
        print("✅ All imports successful")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def validate_test_configuration():
    """Validate test configuration files."""
    print("\n🔍 Validating configuration...")
    
    config_files = [
        "pytest.ini",
        "requirements-test.txt"
    ]
    
    all_good = True
    for file in config_files:
        if Path(file).exists():
            print(f"✅ {file}")
        else:
            print(f"❌ {file} - missing")
            all_good = False
    
    return all_good

def main():
    """Main validation function."""
    print("🧪 AI Agent Service Test Validation")
    print("===================================")
    
    results = []
    results.append(validate_test_structure())
    results.append(validate_imports())
    results.append(validate_test_configuration())
    
    print("\n📊 Validation Summary")
    print("=====================")
    
    if all(results):
        print("✅ All validations passed!")
        print("\nTo run tests:")
        print("  ./run_tests.sh          # Run all tests")
        print("  python3 -m pytest       # Quick run")
        return 0
    else:
        print("❌ Some validations failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())