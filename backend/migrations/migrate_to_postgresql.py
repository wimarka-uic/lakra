"""
Migration script to transfer data from SQLite to PostgreSQL
"""
import json
import os
import sys
from datetime import datetime
from typing import Dict, Any, List
import sqlite3
import psycopg2
from psycopg2.extras import Json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config import settings

class DatabaseMigrator:
    """Handles migration from SQLite to PostgreSQL"""
    
    def __init__(self, sqlite_path: str = "./annotation_system.db", 
                 postgres_url: str = None):
        self.sqlite_path = sqlite_path
        self.postgres_url = postgres_url or settings.database_url
        
        # Verify PostgreSQL URL
        if not self.postgres_url.startswith('postgresql://'):
            raise ValueError("PostgreSQL URL required for migration")
        
        print(f"Migrating from SQLite: {sqlite_path}")
        print(f"Migrating to PostgreSQL: {self.postgres_url}")
    
    def connect_sqlite(self):
        """Connect to SQLite database"""
        if not os.path.exists(self.sqlite_path):
            raise FileNotFoundError(f"SQLite database not found: {self.sqlite_path}")
        
        conn = sqlite3.connect(self.sqlite_path)
        conn.row_factory = sqlite3.Row  # Enable column access by name
        return conn
    
    def connect_postgresql(self):
        """Connect to PostgreSQL database"""
        engine = create_engine(self.postgres_url)
        return engine
    
    def get_table_names(self, sqlite_conn) -> List[str]:
        """Get all table names from SQLite"""
        cursor = sqlite_conn.cursor()
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
        """)
        return [row[0] for row in cursor.fetchall()]
    
    def get_table_data(self, sqlite_conn, table_name: str) -> List[Dict]:
        """Get all data from a table"""
        cursor = sqlite_conn.cursor()
        cursor.execute(f"SELECT * FROM {table_name}")
        
        columns = [description[0] for description in cursor.description]
        rows = []
        
        for row in cursor.fetchall():
            row_dict = {}
            for i, value in enumerate(row):
                column_name = columns[i]
                
                # Handle JSON columns
                if table_name == 'onboarding_tests' and column_name == 'test_data':
                    if value:
                        try:
                            row_dict[column_name] = json.loads(value) if isinstance(value, str) else value
                        except (json.JSONDecodeError, TypeError):
                            row_dict[column_name] = value
                    else:
                        row_dict[column_name] = None
                elif table_name == 'language_proficiency_questions' and column_name == 'options':
                    if value:
                        try:
                            row_dict[column_name] = json.loads(value) if isinstance(value, str) else value
                        except (json.JSONDecodeError, TypeError):
                            row_dict[column_name] = value
                    else:
                        row_dict[column_name] = None
                else:
                    row_dict[column_name] = value
            
            rows.append(row_dict)
        
        return rows
    
    def create_tables(self):
        """Create tables in PostgreSQL"""
        from database import create_tables
        print("Creating tables in PostgreSQL...")
        create_tables()
        print("Tables created successfully")
    
    def migrate_table(self, pg_engine, table_name: str, data: List[Dict]):
        """Migrate data for a specific table"""
        if not data:
            print(f"No data to migrate for table: {table_name}")
            return
        
        print(f"Migrating {len(data)} rows for table: {table_name}")
        
        # Create column list and placeholders
        columns = list(data[0].keys())
        placeholders = ', '.join([f':{col}' for col in columns])
        column_names = ', '.join(columns)
        
        # Build insert query
        query = f"INSERT INTO {table_name} ({column_names}) VALUES ({placeholders})"
        
        # Process data for PostgreSQL compatibility
        processed_data = []
        for row in data:
            processed_row = {}
            for key, value in row.items():
                # Handle JSON fields
                if (table_name == 'onboarding_tests' and key == 'test_data') or \
                   (table_name == 'language_proficiency_questions' and key == 'options'):
                    processed_row[key] = value  # Already processed in get_table_data
                else:
                    processed_row[key] = value
            processed_data.append(processed_row)
        
        # Execute bulk insert
        with pg_engine.connect() as conn:
            trans = conn.begin()
            try:
                conn.execute(text(query), processed_data)
                trans.commit()
                print(f"Successfully migrated {len(processed_data)} rows to {table_name}")
            except Exception as e:
                trans.rollback()
                print(f"Error migrating table {table_name}: {e}")
                raise
    
    def migrate_all_data(self):
        """Migrate all data from SQLite to PostgreSQL"""
        print("Starting data migration...")
        
        # Connect to databases
        sqlite_conn = self.connect_sqlite()
        pg_engine = self.connect_postgresql()
        
        try:
            # Get all tables
            tables = self.get_table_names(sqlite_conn)
            print(f"Found tables: {tables}")
            
            # Migration order to respect foreign key constraints
            migration_order = [
                'users',
                'user_languages', 
                'sentences',
                'annotations',
                'text_highlights',
                'evaluations',
                'mt_quality_assessments',
                'onboarding_tests',
                'language_proficiency_questions',
                'user_question_answers'
            ]
            
            # Migrate tables in order
            for table_name in migration_order:
                if table_name in tables:
                    data = self.get_table_data(sqlite_conn, table_name)
                    self.migrate_table(pg_engine, table_name, data)
                else:
                    print(f"Table {table_name} not found in SQLite database")
            
            # Handle any remaining tables not in the ordered list
            remaining_tables = set(tables) - set(migration_order)
            for table_name in remaining_tables:
                data = self.get_table_data(sqlite_conn, table_name)
                self.migrate_table(pg_engine, table_name, data)
            
        finally:
            sqlite_conn.close()
            pg_engine.dispose()
        
        print("Data migration completed successfully!")
    
    def verify_migration(self):
        """Verify the migration by comparing row counts"""
        print("Verifying migration...")
        
        sqlite_conn = self.connect_sqlite()
        pg_engine = self.connect_postgresql()
        
        try:
            tables = self.get_table_names(sqlite_conn)
            
            for table_name in tables:
                # Get SQLite count
                cursor = sqlite_conn.cursor()
                cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                sqlite_count = cursor.fetchone()[0]
                
                # Get PostgreSQL count
                with pg_engine.connect() as conn:
                    result = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                    pg_count = result.scalar()
                
                print(f"Table {table_name}: SQLite={sqlite_count}, PostgreSQL={pg_count}")
                
                if sqlite_count != pg_count:
                    print(f"WARNING: Row count mismatch for table {table_name}")
                else:
                    print(f"✓ Table {table_name} migrated successfully")
        
        finally:
            sqlite_conn.close()
            pg_engine.dispose()
        
        print("Migration verification completed!")

def main():
    """Main migration function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Migrate data from SQLite to PostgreSQL')
    parser.add_argument('--sqlite-path', default='./annotation_system.db',
                       help='Path to SQLite database file')
    parser.add_argument('--postgres-url', 
                       help='PostgreSQL connection URL (default: from config)')
    parser.add_argument('--skip-tables', action='store_true',
                       help='Skip table creation (tables already exist)')
    parser.add_argument('--verify-only', action='store_true',
                       help='Only verify migration, do not migrate')
    
    args = parser.parse_args()
    
    try:
        migrator = DatabaseMigrator(
            sqlite_path=args.sqlite_path,
            postgres_url=args.postgres_url
        )
        
        if args.verify_only:
            migrator.verify_migration()
        else:
            if not args.skip_tables:
                migrator.create_tables()
            
            migrator.migrate_all_data()
            migrator.verify_migration()
        
    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
