#!/usr/bin/env python3
"""
Database connection test script for Lakra backend
"""
import os
import sys
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from config import settings
    from database import engine, SessionLocal
    
    print("=" * 60)
    print("LAKRA DATABASE CONNECTION TEST")
    print("=" * 60)
    print(f"Timestamp: {datetime.now()}")
    print(f"Environment DATABASE_URL: {os.getenv('DATABASE_URL', 'NOT SET')}")
    print(f"Settings Database URL: {settings.database_url}")
    print(f"Database Type: PostgreSQL")
    print(f"Is PostgreSQL: {settings.is_postgresql}")
    print("-" * 60)
    
    # Test 1: Basic engine connection
    print("Test 1: Testing basic engine connection...")
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1 as test"))
            test_value = result.fetchone()[0]
            print(f"✅ Engine connection successful (test query returned: {test_value})")
    except Exception as e:
        print(f"❌ Engine connection failed: {e}")
        sys.exit(1)
    
    # Test 2: Session creation
    print("\nTest 2: Testing session creation...")
    try:
        db = SessionLocal()
        # Test PostgreSQL version query
        result = db.execute(text("SELECT version()"))
        version_info = result.fetchone()[0]
        print(f"✅ Session created successfully")
        print(f"   PostgreSQL version: {version_info}")
        db.close()
    except Exception as e:
        print(f"❌ Session creation failed: {e}")
        sys.exit(1)
    
    # Test 3: Check if tables exist
    print("\nTest 3: Checking existing tables...")
    try:
        with engine.connect() as connection:
            # PostgreSQL query to list tables
            result = connection.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            
            tables = [row[0] for row in result.fetchall()]
            if tables:
                print(f"✅ Found {len(tables)} tables:")
                for table in tables:
                    print(f"   - {table}")
            else:
                print("⚠️  No tables found (database might need initialization)")
    except Exception as e:
        print(f"❌ Failed to check tables: {e}")
    
    # Test 4: Check database connection pool
    print("\nTest 4: Testing connection pool...")
    try:
        pool_status = engine.pool.status()
        print(f"✅ Connection pool status: {pool_status}")
        print(f"   Pool size: {engine.pool.size()}")
        print(f"   Checked out connections: {engine.pool.checkedout()}")
        print(f"   Overflow connections: {engine.pool.overflow()}")
    except Exception as e:
        print(f"❌ Connection pool test failed: {e}")
    
    print("\n" + "=" * 60)
    print("🎉 DATABASE CONNECTION TEST COMPLETED SUCCESSFULLY!")
    print("   Your backend can connect to the database.")
    print("=" * 60)
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("   Make sure you're running this from the backend directory")
    sys.exit(1)
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    sys.exit(1)
