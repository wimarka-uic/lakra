# Annotator Guide

This guide provides comprehensive instructions for annotators using the Lakra system to evaluate and annotate machine translations.

## Overview

As an annotator, your role is to:
- Review source texts and their machine translations
- Identify and classify translation errors
- Provide quality ratings
- Suggest corrections
- Optionally record voice explanations

## Getting Started

### First Login

1. **Access Lakra**: Navigate to your Lakra instance URL
2. **Sign In**: Use your email or username and password
3. **Onboarding**: Complete the onboarding test if required
   - The test ensures you understand the annotation guidelines
   - You must pass to start annotating
   - You can retake the test if needed

### Understanding Your Dashboard

After logging in, you'll see:

- **Progress Statistics**: Your annotation count, completion rate
- **Recent Annotations**: Your most recent work
- **Available Sentences**: Number of sentences awaiting annotation
- **Quality Metrics**: Your average quality scores
- **Start Annotation Button**: Begin working

## The Annotation Workflow

### Step 1: Select a Sentence

1. Click **"Start Annotation"** or **"Next Sentence"**
2. The system automatically selects the next unannotated sentence
3. You'll see:
   - Source text (original language)
   - Machine translation (target language)
   - Language pair information
   - Domain (if specified)

### Step 2: Review the Translation

Before annotating:

1. **Read the source text** carefully
2. **Read the machine translation**
3. **Compare** them for accuracy and fluency
4. **Consider** the context and domain

### Step 3: Highlight Errors

#### How to Highlight Text

1. **Select text** in the machine translation by clicking and dragging
2. A **highlight menu** appears
3. **Choose error type**:
   - **MI_ST** (Minor Syntax): Small grammatical errors
   - **MI_SE** (Minor Semantic): Minor meaning issues
   - **MA_ST** (Major Syntax): Serious grammatical problems
   - **MA_SE** (Major Semantic): Significant meaning errors
4. Click to create the highlight

#### Error Type Guidelines

**Minor Syntax (MI_ST)**
- Articles (a/an/the) errors
- Punctuation issues
- Minor word order problems
- Capitalization errors

Examples:
- "the house" → "a house" (wrong article)
- "Hello." → "Hello" (missing punctuation)

**Minor Semantic (MI_SE)**
- Word choice issues that don't change core meaning
- Awkward but understandable phrasing
- Minor omissions of non-critical information

Examples:
- "big" → "large" (better word choice available)
- Slightly awkward phrasing that's still clear

**Major Syntax (MA_ST)**
- Verb tense errors
- Subject-verb agreement problems
- Sentence fragments
- Severe word order issues

Examples:
- "He go" → "He goes" (subject-verb agreement)
- Completely garbled sentence structure

**Major Semantic (MA_SE)**
- Incorrect meaning
- Missing critical information
- Added incorrect information
- Complete mistranslation

Examples:
- Translating "yes" as "no"
- Omitting critical details
- Adding ideas not in source

#### Managing Highlights

- **Edit**: Click a highlight to view/edit it
- **Delete**: Use the delete button in the highlight editor
- **View All**: See all highlights in the sidebar
- **Add Description**: Explain the error in detail (recommended)

### Step 4: Quality Ratings

Rate the translation on three dimensions (1-5 scale):

#### Fluency Rating

**How natural does the translation read?**

- **5 - Perfect**: Native-sounding, completely natural
- **4 - Good**: Natural with minor awkwardness
- **3 - Fair**: Understandable but somewhat awkward
- **2 - Poor**: Difficult to read, many issues
- **1 - Very Poor**: Incomprehensible, severe problems

```{tip}
Read the translation aloud. Does it sound natural to a native speaker?
```

#### Adequacy Rating

**How well does it convey the source meaning?**

- **5 - Perfect**: All meaning preserved accurately
- **4 - Good**: Minor details missing or altered
- **3 - Fair**: Some meaning lost or changed
- **2 - Poor**: Significant meaning lost
- **1 - Very Poor**: Mostly incorrect meaning

```{tip}
Compare closely with the source. Is all information present and correct?
```

#### Overall Quality Rating

**Your holistic assessment of the translation**

- **5 - Excellent**: Publication-ready
- **4 - Good**: Usable with minor edits
- **3 - Fair**: Needs moderate revision
- **2 - Poor**: Requires significant work
- **1 - Very Poor**: Needs complete retranslation

### Step 5: Provide Comments

Add detailed feedback:

1. **Error Descriptions**: Explain each highlighted error
2. **Suggested Corrections**: Provide better translations
3. **General Comments**: Overall observations
4. **Context Notes**: Relevant background information

**Best Practices:**
- Be specific and constructive
- Explain why something is wrong
- Suggest concrete improvements
- Consider cultural context

### Step 6: Voice Recording (Optional)

Record audio explanations:

1. Click **"Record Voice"** button
2. **Allow** microphone access (first time only)
3. Click **"Start Recording"**
4. Speak your explanation clearly
5. Click **"Stop Recording"**
6. **Play back** to verify
7. **Re-record** if needed
8. Click **"Save Recording"**

**Tips for Good Recordings:**
- Use a quiet environment
- Speak clearly and at moderate pace
- Explain corrections in detail
- Keep recordings focused (under 2 minutes)

### Step 7: Submit Annotation

Before submitting:

1. **Review** all highlights and ratings
2. **Verify** comments are clear
3. **Check** voice recording (if added)
4. Click **"Submit Annotation"**

```{note}
Once submitted, you typically cannot edit the annotation. Review carefully!
```

## Annotation Best Practices

### Quality Guidelines

1. **Be Consistent**: Apply the same standards to all sentences
2. **Be Objective**: Base ratings on guidelines, not personal preference
3. **Be Thorough**: Don't miss errors, but don't over-mark
4. **Be Specific**: Clear, detailed descriptions help everyone

### Common Mistakes to Avoid

❌ **Don't**:
- Mark stylistic preferences as errors
- Be too harsh or too lenient
- Skip providing explanations
- Rush through sentences
- Ignore context

✅ **Do**:
- Focus on actual errors
- Maintain balanced judgment
- Explain your reasoning
- Take time to understand fully
- Consider the domain

### Time Management

- **Average time**: 5-10 minutes per sentence (varies by complexity)
- **Take breaks**: Every 45-60 minutes
- **Track progress**: Monitor your statistics
- **Set goals**: Aim for quality over quantity

## Working with Different Language Pairs

### Source Language Considerations

- **Understand context**: Cultural references, idioms
- **Check ambiguity**: Multiple possible interpretations
- **Note style**: Formal vs. informal register

### Target Language Considerations

- **Natural phrasing**: Does it sound native?
- **Grammar rules**: Language-specific conventions
- **Cultural adaptation**: Appropriate localization

## Using the Annotation Interface

### Interface Components

**Main Panel:**
- Source text display
- Machine translation display
- Highlight overlay
- Quality rating sliders

**Sidebar:**
- Highlighted errors list
- Comments section
- Voice recorder
- Submit button

**Top Bar:**
- Progress indicator
- Guidelines button (ℹ️)
- Sentence navigation
- Account menu

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Move to next rating |
| `1-5` | Quick rating (when focused) |
| `Ctrl/Cmd + S` | Save (submit) annotation |
| `Ctrl/Cmd + G` | Open guidelines |
| `Esc` | Cancel highlight |

```{tip}
Hover over interface elements for tooltips and additional information.
```

## Quality Metrics and Feedback

### Your Performance Metrics

Track your annotation quality:

- **Completion Rate**: Sentences annotated vs. assigned
- **Average Ratings**: Your typical quality scores
- **Error Distribution**: Types of errors you identify
- **Agreement Rate**: Match with other annotators (if applicable)
- **Evaluation Scores**: How evaluators rate your work

### Receiving Feedback

Evaluators may provide feedback on your annotations:

- **Access feedback**: View in "My Annotations" section
- **Learn from reviews**: Understand evaluator comments
- **Improve quality**: Apply feedback to future work
- **Ask questions**: Contact administrators if unclear

## Troubleshooting

### Common Issues

**Can't highlight text:**
- Make sure you're selecting text in the translation (not source)
- Try refreshing the page
- Check your browser compatibility

**Rating sliders not working:**
- Click directly on the slider track
- Use keyboard arrow keys when focused
- Try a different browser if persistent

**Voice recording fails:**
- Allow microphone permissions
- Check microphone is connected/working
- Try a different browser
- Ensure HTTPS connection

**Annotation won't submit:**
- Complete all required fields
- Check all ratings are set
- Verify at least some highlights or comments
- Check internet connection

## Tips for Success

### Becoming a Better Annotator

1. **Study guidelines regularly**: Refresh your understanding
2. **Review examples**: Learn from expert annotations
3. **Discuss with peers**: Share insights and questions
4. **Track improvement**: Monitor your metrics over time
5. **Stay updated**: Note any guideline changes

### Maintaining Quality

- **Regular breaks**: Prevent fatigue and maintain focus
- **Consistent environment**: Minimize distractions
- **Question ambiguity**: Ask when unsure
- **Continuous learning**: Improve with each annotation

## FAQ for Annotators

**Q: How many sentences should I annotate per day?**
A: Focus on quality over quantity. Typical range is 10-20 sentences per day, depending on complexity.

**Q: Can I skip a difficult sentence?**
A: Contact your administrator. Some systems allow skipping, others require annotation of assigned sentences.

**Q: What if I disagree with the error types?**
A: Follow the guidelines as closely as possible. You can note disagreements in comments.

**Q: Can I edit an annotation after submitting?**
A: Usually no. Double-check before submitting. Contact your administrator if critical corrections are needed.

**Q: What if the source text seems wrong?**
A: Note this in your comments. Annotate the translation based on what it should be if the source were correct.

## Next Steps

- Practice with example sentences
- Review the [Features](features.md) documentation
- Check the [FAQ](faq.md) for more questions
- Contact your administrator for role-specific guidance

```{seealso}
For technical details about the annotation system, see the [Technical Manual](../technical-manual/index.rst).
```
