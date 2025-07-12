#!/usr/bin/env python3
"""
Migration script to add onboarding columns to existing users.
Run this script once to migrate the database after updating the User model.
"""

import sqlite3
import os

def migrate_database():
    # Database file path
    db_path = "annotation_system.db"
    
    if not os.path.exists(db_path):
        print("Database file not found. No migration needed.")
        return
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if the columns already exist
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Add onboarding_status column if it doesn't exist
        if 'onboarding_status' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN onboarding_status VARCHAR DEFAULT 'pending'")
            print("Successfully added 'onboarding_status' column to users table.")
        else:
            print("Column 'onboarding_status' already exists.")
        
        # Add onboarding_score column if it doesn't exist
        if 'onboarding_score' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN onboarding_score FLOAT")
            print("Successfully added 'onboarding_score' column to users table.")
        else:
            print("Column 'onboarding_score' already exists.")
        
        # Add onboarding_completed_at column if it doesn't exist
        if 'onboarding_completed_at' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN onboarding_completed_at DATETIME")
            print("Successfully added 'onboarding_completed_at' column to users table.")
        else:
            print("Column 'onboarding_completed_at' already exists.")
        
        # Update all existing users to have onboarding_status = 'pending'
        cursor.execute("UPDATE users SET onboarding_status = 'pending' WHERE onboarding_status IS NULL")
        
        # Commit the changes
        conn.commit()
        print("Migration completed successfully.")
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    migrate_database() 