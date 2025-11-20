# Evaluator Guide

This guide provides comprehensive instructions for evaluators using the Lakra system to review annotations and assess machine translation quality.

## Overview

As an evaluator, your role is to:
- Review annotations created by annotators
- Assess machine translation quality with AI assistance
- Provide constructive feedback on annotation quality
- Validate AI-generated quality assessments
- Track evaluation metrics and maintain quality standards

## Getting Started

### First Login

1. **Access Lakra**: Navigate to your Lakra instance URL
2. **Sign In**: Use your email or username and password
3. **Onboarding**: Complete the evaluator onboarding test if required
4. **Dashboard Access**: You'll see the evaluator dashboard

### Understanding Your Dashboard

Your evaluator dashboard shows:

- **Pending Evaluations**: Annotations awaiting your review
- **Pending Quality Assessments**: Translations needing AI-assisted review
- **Completed Reviews**: Your evaluation history
- **Performance Metrics**: Agreement rates, completion statistics
- **Queue Overview**: Workload distribution

## Evaluation Types

Lakra supports two main evaluation workflows:

### 1. Annotation Evaluation
Review and score annotations created by other annotators

### 2. Quality Assessment
Evaluate machine translation quality with AI assistance

## Annotation Evaluation Workflow

### Step 1: Select an Annotation to Review

1. Navigate to **"Pending Evaluations"**
2. Select an annotation from the list
3. You'll see:
   - Source text
   - Machine translation
   - Annotator's highlights and error markings
   - Annotator's quality ratings
   - Annotator's comments
   - Voice recording (if provided)

### Step 2: Review the Annotation

Carefully examine:

#### Error Highlights
- **Accuracy**: Are highlighted errors actually errors?
- **Completeness**: Are all errors caught?
- **Classification**: Are error types correct (MI_ST, MI_SE, MA_ST, MA_SE)?
- **Descriptions**: Are error explanations clear and accurate?

#### Quality Ratings
- **Fluency**: Does the rating match the translation's naturalness?
- **Adequacy**: Does it correctly reflect meaning preservation?
- **Overall Quality**: Is the holistic assessment appropriate?

#### Comments and Suggestions
- **Clarity**: Are comments understandable?
- **Usefulness**: Do suggestions actually improve the translation?
- **Correctness**: Are proposed corrections accurate?

#### Voice Recording (if present)
- Listen to the entire recording
- Verify explanations match written annotations
- Assess clarity and correctness

### Step 3: Provide Evaluation Scores

Rate the annotation on multiple dimensions (1-5 scale):

#### Accuracy Score

**How correct is the annotation?**

- **5 - Excellent**: All errors correctly identified and classified
- **4 - Good**: Minor issues with identification or classification
- **3 - Fair**: Several errors in accuracy or completeness
- **2 - Poor**: Significant inaccuracies or omissions
- **1 - Very Poor**: Mostly incorrect or incomplete

```{tip}
Compare the annotation against your own expert judgment of the translation.
```

#### Completeness Score

**How thorough is the annotation?**

- **5 - Excellent**: All significant errors caught and documented
- **4 - Good**: Only minor errors missed
- **3 - Fair**: Some important errors missed
- **2 - Poor**: Many errors overlooked
- **1 - Very Poor**: Most errors not identified

#### Overall Annotation Quality

**Your holistic assessment**

- **5 - Excellent**: Publication-ready annotation
- **4 - Good**: Usable with minimal improvements
- **3 - Fair**: Acceptable but needs refinement
- **2 - Poor**: Significant improvements needed
- **1 - Very Poor**: Does not meet quality standards

### Step 4: Provide Detailed Feedback

Write constructive feedback:

1. **Strengths**: What the annotator did well
2. **Areas for Improvement**: Specific issues to address
3. **Missed Errors**: Errors the annotator didn't catch
4. **Classification Issues**: Incorrect error categorizations
5. **Suggestions**: How to improve future annotations

**Best Practices for Feedback:**

✅ **Do**:
- Be specific with examples
- Explain your reasoning
- Offer constructive suggestions
- Acknowledge good work
- Maintain professional tone

❌ **Don't**:
- Use harsh or personal language
- Provide vague criticism
- Focus only on negatives
- Assume bad faith
- Be inconsistent in standards

### Step 5: Submit Evaluation

Before submitting:

1. **Review** all scores
2. **Verify** feedback is constructive and clear
3. **Double-check** for any missed points
4. Click **"Submit Evaluation"**

## Quality Assessment Workflow

Quality Assessment uses AI to help you evaluate machine translation quality efficiently.

### Step 1: Access Quality Assessment

1. Navigate to **"Quality Assessment"** section
2. Select a translation to assess
3. You'll see:
   - Source text
   - Machine translation
   - AI-generated quality scores (if available)
   - AI-detected errors
   - AI explanation of issues

### Step 2: Review AI Assessment

The AI provides:

#### AI Quality Scores
- **Fluency Score**: AI assessment of naturalness
- **Adequacy Score**: AI assessment of meaning preservation
- **Overall Quality Score**: AI holistic rating
- **Confidence Levels**: How confident the AI is in its scores

#### AI Error Detection
- **Syntax Errors**: Grammatical issues detected
- **Semantic Errors**: Meaning-related problems
- **Error Locations**: Highlighted problematic spans
- **Severity Levels**: Minor vs. major issues

#### AI Explanations
- **Reasoning**: Why the AI gave these scores
- **Specific Issues**: Detailed problem descriptions
- **Improvement Suggestions**: AI-generated recommendations

### Step 3: Validate AI Assessment

Your job is to:

1. **Review AI Findings**: Are they accurate?
2. **Confirm or Reject**: Accept or modify AI suggestions
3. **Add Human Insight**: Provide expert judgment
4. **Identify Missed Issues**: Find what AI didn't catch

#### Feedback Options

- **✓ Confirm**: AI assessment is correct
- **✗ Reject**: AI assessment is wrong (provide reason)
- **⚠ Modify**: Partial agreement (adjust scores/explanations)

### Step 4: Provide Your Assessment

Based on AI suggestions and your expertise:

1. **Set Final Scores**: Adjust AI scores if needed
2. **Add Comments**: Explain your decisions
3. **Highlight Additional Issues**: Mark missed errors
4. **Provide Recommendations**: Suggest improvements

### Step 5: Submit Quality Assessment

Review and submit your validated assessment.

## Evaluation Best Practices

### Maintaining Consistency

1. **Use Guidelines**: Follow established criteria strictly
2. **Calibrate Regularly**: Review example evaluations
3. **Document Standards**: Keep notes on edge cases
4. **Discuss with Peers**: Align understanding with other evaluators

### Being Fair and Objective

- **Focus on Work, Not Person**: Evaluate the annotation, not the annotator
- **Apply Standards Equally**: Same criteria for all annotations
- **Consider Context**: Sentence difficulty, language pair complexity
- **Avoid Bias**: Don't let previous annotations influence current review

### Providing Valuable Feedback

**Effective Feedback Structure:**

```
✓ STRENGTHS:
- Correctly identified all major semantic errors
- Clear and detailed error descriptions
- Appropriate quality ratings for fluency

⚠ AREAS FOR IMPROVEMENT:
- Missed minor punctuation issues (line 2, "example")
- Could be more specific in correction suggestions
- Consider the domain context for terminology choices

💡 SUGGESTIONS:
- Review guidelines on minor syntax classification
- Try providing alternative translations in comments
- Great work overall - keep up the attention to detail!
```

## Working with AI Assistance

### Understanding AI Capabilities

**AI is good at:**
- Pattern recognition for common errors
- Objective grammar checking
- Consistency in scoring
- Processing large volumes

**AI has limitations with:**
- Cultural context and nuance
- Domain-specific terminology
- Creative or figurative language
- Ambiguous cases requiring human judgment

### When to Override AI

Trust your expertise and override AI when:

- AI misses cultural nuances
- Domain knowledge is needed
- Context is misunderstood
- Scores seem inconsistent with actual quality
- Explanations are wrong or misleading

### Improving AI Performance

Your feedback helps train the system:

- **Be specific** about why you disagree
- **Provide examples** of correct assessments
- **Note patterns** in AI mistakes
- **Report systematic issues** to administrators

## Interface Guide

### Annotation Review Interface

**Main Panel:**
- Split view: source and machine translation
- Highlight overlay showing annotator's marks
- AI suggestions panel (if enabled)

**Sidebar:**
- Annotation details
- Annotator information
- Quality ratings
- Comments and voice recordings

**Evaluation Form:**
- Score inputs
- Feedback text area
- Submit/Cancel buttons

### Quality Assessment Interface

**Main Panel:**
- Source and translation display
- AI quality scores
- AI-detected errors
- Confidence indicators

**Sidebar:**
- Validation controls (Confirm/Reject/Modify)
- Your assessment form
- Additional notes

**Control Panel:**
- Navigation between assessments
- Filter and search options
- Export functionality

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `→` | Next evaluation |
| `←` | Previous evaluation |
| `Ctrl/Cmd + Enter` | Submit evaluation |
| `Tab` | Move to next field |
| `1-5` | Quick rating (when focused on score) |
| `A` | Confirm AI suggestion |
| `R` | Reject AI suggestion |

## Metrics and Performance

### Your Performance Indicators

Track your evaluation quality:

#### Agreement Rates
- **Inter-evaluator Agreement**: Match with other evaluators
- **AI Agreement Rate**: How often you confirm AI assessments
- **Consistency Score**: Variation in your own judgments

#### Productivity Metrics
- **Evaluations Completed**: Total count
- **Average Time per Evaluation**: Efficiency indicator
- **Queue Processing Rate**: Workflow velocity

#### Quality Indicators
- **Feedback Quality**: How helpful your comments are
- **Accuracy Recognition**: When your assessments match expert consensus
- **Calibration Score**: Alignment with standards

### Improving Your Performance

1. **Review Feedback**: Learn from quality assurance reviews
2. **Study Disagreements**: Understand why others rated differently
3. **Attend Calibration Sessions**: Align with team standards
4. **Request Difficult Cases**: Challenge yourself to improve
5. **Track Trends**: Monitor your metrics over time

## Handling Special Cases

### Difficult Evaluations

**Borderline Quality:**
- Use half-points or detailed explanations
- Document decision rationale
- Consider requesting second opinion

**Ambiguous Errors:**
- Note the ambiguity in feedback
- Explain multiple valid interpretations
- Defer to guidelines when possible

**Incomplete Annotations:**
- Note what's missing
- Provide guidance on completeness
- Score based on what's present

### Disagreeing with Annotators

When you significantly disagree:

1. **Double-check**: Ensure you're correct
2. **Explain Clearly**: Detailed reasoning in feedback
3. **Be Respectful**: Professional, constructive tone
4. **Provide Examples**: Show correct approach
5. **Flag for Review**: Escalate if needed

### AI Errors or Bugs

If you encounter system issues:

1. **Document**: Screenshot and describe the problem
2. **Report**: Use the feedback/bug report feature
3. **Work Around**: Complete evaluation manually if possible
4. **Note in Comments**: Mention technical issue encountered

## FAQ for Evaluators

**Q: How long should each evaluation take?**
A: Typically 10-15 minutes, but varies with complexity. Quality over speed.

**Q: What if I'm unsure about a rating?**
A: Use the middle range (3) and explain your uncertainty in comments. Flag for a second review if needed.

**Q: Should I always trust the AI assessment?**
A: No. Use AI as a helpful tool, but apply your expert judgment. Override when necessary.

**Q: How harsh should I be in evaluations?**
A: Be fair and accurate. Focus on helping annotators improve, not being punitive.

**Q: Can annotators see who evaluated their work?**
A: This depends on system configuration. Ask your administrator.

**Q: What if I find a major error in many annotations?**
A: Report the pattern to administrators - may indicate need for additional annotator training.

## Tips for Success

### Effective Evaluation Strategies

1. **First Pass**: Quick overview to understand the annotation
2. **Detailed Review**: Careful examination of each highlighted error
3. **Comparison**: Check against your own expert assessment
4. **Feedback Composition**: Write clear, helpful comments
5. **Final Review**: Double-check scores and feedback before submitting

### Managing Workload

- **Prioritize**: Start with oldest or most critical evaluations
- **Batch Similar**: Group evaluations by language pair or annotator
- **Take Breaks**: Prevent fatigue affecting judgment
- **Set Daily Goals**: Maintain steady progress
- **Balance**: Mix easy and difficult evaluations

### Continuous Improvement

- **Learn from Feedback**: Apply quality assurance input
- **Stay Current**: Review guideline updates
- **Participate in Calibration**: Regular alignment sessions
- **Share Knowledge**: Discuss challenging cases with peers
- **Mentor Annotators**: Help improve overall quality

## Next Steps

- Practice with sample evaluations
- Review the [Features](features.md) documentation
- Check the [FAQ](faq.md) for additional questions
- Consult the [Technical Manual](../technical-manual/index.rst) for system details

```{seealso}
For information on annotation standards, see the [Annotator Guide](annotator-guide.md).
```
