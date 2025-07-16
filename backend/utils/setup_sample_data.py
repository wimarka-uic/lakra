#!/usr/bin/env python3
"""
Script to initialize PostgreSQL database with sample data.
Run this after your PostgreSQL database is set up with tables.
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from init_db import init_database
    
    if __name__ == "__main__":
        print("=" * 50)
        print("LAKRA PostgreSQL Database Initialization")
        print("=" * 50)
        print()
        
        # Check if user wants to proceed
        print("This script will populate your PostgreSQL database with sample data:")
        print("- 3 sample users (admin, annotator, evaluator)")
        print("- 25 sample sentences in various Philippine languages")
        print()
        
        response = input("Do you want to proceed? (y/N): ")
        if response.lower() != 'y':
            print("Initialization cancelled.")
            sys.exit(0)
        
        print()
        init_database()
        print()
        print("=" * 50)
        print("Initialization complete!")
        print("You can now start using the LAKRA annotation system.")
        print("=" * 50)
        
except ImportError as e:
    print(f"Error importing modules: {e}")
    print("Make sure you're running this from the backend directory and all dependencies are installed.")
    sys.exit(1)
except Exception as e:
    print(f"Error during initialization: {e}")
    sys.exit(1)
