# Features

This page provides a comprehensive overview of all features available in the Lakra annotation and evaluation system.

## Core Annotation Features

### Interactive Text Highlighting

Select and highlight portions of translated text to mark errors:

- **Click and drag** to select text
- **Error classification** on each highlight
- **Multiple highlights** per sentence
- **Overlapping regions** support
- **Color-coded** by error type
- **Edit and delete** existing highlights

**Error Types:**
- **MI_ST**: Minor Syntax errors
- **MI_SE**: Minor Semantic errors
- **MA_ST**: Major Syntax errors
- **MA_SE**: Major Semantic errors

### Quality Scoring

Multi-dimensional quality assessment:

#### Fluency Rating (1-5)
Measures how natural and grammatically correct the translation reads.

#### Adequacy Rating (1-5)
Assesses how well the translation preserves the source meaning.

#### Overall Quality Rating (1-5)
Holistic judgment of translation quality.

**Features:**
- Interactive sliders for easy rating
- Real-time score validation
- Historical score tracking
- Comparative analytics

### Error Classification and Documentation

Detailed error tracking:

- **Error type** selection
- **Error descriptions** for each highlight
- **Severity indicators**
- **Suggested corrections**
- **Error location** tracking (character positions)

### Voice Recording

Audio annotation support for detailed explanations:

- **Built-in voice recorder**
- **Record, pause, resume** functionality
- **Playback** before submission
- **Re-record** if needed
- **Secure storage** in Supabase
- **Signed URLs** for access control
- **Format**: WebM or compatible audio formats

**Use Cases:**
- Explain complex corrections
- Provide pronunciation guidance
- Give detailed feedback
- Demonstrate proper phrasing

### Comments and Suggestions

Text-based feedback:

- **General comments** on translation
- **Specific error explanations**
- **Correction suggestions**
- **Improvement recommendations**
- **Markdown support** for formatting (where available)

## Quality Assessment Features

### AI-Powered Evaluation

Automated quality assessment with machine learning:

#### AI Quality Scoring
- **Automated fluency** assessment
- **Adequacy** evaluation
- **Overall quality** prediction
- **Confidence levels** for each score
- **Explanation generation** for ratings

#### AI Error Detection
- **Syntax error** identification
- **Semantic error** detection
- **Error localization** (highlighting)
- **Severity classification**
- **Improvement suggestions**

#### AI Explanations
- **Detailed reasoning** for scores
- **Specific issue** descriptions
- **Pattern recognition** across similar errors
- **Context-aware** analysis

### Human-in-the-Loop Validation

Evaluators review and validate AI assessments:

- **Confirm** AI suggestions
- **Reject** incorrect assessments
- **Modify** partial agreements
- **Add human insight** not captured by AI
- **Flag edge cases** for review

### Quality Assessment Workflow

1. AI generates initial assessment
2. Evaluator reviews AI findings
3. Evaluator validates or corrects
4. Final assessment combines AI and human judgment
5. Feedback improves AI over time

## User Management Features

### Multi-Role System

Role-based access control:

#### Administrator Role
- Full system access
- User management
- Content management
- System configuration
- Analytics and reporting

#### Annotator Role
- Create annotations
- View own work
- Track personal progress
- Access annotation interface

#### Evaluator Role
- Review annotations
- Quality assessments
- Provide feedback
- Access evaluation interface

#### Multi-Role Support
- Users can have multiple roles
- Role-specific dashboards
- Granular permissions

### Authentication

Flexible sign-in options:

- **Email authentication**: Sign in with email and password
- **Username authentication**: Sign in with username and password
- **Password reset**: Self-service password recovery
- **Session management**: Secure token-based authentication
- **Remember me**: Persistent sessions (optional)

### User Profiles

Comprehensive user information:

- **Profile details**: Name, email, username
- **Role assignment**: Current role(s)
- **Language preferences**: Default language settings
- **Activity tracking**: Last active, registration date
- **Statistics**: Annotation counts, evaluation counts
- **Quality metrics**: Average scores, agreement rates

### Onboarding System

Quality assurance through testing:

- **Role-specific tests**: Different tests for annotators and evaluators
- **Language-pair specific**: Tests in relevant languages
- **Passing requirements**: Minimum scores to qualify
- **Multiple attempts**: Retake if needed
- **Performance tracking**: Test scores and history
- **Certification status**: Pass/fail indicators

## Progress Tracking Features

### Personal Dashboard

Individual progress monitoring:

- **Annotation count**: Total completed annotations
- **Evaluation count**: Total completed evaluations
- **Completion rate**: Percentage of assigned work done
- **Average scores**: Quality metrics over time
- **Recent activity**: Latest annotations and evaluations
- **Streak tracking**: Consecutive days active (if enabled)

### System-Wide Analytics

For administrators:

- **User statistics**: Active users, role distribution
- **Annotation metrics**: Total annotations, completion rates
- **Quality trends**: Quality scores over time
- **Error distributions**: Common error types and patterns
- **Evaluator agreement**: Inter-rater reliability metrics
- **Language pair coverage**: Distribution across languages

### Historical Data

Track progress over time:

- **Annotation history**: All past annotations by user
- **Evaluation history**: All past evaluations
- **Score trends**: Quality improvements or regressions
- **Time tracking**: Time spent on annotations
- **Productivity metrics**: Annotations per day/week/month

## Content Management Features

### Sentence Management

Organize translation content:

- **Add sentences** individually or in bulk
- **Edit existing** sentences
- **Activate/deactivate** sentences
- **Delete** sentences (with confirmation)
- **Search and filter** by language, domain, status
- **Annotation status**: Track which sentences are done

### Language Pair Support

Multi-language capabilities:

- **Flexible language pairs**: Any source → target combination
- **ISO language codes**: Standardized language identification
- **Language-specific settings**: Configure by language
- **RTL support**: Right-to-left language handling (where applicable)

### Domain Classification

Categorize content by subject:

- **Custom domains**: Create your own categories
- **Domain filtering**: Find sentences by domain
- **Domain-specific guidelines**: Tailored annotation rules
- **Statistics by domain**: Track quality per subject area

### Bulk Import/Export

Efficient data management:

#### CSV Import
- **Bulk sentence upload**: Add many sentences at once
- **User import**: Create multiple users via CSV
- **Validation**: Pre-import data checking
- **Error reporting**: Identify and fix issues before import

#### Data Export
- **Export annotations**: Download annotation data
- **Export evaluations**: Download evaluation data
- **Export reports**: Generate analytical reports
- **Multiple formats**: CSV, JSON, Excel

## Real-Time Features

### Live Updates

Dynamic interface updates:

- **Real-time validation**: Immediate feedback on input
- **Auto-save drafts**: Prevent data loss (where enabled)
- **Session persistence**: Resume work after disconnect
- **Optimistic updates**: Responsive UI interactions

### Notifications

Stay informed:

- **In-app notifications**: Alerts within the interface
- **Email notifications**: Important updates via email (if configured)
- **Feedback notifications**: When evaluations are complete
- **System announcements**: Administrator messages

## Interface Features

### Responsive Design

Works on all devices:

- **Desktop optimized**: Full-featured experience on large screens
- **Tablet support**: Touch-friendly interface
- **Mobile compatible**: Core features on smartphones
- **Adaptive layout**: Adjusts to screen size

### Accessibility

Inclusive design:

- **Keyboard navigation**: Full keyboard support
- **Screen reader compatibility**: ARIA labels and semantics
- **High contrast**: Support for visibility needs
- **Focus indicators**: Clear keyboard focus
- **Skip links**: Navigate efficiently

### User Experience

Intuitive interface design:

- **Clean layout**: Uncluttered, focused design
- **Contextual help**: Info buttons and tooltips
- **Clear labeling**: Descriptive form labels
- **Error messages**: Helpful, specific feedback
- **Success confirmation**: Clear completion indicators
- **Loading states**: Progress indicators for long operations

### Customization

Personalize your experience:

- **Language preferences**: Set UI language
- **Theme support**: Light/dark mode (if available)
- **Display preferences**: Adjust text size, density
- **Notification settings**: Control alert preferences

## Security Features

### Data Protection

Keep information secure:

- **Row Level Security**: Database-level access control
- **Encrypted connections**: HTTPS/TLS for all communication
- **Secure authentication**: JWT token-based auth
- **Password hashing**: bcrypt or similar for passwords
- **Session timeout**: Automatic logout after inactivity

### Privacy

Respect user privacy:

- **Data minimization**: Collect only needed data
- **Access controls**: Role-based data access
- **Audit logs**: Track data access and changes
- **Data deletion**: Complete removal on request
- **Export capability**: Users can export their data

## Integration Features

### Supabase Integration

Comprehensive backend integration:

- **Authentication**: Supabase Auth for user management
- **Database**: PostgreSQL with real-time capabilities
- **Storage**: Voice recordings in Supabase Storage
- **Edge Functions**: Serverless for custom logic
- **Real-time subscriptions**: Live data updates

### API Access

Programmatic access:

- **REST API**: Full CRUD operations via Supabase client
- **Authentication API**: User sign in/up/out
- **Annotations API**: Create and retrieve annotations
- **Evaluations API**: Manage evaluations
- **Admin API**: System management functions

### Third-Party Integration

Extensibility:

- **Export formats**: Standard formats for external tools
- **Webhooks**: Event notifications (if configured)
- **API keys**: Secure access for integrations
- **Custom extensions**: Ability to add new features

## Performance Features

### Optimization

Fast and efficient:

- **Lazy loading**: Load content as needed
- **Caching**: Reduce redundant data fetching
- **Debouncing**: Optimize search and input
- **Pagination**: Handle large datasets
- **Indexing**: Fast database queries

### Scalability

Handle growth:

- **Horizontal scaling**: Add more servers as needed
- **Database optimization**: Efficient queries and indexes
- **CDN support**: Fast static asset delivery
- **Load balancing**: Distribute traffic

## Reporting Features

### Built-in Reports

Pre-configured analytics:

- **User activity**: Login frequency, engagement metrics
- **Annotation quality**: Quality scores distribution
- **Error analysis**: Common error patterns
- **Progress reports**: Completion tracking
- **Evaluator performance**: Agreement rates, consistency

### Custom Reports

Generate specific analyses:

- **Date range filtering**: Analyze specific periods
- **User filtering**: Focus on specific users or roles
- **Language pair filtering**: Analyze specific language combinations
- **Export options**: Download reports in various formats

## Future Features

Features planned or in development:

- **Advanced AI models**: Improved quality assessment
- **Collaborative annotation**: Multiple annotators on same sentence
- **Annotation versioning**: Track changes over time
- **Advanced analytics**: Machine learning insights
- **Mobile apps**: Native iOS/Android applications
- **API documentation**: Interactive API documentation interface

## Feature Requests

Have an idea for a new feature?

- Contact your administrator
- Submit via GitHub (if open source)
- Participate in user surveys
- Join user feedback sessions

```{seealso}
For role-specific feature usage, see the [Annotator Guide](annotator-guide.md), [Evaluator Guide](evaluator-guide.md), or [Admin Guide](admin-guide.md).
```
