# Frequently Asked Questions (FAQ)

Find answers to common questions about using Lakra.

## General Questions

### What is Lakra?

Lakra is a comprehensive annotation and evaluation system for machine translation quality assessment, designed for the WiMarka project. It combines AI-powered assessment with human-in-the-loop evaluation to provide comprehensive quality analysis.

### Who can use Lakra?

Lakra is designed for three main types of users:
- **Annotators**: Evaluate and annotate machine translations
- **Evaluators**: Review annotations and assess quality
- **Administrators**: Manage users, content, and system settings

### What browsers are supported?

Lakra works best on modern browsers:
- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Microsoft Edge
- ⚠️ Internet Explorer is **not supported**

### Is Lakra open source?

Check the repository license. The current version uses the MIT License, allowing free use, modification, and distribution.

## Account and Authentication

### How do I create an account?

Accounts are created by administrators. Contact your system administrator to request an account.

### Can I use both email and username to log in?

Yes! Lakra supports both:
- Sign in with **email + password**
- Sign in with **username + password**

Use whichever you prefer.

### I forgot my password. What do I do?

1. Click **"Forgot Password"** on the login page
2. Enter your email address
3. Check your email for a reset link
4. Follow the link to set a new password

If you don't receive the email, check your spam folder or contact your administrator.

### Can I change my password?

Yes! After logging in:
1. Go to your **Profile** or **Settings**
2. Select **"Change Password"**
3. Enter your current password and new password
4. Click **"Update Password"**

### What if I can't log in?

Common issues:
- ✓ Check your credentials are correct
- ✓ Verify Caps Lock is off
- ✓ Ensure your account is active (contact admin)
- ✓ Try password reset
- ✓ Clear browser cache and cookies
- ✓ Try a different browser

## For Annotators

### Do I need to complete an onboarding test?

This depends on your organization's requirements. If required, you'll be prompted to complete the test after your first login. You must pass the test before you can start annotating.

### Can I retake the onboarding test if I fail?

Yes, you can typically retake the test. Check with your administrator about any waiting periods or attempt limits.

### How do I start annotating?

1. Log in to your account
2. Complete onboarding if required
3. Click **"Start Annotation"** or **"Next Sentence"**
4. Follow the annotation workflow
5. Submit your annotation when complete

### Can I save my work without submitting?

Some implementations support auto-save drafts. Check if your instance has this feature. Otherwise, complete and submit each annotation in one session.

### Can I edit an annotation after submitting?

Usually no. Once submitted, annotations are typically final. Review carefully before submitting. Contact your administrator if you need to make critical corrections.

### How many sentences should I annotate?

This varies by project. Common targets are 10-20 sentences per day, but prioritize quality over quantity. Check with your administrator for specific expectations.

### What if I don't understand the source language well?

You should be assigned sentences in language pairs you're qualified for. If you receive an inappropriate assignment, contact your administrator.

### Can I skip a difficult sentence?

Depends on your system configuration. Some allow skipping, others do not. Contact your administrator to clarify the policy.

### What if the source text seems wrong?

Note this in your comments field. Annotate the translation based on what it should be if the source were correct, and explain the source text issue in your comments.

### How long should each annotation take?

Typical range is 5-15 minutes per sentence, depending on complexity. Don't rush - quality is more important than speed.

### What makes a good annotation?

- Accurate error identification
- Correct error classification
- Clear, specific descriptions
- Appropriate quality ratings
- Constructive suggestions
- Thoughtful, thorough review

## For Evaluators

### How do I know which annotations to review?

Check your **"Pending Evaluations"** queue. The system typically assigns annotations automatically, or you can select from available options.

### Should I always agree with the AI assessment?

No. Use AI as a helpful tool, but apply your expert judgment. Override AI suggestions when they're incorrect or incomplete.

### How should I handle borderline cases?

- Use the middle of the scale (rating of 3)
- Provide detailed explanation in comments
- Note the ambiguity and your reasoning
- Flag for second opinion if very uncertain

### Can annotators see my feedback?

This depends on system configuration. Ask your administrator about feedback visibility settings.

### How should I write constructive feedback?

**Good feedback:**
- Specific examples
- Clear explanations
- Both positives and improvements
- Actionable suggestions
- Professional, respectful tone

**Avoid:**
- Vague criticism
- Personal attacks
- Only negatives
- Inconsistent standards

### What if I strongly disagree with an annotation?

1. Double-check you're applying guidelines correctly
2. Provide detailed, specific feedback
3. Use appropriate low scores if warranted
4. Maintain professional tone
5. Flag for administrator review if needed

### How long should evaluations take?

Typically 10-15 minutes per annotation review, but varies with complexity. Focus on thorough, quality evaluations.

## For Administrators

### How do I add new users?

Two methods:
1. **Individual**: Use "Add User" form in User Management
2. **Bulk**: Upload CSV file with multiple users

See the [Admin Guide](admin-guide.md) for detailed instructions.

### What's the best way to import many sentences?

Use the **CSV Bulk Import** feature:
1. Prepare CSV with required columns
2. Navigate to Bulk Import → Sentences
3. Upload and validate
4. Confirm import

See [Admin Guide](admin-guide.md) for CSV format details.

### Can I recover deleted users or sentences?

Only from database backups. Deletion is permanent. Consider **deactivating** instead of deleting to preserve data.

### How do I check system logs?

Navigate to **System → Logs** in the admin panel. Filter by date, type, or user as needed.

### What's the recommended backup strategy?

- **Frequency**: Daily automated backups
- **Retention**: At least 30 days
- **Location**: Off-server storage (AWS S3, Google Cloud, etc.)
- **Testing**: Regular restore tests

### How do I handle quality issues with an annotator?

1. Review specific problematic annotations
2. Provide detailed, constructive feedback
3. Check if additional training is needed
4. Monitor for improvement
5. Consider additional onboarding if issues persist
6. Deactivate if quality doesn't improve

## Technical Questions

### Voice recording doesn't work. Why?

Common issues:
- **Microphone permissions**: Allow browser access
- **No microphone**: Check device has working microphone
- **Browser compatibility**: Try Chrome or Firefox
- **HTTPS required**: Voice recording requires secure connection
- **Browser settings**: Check microphone isn't blocked in settings

### Why is the page loading slowly?

Possible causes:
- **Internet connection**: Check your network speed
- **Server load**: Peak usage times may be slower
- **Browser cache**: Clear cache and refresh
- **Many annotations**: Large datasets can slow loading
- **Old browser**: Update to latest version

### Can I use Lakra on my phone?

Yes! Lakra has a responsive design that works on mobile devices. However, some features (especially annotation) work better on larger screens. Tablets are recommended as the minimum for comfortable annotation.

### Is my data secure?

Yes. Lakra uses:
- HTTPS encryption for all data transmission
- Row Level Security in the database
- Secure authentication with JWT tokens
- Private storage for voice recordings
- Access controls by role

### Can I export my data?

Yes. Depending on your role:
- **All users**: Can typically export their own annotations/evaluations
- **Administrators**: Can export all system data

Use the Reports or Export features in the interface.

### What happens to my voice recordings?

Voice recordings are:
- Stored securely in Supabase Storage
- Accessible only to authorized users
- Served via secure signed URLs
- Subject to retention policies (check with admin)

## Error Messages

### "Failed to fetch" or "Network error"

**Causes:**
- Internet connection lost
- Server is down
- CORS configuration issue
- API key invalid

**Solutions:**
- Check internet connection
- Refresh the page
- Try again in a few minutes
- Contact administrator if persists

### "Unauthorized" or "Authentication failed"

**Causes:**
- Session expired
- Incorrect credentials
- Account deactivated
- Role permissions changed

**Solutions:**
- Log out and log in again
- Verify credentials are correct
- Contact administrator to check account status

### "Validation error" on submit

**Causes:**
- Required fields missing
- Invalid data format
- Data doesn't meet requirements

**Solutions:**
- Check all required fields are filled
- Verify quality ratings are set
- Review error message for specific field
- Ensure highlights or comments are present

### "Database error"

**Causes:**
- Server-side database issue
- Data integrity problem
- Permission issue

**Solutions:**
- Refresh and try again
- Report to administrator
- Check system status page (if available)

## Best Practices

### How can I improve my annotation quality?

1. **Study guidelines** thoroughly and regularly
2. **Review examples** of good annotations
3. **Take your time** - rush leads to errors
4. **Be consistent** in applying standards
5. **Learn from feedback** provided by evaluators
6. **Ask questions** when uncertain
7. **Take breaks** to maintain focus

### Tips for efficient evaluation?

1. **Familiarize with common patterns** in your language pair
2. **Use keyboard shortcuts** when available
3. **Batch similar evaluations** together
4. **Set daily goals** for consistency
5. **Take frequent breaks** (every 45-60 minutes)
6. **Track your metrics** to monitor performance

### How do I maintain work-life balance?

- Set reasonable daily goals
- Take regular breaks
- Don't overwork - quality suffers
- Disconnect after work hours
- Communicate with administrator about workload

## Getting Help

### Where can I find more detailed help?

- **User Guides**: Role-specific detailed documentation
  - [Annotator Guide](annotator-guide.md)
  - [Evaluator Guide](evaluator-guide.md)
  - [Admin Guide](admin-guide.md)
- **Features**: Complete [Features documentation](features.md)
- **Technical**: [Technical Manual](../technical-manual/index.rst)

### How do I report a bug?

1. Document the issue:
   - What you were doing
   - What happened
   - What you expected
   - Screenshots if applicable
2. Check if it's a known issue
3. Contact your administrator
4. Or file an issue on GitHub (if open source)

### How do I request a new feature?

- Contact your administrator with your idea
- Explain the use case and benefit
- Participate in user feedback sessions
- Submit feature requests via GitHub (if open source)

### Who do I contact for support?

- **First line**: Your system administrator
- **Technical issues**: IT support or development team
- **Account issues**: Administrator
- **Training**: Your organization's training coordinator

## Still Have Questions?

If your question isn't answered here:

1. Check the relevant user guide for your role
2. Review the [Technical Manual](../technical-manual/index.rst) for technical details
3. Contact your system administrator
4. Check the project repository for additional documentation

```{tip}
Keep this FAQ bookmarked for quick reference!
```
