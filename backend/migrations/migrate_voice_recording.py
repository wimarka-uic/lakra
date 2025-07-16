"""
Database migration script to add voice recording fields to annotations table
"""
from database import engine
from sqlalchemy import text

def migrate_voice_recording():
    """
    Add voice recording fields to annotations table
    """
    print("Starting voice recording migration...")
    
    connection = engine.connect()
    
    try:
        # Check if voice_recording_url column exists in annotations table
        result = connection.execute(text("""
            PRAGMA table_info(annotations)
        """))
        columns = [row[1] for row in result.fetchall()]
        
        if 'voice_recording_url' not in columns:
            print("Adding voice_recording_url column to annotations table...")
            connection.execute(text("""
                ALTER TABLE annotations ADD COLUMN voice_recording_url TEXT
            """))
        else:
            print("voice_recording_url column already exists")
            
        if 'voice_recording_duration' not in columns:
            print("Adding voice_recording_duration column to annotations table...")
            connection.execute(text("""
                ALTER TABLE annotations ADD COLUMN voice_recording_duration INTEGER
            """))
        else:
            print("voice_recording_duration column already exists")
        
        connection.commit()
        print("Voice recording migration completed successfully!")
        
    except Exception as e:
        print(f"Voice recording migration failed: {e}")
        connection.rollback()
        raise
    finally:
        connection.close()

if __name__ == "__main__":
    migrate_voice_recording()
