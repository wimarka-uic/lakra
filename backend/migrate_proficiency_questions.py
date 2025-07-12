#!/usr/bin/env python3

"""
Migration to add language proficiency questions tables
"""

import sqlite3
from datetime import datetime

def migrate_database():
    conn = sqlite3.connect('annotation_system.db')
    cursor = conn.cursor()
    
    try:
        # Create LanguageProficiencyQuestion table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS language_proficiency_questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                language VARCHAR NOT NULL,
                type VARCHAR NOT NULL,  -- 'grammar', 'vocabulary', 'translation', 'cultural', 'comprehension'
                question TEXT NOT NULL,
                options JSON NOT NULL,  -- Array of options as JSON
                correct_answer INTEGER NOT NULL,  -- Index of correct option (0-based)
                explanation TEXT NOT NULL,
                difficulty VARCHAR NOT NULL,  -- 'basic', 'intermediate', 'advanced'
                is_active BOOLEAN DEFAULT TRUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_by INTEGER,  -- Admin user who created the question
                FOREIGN KEY (created_by) REFERENCES users (id)
            )
        ''')
        
        # Create UserQuestionAnswer table to track individual question responses
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_question_answers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                question_id INTEGER NOT NULL,
                selected_answer INTEGER NOT NULL,  -- Index of selected option
                is_correct BOOLEAN NOT NULL,
                answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                test_session_id VARCHAR,  -- To group answers from the same test session
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (question_id) REFERENCES language_proficiency_questions (id)
            )
        ''')
        
        # Create indexes for better performance
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_lpq_language ON language_proficiency_questions (language)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_lpq_type ON language_proficiency_questions (type)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_lpq_difficulty ON language_proficiency_questions (difficulty)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_lpq_active ON language_proficiency_questions (is_active)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_uqa_user ON user_question_answers (user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_uqa_question ON user_question_answers (question_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_uqa_session ON user_question_answers (test_session_id)')
        
        # Insert default sample questions
        sample_questions = [
            {
                'language': 'Tagalog',
                'type': 'grammar',
                'question': 'Which is the correct way to say "I am going to school" in Tagalog?',
                'options': '["Ako ay pupunta sa eskwelahan", "Pupunta ako sa eskwelahan", "Sa eskwelahan ako pupunta", "Lahat ng nabanggit"]',
                'correct_answer': 3,
                'explanation': 'All three options are grammatically correct ways to express "I am going to school" in Tagalog, showing the flexibility of Filipino sentence structure.',
                'difficulty': 'basic'
            },
            {
                'language': 'Tagalog',
                'type': 'vocabulary',
                'question': 'What does "pakikipagkunware" mean in English?',
                'options': '["Honesty", "Pretending or acting", "Helping others", "Being lazy"]',
                'correct_answer': 1,
                'explanation': '"Pakikipagkunware" refers to pretending, acting, or putting on a facade.',
                'difficulty': 'intermediate'
            },
            {
                'language': 'Cebuano',
                'type': 'vocabulary',
                'question': 'What does "maayong buntag" mean?',
                'options': '["Good afternoon", "Good evening", "Good morning", "Good night"]',
                'correct_answer': 2,
                'explanation': '"Maayong buntag" is the Cebuano greeting for "good morning".',
                'difficulty': 'basic'
            },
            {
                'language': 'English',
                'type': 'grammar',
                'question': 'Which sentence shows correct Philippine English usage?',
                'options': '["I will open the aircon", "I will turn on the air conditioner", "Both are acceptable in Philippine English", "Neither is correct"]',
                'correct_answer': 2,
                'explanation': 'Both "aircon" (common in Philippine English) and "air conditioner" are acceptable, showing the localized variety of English used in the Philippines.',
                'difficulty': 'intermediate'
            },
            {
                'language': 'Tagalog',
                'type': 'translation',
                'question': 'How would you translate "The cat is sleeping under the table" to Tagalog?',
                'options': '["Ang pusa ay natutulog sa ilalim ng mesa", "Natutulog ang pusa sa ibabaw ng mesa", "Ang pusa ay kumakain sa ilalim ng mesa", "Natutulog sa mesa ang pusa"]',
                'correct_answer': 0,
                'explanation': '"Ang pusa ay natutulog sa ilalim ng mesa" correctly translates to "The cat is sleeping under the table" with proper word order and preposition.',
                'difficulty': 'intermediate'
            },
            {
                'language': 'Cebuano',
                'type': 'grammar',
                'question': 'Which is the correct Cebuano sentence structure for "I love my family"?',
                'options': '["Gihigugma nako ang akong pamilya", "Ang akong pamilya gihigugma nako", "Both are correct", "Neither is correct"]',
                'correct_answer': 2,
                'explanation': 'Both sentence structures are grammatically correct in Cebuano, demonstrating the flexibility of word order in the language.',
                'difficulty': 'basic'
            }
        ]
        
        for question in sample_questions:
            cursor.execute('''
                INSERT OR IGNORE INTO language_proficiency_questions 
                (language, type, question, options, correct_answer, explanation, difficulty)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                question['language'],
                question['type'],
                question['question'],
                question['options'],
                question['correct_answer'],
                question['explanation'],
                question['difficulty']
            ))
        
        conn.commit()
        print("✅ Language proficiency questions tables created successfully!")
        print(f"✅ Inserted {len(sample_questions)} sample questions")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error during migration: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
