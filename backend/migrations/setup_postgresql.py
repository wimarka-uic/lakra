#!/usr/bin/env python3
"""
PostgreSQL database initialization and migration script for Lakra.
This script sets up the complete database schema for PostgreSQL.
"""

import os
import sys
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import settings
from database import engine, Base, create_tables

def check_postgresql_connection():
    """Verify PostgreSQL connection is working"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Connected to PostgreSQL: {version}")
            return True
    except Exception as e:
        print(f"❌ Failed to connect to PostgreSQL: {e}")
        print("Make sure PostgreSQL is running and DATABASE_URL is correct.")
        return False

def setup_database():
    """Create all database tables"""
    try:
        print("Creating database tables...")
        create_tables()
        print("✅ Database tables created successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")
        return False

def verify_tables():
    """Verify all expected tables exist"""
    expected_tables = [
        'users', 'user_languages', 'sentences', 'annotations', 
        'text_highlights', 'evaluations', 'mt_quality_assessments',
        'onboarding_tests', 'language_proficiency_questions', 
        'user_question_answers'
    ]
    
    try:
        with engine.connect() as connection:
            result = connection.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            existing_tables = [row[0] for row in result.fetchall()]
            
            missing_tables = set(expected_tables) - set(existing_tables)
            if missing_tables:
                print(f"⚠️  Missing tables: {missing_tables}")
                return False
            else:
                print(f"✅ All {len(expected_tables)} expected tables found")
                return True
    except Exception as e:
        print(f"❌ Failed to verify tables: {e}")
        return False

def main():
    print("=" * 60)
    print("LAKRA POSTGRESQL DATABASE SETUP")
    print("=" * 60)
    
    # Verify we're using PostgreSQL
    if not settings.database_url.startswith('postgresql://'):
        print("❌ This script only works with PostgreSQL")
        print(f"Current DATABASE_URL: {settings.database_url}")
        sys.exit(1)
    
    print(f"Database URL: {settings.database_url}")
    
    # Step 1: Check connection
    if not check_postgresql_connection():
        sys.exit(1)
    
    # Step 2: Create tables
    if not setup_database():
        sys.exit(1)
    
    # Step 3: Verify tables
    if not verify_tables():
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!")
    print("   Your PostgreSQL database is ready for use.")
    print("   You can now run the backend server.")
    print("=" * 60)

if __name__ == "__main__":
    main()
