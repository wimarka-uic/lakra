#!/usr/bin/env python3
"""
PostgreSQL database setup script for Lakra Annotation System

This script:
1. Creates the PostgreSQL database if it doesn't exist
2. Sets up all required tables
3. Optionally loads sample data

Prerequisites:
- PostgreSQL server running and accessible
- Copy .env.example to .env and configure your database settings
- Install required Python packages: pip install -r requirements.txt

Usage:
    python setup_postgresql.py          # Interactive setup
    python setup_postgresql.py --help   # Show help
"""

import os
import sys
import subprocess
from typing import Optional
import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from config import settings
from database import Base, engine, create_tables

def parse_database_url(url: str) -> dict:
    """Parse PostgreSQL URL into components"""
    # Remove postgresql:// prefix
    url = url.replace('postgresql://', '')
    
    # Split user:password@host:port/database
    if '@' in url:
        auth, host_db = url.split('@', 1)
        if ':' in auth:
            user, password = auth.split(':', 1)
        else:
            user, password = auth, ''
    else:
        user, password = '', ''
        host_db = url
    
    if '/' in host_db:
        host_port, database = host_db.rsplit('/', 1)
    else:
        host_port, database = host_db, ''
    
    if ':' in host_port:
        host, port = host_port.split(':', 1)
        port = int(port)
    else:
        host, port = host_port, 5432
    
    return {
        'user': user,
        'password': password,
        'host': host,
        'port': port,
        'database': database
    }

def check_postgresql_connection(db_config: dict) -> bool:
    """Check if PostgreSQL server is accessible"""
    try:
        # Connect without specifying database to check server
        conn = psycopg2.connect(
            user=db_config['user'],
            password=db_config['password'],
            host=db_config['host'],
            port=db_config['port'],
            database='postgres'  # Default database
        )
        conn.close()
        return True
    except psycopg2.Error as e:
        print(f"❌ Cannot connect to PostgreSQL server: {e}")
        return False

def database_exists(db_config: dict) -> bool:
    """Check if the target database exists"""
    try:
        conn = psycopg2.connect(
            user=db_config['user'],
            password=db_config['password'],
            host=db_config['host'],
            port=db_config['port'],
            database='postgres'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_config['database'],))
        exists = cursor.fetchone() is not None
        
        cursor.close()
        conn.close()
        return exists
    except psycopg2.Error:
        return False

def create_database(db_config: dict) -> bool:
    """Create the database if it doesn't exist"""
    try:
        conn = psycopg2.connect(
            user=db_config['user'],
            password=db_config['password'],
            host=db_config['host'],
            port=db_config['port'],
            database='postgres'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        cursor.execute(
            sql.SQL("CREATE DATABASE {}").format(
                sql.Identifier(db_config['database'])
            )
        )
        
        cursor.close()
        conn.close()
        return True
    except psycopg2.Error as e:
        print(f"❌ Failed to create database: {e}")
        return False

def setup_database():
    """Main setup function"""
    print("=" * 60)
    print("LAKRA POSTGRESQL DATABASE SETUP")
    print("=" * 60)
    
    # Check if .env file exists
    if not os.path.exists('.env'):
        print("⚠️  No .env file found!")
        print("   Please copy .env.example to .env and configure your settings:")
        print("   cp .env.example .env")
        print("   # Then edit .env with your database credentials")
        response = input("   Do you want to continue anyway? (y/N): ")
        if response.lower() != 'y':
            print("   Setup cancelled. Please create .env file first.")
            return False
        print()
    
    # Parse database URL
    try:
        db_config = parse_database_url(settings.database_url)
        print(f"Database URL: {settings.database_url}")
        print(f"Target database: {db_config['database']}")
        print(f"Host: {db_config['host']}:{db_config['port']}")
        print(f"User: {db_config['user']}")
        print("-" * 60)
    except Exception as e:
        print(f"❌ Invalid database URL: {e}")
        return False
    
    # Check PostgreSQL connection
    print("1. Checking PostgreSQL server connection...")
    if not check_postgresql_connection(db_config):
        print("   Please ensure PostgreSQL is running and credentials are correct.")
        return False
    print("✅ PostgreSQL server is accessible")
    
    # Check if database exists
    print(f"\n2. Checking if database '{db_config['database']}' exists...")
    if database_exists(db_config):
        print(f"✅ Database '{db_config['database']}' already exists")
        response = input("   Do you want to continue with existing database? (y/N): ")
        if response.lower() != 'y':
            print("   Setup cancelled.")
            return False
    else:
        print(f"⚠️  Database '{db_config['database']}' does not exist")
        response = input("   Do you want to create it? (Y/n): ")
        if response.lower() == 'n':
            print("   Setup cancelled.")
            return False
        
        print(f"   Creating database '{db_config['database']}'...")
        if not create_database(db_config):
            return False
        print(f"✅ Database '{db_config['database']}' created successfully")
    
    # Create tables
    print("\n3. Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")
        return False
    
    # Ask about sample data
    print("\n4. Sample data setup...")
    response = input("   Do you want to load sample data? (y/N): ")
    if response.lower() == 'y':
        try:
            from init_db import init_database
            init_database()
            print("✅ Sample data loaded successfully")
        except Exception as e:
            print(f"❌ Failed to load sample data: {e}")
            print("   You can run 'python init_db.py' later to load sample data.")
    
    print("\n" + "=" * 60)
    print("🎉 POSTGRESQL DATABASE SETUP COMPLETED!")
    print("   Your Lakra application is ready to use.")
    print("   Start the backend with: uvicorn main:app --reload")
    print("=" * 60)
    return True

def main():
    """Main entry point"""
    if len(sys.argv) > 1 and sys.argv[1] in ['--help', '-h']:
        print(__doc__)
        print("\nUsage:")
        print("  python setup_postgresql.py          # Interactive setup")
        print("  python setup_postgresql.py --help   # Show this help")
        return
    
    try:
        success = setup_database()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
