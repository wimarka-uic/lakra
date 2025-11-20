# Administrator Guide

This guide provides comprehensive instructions for administrators managing the Lakra annotation and evaluation system.

## Overview

As an administrator, you are responsible for:
- Managing user accounts and permissions
- Adding and organizing sentences for annotation
- Monitoring system-wide statistics and quality metrics
- Importing content in bulk via CSV files
- Configuring system settings and onboarding tests
- Ensuring data quality and system integrity

## Getting Started

### Accessing the Admin Panel

1. **Sign In**: Log in with administrator credentials
2. **Admin Dashboard**: Access via the navigation menu
3. **Overview**: See system-wide statistics and metrics

### Admin Dashboard Overview

The dashboard displays:

- **User Statistics**: Total users by role, active users
- **Annotation Progress**: Completion rates, pending work
- **Quality Metrics**: Average scores, error distributions
- **System Health**: Activity levels, performance indicators
- **Recent Activity**: Latest annotations, evaluations, user actions

## User Management

### Viewing Users

1. Navigate to **"User Management"**
2. See list of all users with:
   - Username and email
   - Role (Admin/Annotator/Evaluator)
 - Registration date
   - Activity status
   - Annotation/evaluation counts
   - Last active timestamp

### Creating New Users

#### Method 1: Individual User Creation

1. Click **"Add User"**
2. Fill in user details:
   - **Email**: User's email address (required, unique)
   - **Username**: Username for login (optional, unique)
   - **Password**: Initial password
   - **Role**: Select Admin, Annotator, or Evaluator
   - **Language Preferences**: Default languages for the user
3. Click **"Create User"**
4. User receives email with credentials (if email is configured)

```{tip}
Encourage users to change their password after first login.
```

#### Method 2: Bulk User Import

For creating multiple users:

1. Prepare CSV file with columns:
   ```csv
   email,username,role,password
   user1@example.com,user1,annotator,TempPass123
   user2@example.com,user2,evaluator,TempPass456
   ```
2. Navigate to **"Bulk Import"** → **"Users"**
3. Upload CSV file
4. Review preview and confirm
5. Users are created with provided credentials

### Editing User Profiles

1. Select user from the list
2. Click **"Edit"**
3. Modify:
   - Role assignment
   - Email address
   - Username
   - Active/inactive status
   - Language preferences
   - Permissions
4. Click **"Save Changes"**

```{warning}
Changing a user's role will immediately affect their access permissions.
```

### Managing User Roles

#### Role Capabilities

**Administrator:**
- Full system access
- User management
- Content management
- System configuration
- View all data

**Annotator:**
- Create annotations
- View own annotations
- Access annotation interface
- Track personal progress

**Evaluator:**
- Review annotations
- Quality assessments
- Provide feedback
- Access evaluation interface

**Multi-Role Users:**
- Users can have multiple roles if needed
- Set primary role for default dashboard

### Deactivating/Deleting Users

**Deactivate User:**
1. Select user
2. Click **"Deactivate"**
3. User cannot log in but data is preserved

**Delete User:**
1. Select user
2. Click **"Delete"**
3. Confirm deletion (irreversible)

```{caution}
Deleting users removes their data. Consider deactivation instead for data retention.
```

## Content Management

### Managing Sentences

#### Viewing Sentences

Navigate to **"Sentence Management"** to see:
- All sentences in the system
- Source and target languages
- Machine translations
- Annotation status (pending/completed/in-progress)
- Quality statistics
- Active/inactive status

#### Adding Individual Sentences

1. Click **"Add Sentence"**
2. Fill in details:
   - **Source Text**: Original text (required)
   - **Machine Translation**: Translated text (required)
   - **Source Language**: Language of source text
   - **Target Language**: Language of translation
   - **Domain**: Subject area (optional)
   - **Back Translation**: Optional back-translation
   - **Active**: Whether available for annotation
3. Click **"Create Sentence"**

```{tip}
Use descriptive domains to help annotators understand context (e.g., "medical", "legal", "news").
```

### Bulk Importing Sentences via CSV

For efficient content management:

#### CSV Format Requirements

Create a CSV file with these columns:

**Required:**
- `source_text`: Original text
- `machine_translation`: Translated text
- `source_language`: ISO language code (e.g., "en", "fil")
- `target_language`: ISO language code

**Optional:**
- `domain`: Subject area/category
- `context`: Additional context information

**Example CSV:**
```csv
source_text,machine_translation,source_language,target_language,domain
"Hello, how are you?","Kumusta ka?","en","fil","casual"
"The meeting is tomorrow.","Ang pulong ay bukas.","en","fil","business"
```

```{note}
Do NOT include `back_translation` column - the system handles this separately.
```

#### Import Process

1. Navigate to **"Bulk Import"** → **"Sentences"**
2. Click **"Upload CSV"**
3. Select your CSV file
4. **Validation**: System checks format and data
5. **Preview**: Review parsed data
6. **Confirm**: Click "Import" to add sentences
7. **Results**: See summary of successful/failed imports

#### Common Import Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing required field" | CSV lacks required column | Add missing column |
| "Invalid language code" | Non-standard language code | Use ISO codes (en, fil, etc.) |
| "Duplicate source text" | Sentence already exists | Remove duplicates or update existing |
| "Invalid encoding" | Non-UTF-8 file | Save CSV as UTF-8 |

### Managing Sentence Status

**Activate Sentences:**
- Make sentences available for annotation
- Bulk activate/deactivate from sentence list

**Deactivate Sentences:**
- Remove from annotation queue
- Preserve existing annotations
- Use for quality control or revision

**Delete Sentences:**
- Permanently remove sentence
- Also deletes associated annotations

```{warning}
Deleting sentences removes all related annotations. Export data first if needed.
```

## System Monitoring

### Analytics Dashboard

View comprehensive metrics:

#### User Activity
- Active users (daily/weekly/monthly)
- Login frequency
- Role distribution
- New user registrations

#### Annotation Metrics
- Total annotations completed
- Annotations per user
- Average annotations per day
- Completion rates by language pair

#### Quality Metrics
- Average quality scores (fluency, adequacy, overall)
- Error type distribution
- Annotation consistency scores
- Evaluator agreement rates

#### System Performance
- Response times
- Error rates
- Storage usage
- API performance

### Generating Reports

1. Navigate to **"Reports"**
2. Select report type:
   - User activity report
   - Annotation quality report
   - Progress summary
   - Error analysis report
3. Set date range and filters
4. Choose export format (CSV, PDF, Excel)
5. Click **"Generate Report"**

### Data Export

Export data for analysis:

**Export Options:**
- All annotations
- Specific user annotations
- Specific language pairs
- Date range filtered data
- Quality assessment data

**Export Formats:**
- CSV (for spreadsheets)
- JSON (for programmatic access)
- Excel (formatted reports)

## Quality Control

### Monitoring Annotation Quality

#### Review Patterns
- Identify annotators with consistently low scores
- Find common errors or misunderstandings
- Spot annotations needing re-evaluation

#### Quality Assurance Checks
- Random sampling of annotations
- Expert review of flagged annotations
- Consistency checks across annotators

### Managing Onboarding Tests

#### Creating Onboarding Tests

1. Navigate to **"Onboarding Tests"**
2. Click **"Create Test"**
3. Configure test:
   - **Role**: Annotator or Evaluator
   - **Language Pair**: Specific languages
   - **Passing Score**: Minimum required score
   - **Test Sentences**: Select representative examples
   - **Expected Annotations**: Provide gold standard answers
4. Save test

#### Reviewing Test Results

- View all test attempts
- See pass/fail rates
- Identify struggling users
- Adjust difficulty if needed

### Handling Quality Issues

When quality concerns arise:

1. **Identify**: Use metrics to spot issues
2. **Review**: Examine specific annotations
3. **Feedback**: Contact user with specific guidance
4. **Training**: Provide additional resources or sessions
5. **Monitor**: Track improvement over time
6. **Escalate**: Deactivate user if problems persist

## System Configuration

### General Settings

Access via **"Settings"** → **"General"**:

- **System Name**: Display name for your instance
- **Default Language**: System default for UI
- **Supported Languages**: Enable/disable language pairs
- **Email Configuration**: SMTP settings for notifications
- **Authentication**: Login methods (email, username,both)

### Annotation Settings

Configure annotation behavior:

- **Required Fields**: Make certain fields mandatory
- **Error Types**: Enable/disable specific error classifications
- **Voice Recording**: Enable/disable audio annotations
- **Quality Scales**: Configure rating scales (1-5, 1-10, etc.)
- **Auto-save**: Automatic draft saving intervals

### Evaluation Settings

Configure evaluation workflow:

- **Evaluation Assignment**: Auto-assign or manual
- **Minimum Evaluations**: How many evaluators per annotation
- **AI Assistance**: Enable/disable AI quality assessment
- **Feedback Visibility**: Whether annotators see evaluator feedback

### Storage and Backups

**Storage Management:**
- View storage usage by type (annotations, recordings)
- Configure cleanup rules for old data
- Manage voice recording retention

**Backup Configuration:**
- Automatic backup schedule
- Backup destinations
- Retention policies

```{important}
Regular backups are crucial. Configure automated backups to external storage.
```

## Troubleshooting

### Common Admin Issues

**Users Can't Login:**
- Verify user account is active
- Check authentication configuration
- Reset user password
- Verify email verification status (if enabled)

**CSV Import Fails:**
- Validate CSV format and encoding
- Check for required columns
- Verify language codes are valid
- Check for special characters or encoding issues

**Performance Issues:**
- Review system metrics
- Check database performance
- Monitor storage usage
- Verify server resources

**Data Inconsistencies:**
- Run database integrity checks
- Review RLS policies in Supabase
- Check for orphaned records
- Verify foreign key relationships

### Accessing System Logs

1. Navigate to **"System"** → **"Logs"**
2. Filter by:
   - Log level (error, warning, info)
   - Time range
   - User/session
   - Component (auth, API, database)
3. Export logs for analysis

### Database Maintenance

**Regular Tasks:**
- Monitor database size
- Review slow queries
- Update indexes if needed
- Clean up old sessions
- Vacuum database (if applicable)

**Access Database:**
- Use Supabase dashboard
- SQL Editor for queries
- Table editor for manual updates

```{caution}
Direct database modifications can break the system. Create backups before manual changes.
```

## Security Best Practices

### User Security

- **Password Policies**: Enforce strong passwords
- **MFA**: Enable multi-factor authentication if available
- **Session Management**: Configure timeout periods
- **Password Resets**: Secure reset process

### Data Security

- **Row Level Security**: Verify RLS policies are correct
- **API Keys**: Rotate keys regularly
- **Access Logs**: Monitor for suspicious activity
- **Encryption**: Ensure data at rest and in transit is encrypted

### Privacy Compliance

- **Data Retention**: Configure appropriate retention policies
- **User Data Export**: Provide data export capability for users
- **Data Deletion**: Honor deletion requests
- **Audit Logs**: Maintain records of data access and changes

## Advanced Administration

### Custom Workflows

Configure custom annotation workflows:
- Multi-stage annotation processes
- Specialized error taxonomies
- Custom quality metrics
- Domain-specific configurations

### API Access

Provide API access for integrations:
- Generate API tokens
- Configure rate limits
- Monitor API usage
- Review API logs

### Integration Management

Manage external integrations:
- Machine translation services
- Voice recognition services
- Analytics platforms
- Export destinations

## FAQ for Administrators

**Q: How do I reset a user's password?**
A: Go to User Management, select the user, click "Reset Password", and send the new password securely.

**Q: Can I recover deleted sentences?**
A: Only if you have database backups. Deleted data is permanently removed. Use deactivation instead of deletion.

**Q: How many sentences should each annotator receive?**
A: Varies by project, but 20-50 sentences per week is common. Monitor completion rates and adjust.

**Q: What's the recommended number of evaluations per annotation?**
A: Typically 1-2 evaluations per annotation provides good quality assurance without excessive overhead.

**Q: How do I export all data for analysis?**
A: Use the Reports section to generate comprehensive exports, or access the database directly via Supabase.

**Q: Can I customize the error taxonomy?**
A: Yes, through the Settings panel. Modify error types and classifications as needed for your project.

## Tips for Effective Administration

### User Management
- Create clear user guidelines and documentation
- Provide thorough onboarding for new users
- Regular communication about updates and changes
- Recognize and reward high-quality work

### Content Management
- Plan annotation batches strategically
- Balance sentence difficulty
- Ensure diverse language pair coverage
- Regular review of sentence quality

### Quality Assurance
- Establish clear quality standards
- Regular calibration sessions
- Transparent feedback mechanisms
- Continuous improvement processes

### System Health
- Monitor metrics daily
- Address issues promptly
- Regular maintenance windows
- Keep system updated

## Next Steps

- Review the [Features](features.md) for deeper understanding
- Consult the [Technical Manual](../technical-manual/index.rst) for system architecture
- Check the [Deployment Guide](../technical-manual/deployment.md) for production best practices
- Review the [FAQ](faq.md) for common questions

```{seealso}
For development and customization, see the [Development Guide](../technical-manual/development.md).
```
