# Evaluator Guide

## Overview

This guide is designed for evaluators who assess the quality of annotations and machine translations in the Lakra system. Evaluators play a crucial role in maintaining annotation quality and providing feedback to annotators.

## Table of Contents

1. [Getting Started as an Evaluator](#getting-started-as-an-evaluator)
2. [Evaluator Dashboard](#evaluator-dashboard)
3. [Annotation Evaluation](#annotation-evaluation)
4. [MT Quality Assessment](#mt-quality-assessment)
5. [Evaluation Criteria](#evaluation-criteria)
6. [Feedback and Communication](#feedback-and-communication)
7. [Best Practices](#best-practices)
8. [Performance Metrics](#performance-metrics)
9. [Advanced Features](#advanced-features)
10. [Troubleshooting](#troubleshooting)

## Getting Started as an Evaluator

### Evaluator Role Assignment

Evaluators are assigned by system administrators and have special permissions to:
- Review and evaluate annotations
- Assess machine translation quality
- Provide feedback to annotators
- Access evaluation statistics and metrics
- Participate in quality control processes

### First Time Setup

1. **Login with Evaluator Account**
   - Use your assigned evaluator credentials
   - Verify your role shows "Evaluator" in the interface

2. **Complete Evaluator Training**
   - Review evaluation guidelines
   - Understand quality assessment criteria
   - Practice with sample evaluations

3. **Access Evaluator Dashboard**
   - Navigate to the evaluator-specific dashboard
   - Familiarize yourself with evaluation queues
   - Review available evaluation tasks

### Evaluator Interface Overview

The evaluator interface includes:
- **Evaluation Queue**: Pending annotations to evaluate
- **MT Quality Queue**: Machine translations to assess
- **Statistics Dashboard**: Performance metrics and progress
- **Feedback Center**: Communication with annotators
- **Quality Reports**: System-wide quality metrics

## Evaluator Dashboard

### Dashboard Components

#### Work Queue Summary
- **Pending Evaluations**: Number of annotations waiting for evaluation
- **Completed Today**: Evaluations completed in the current day
- **Average Time**: Average time spent per evaluation
- **Quality Metrics**: Overall quality scores and trends

#### Quick Actions
- **Start Evaluation**: Begin evaluating annotations
- **MT Quality Assessment**: Assess machine translation quality
- **Review Feedback**: Check annotator responses
- **Generate Reports**: Create quality assessment reports

#### Progress Tracking
- **Daily Goals**: Target evaluations per day
- **Weekly Progress**: Evaluation completion trends
- **Quality Trends**: Quality score patterns over time
- **Feedback Impact**: Response rates to feedback

### Navigation

- **Evaluation Queue**: `/evaluations/queue` - Pending annotation evaluations
- **MT Quality**: `/mt-quality` - Machine translation assessments
- **My Evaluations**: `/evaluations/my-evaluations` - Your completed evaluations
- **Statistics**: `/evaluations/stats` - Performance metrics
- **Feedback**: `/evaluations/feedback` - Communication center

## Annotation Evaluation

### Evaluation Process

#### Step 1: Select Annotation for Evaluation
1. Navigate to the evaluation queue
2. Review available annotations
3. Select an annotation to evaluate
4. Review annotation details and context

#### Step 2: Review Original Content
1. **Source Text**: Read the original text carefully
2. **Machine Translation**: Understand the machine-generated translation
3. **Language Pair**: Note the source and target languages
4. **Domain Context**: Consider the text domain (medical, legal, etc.)

#### Step 3: Assess Annotator's Work
1. **Quality Scores**: Review fluency, adequacy, and overall quality scores
2. **Error Identification**: Check highlighted errors and classifications
3. **Comments**: Read annotator's explanations and reasoning
4. **Final Form**: Evaluate the corrected translation provided
5. **Voice Recording**: Listen to pronunciation recordings if available

#### Step 4: Provide Evaluation Scores

**Annotation Quality Score (1-5 scale)**:
- **5**: Excellent annotation - thorough, accurate, well-explained
- **4**: Good annotation - mostly accurate with minor issues
- **3**: Fair annotation - adequate but with some concerns
- **2**: Poor annotation - significant issues or inaccuracies
- **1**: Very poor annotation - major problems throughout

**Accuracy Score (1-5 scale)**:
- **5**: Perfect accuracy in error identification and classification
- **4**: Mostly accurate with minor misclassifications
- **3**: Generally accurate but some errors missed or misclassified
- **2**: Several accuracy issues in error identification
- **1**: Major accuracy problems throughout

**Completeness Score (1-5 scale)**:
- **5**: Comprehensive coverage of all issues
- **4**: Good coverage with minor omissions
- **3**: Adequate coverage but some issues overlooked
- **2**: Significant gaps in coverage
- **1**: Major omissions throughout

**Overall Evaluation Score (1-5 scale)**:
- **5**: Exceptional work - model annotation
- **4**: High quality work - above expectations
- **3**: Satisfactory work - meets requirements
- **2**: Below expectations - needs improvement
- **1**: Unsatisfactory work - requires significant improvement

#### Step 5: Provide Detailed Feedback
1. **Positive Feedback**: Acknowledge good work and correct identifications
2. **Constructive Criticism**: Point out areas for improvement
3. **Specific Examples**: Reference specific errors or good practices
4. **Guidance**: Provide actionable suggestions for improvement
5. **Encouragement**: Motivate continued quality work

#### Step 6: Submit Evaluation
1. Review all scores and feedback
2. Ensure feedback is constructive and helpful
3. Submit the evaluation
4. System notifies annotator of feedback

### Evaluation Criteria

#### Error Classification Assessment

**Syntax/Grammar Errors**:
- Correct identification of grammatical issues
- Appropriate severity classification (minor vs. major)
- Accurate understanding of syntactic problems

**Semantic Errors**:
- Proper identification of meaning-related issues
- Correct classification of semantic problems
- Understanding of context and cultural nuances

**Error Severity**:
- **Minor (MI)**: Small issues that don't significantly impact understanding
- **Major (MA)**: Significant problems that affect comprehension or acceptability

#### Quality Score Assessment

**Fluency Evaluation**:
- Does the score reflect natural language flow?
- Are grammatical issues appropriately weighted?
- Is the scoring consistent with examples?

**Adequacy Evaluation**:
- Does the score reflect meaning preservation?
- Are information gaps properly identified?
- Is cultural context considered?

**Overall Quality**:
- Is the overall score a reasonable synthesis?
- Does it reflect the translation's usability?
- Is it consistent with component scores?

## MT Quality Assessment

### AI-Powered Quality Assessment

The system includes AI-powered machine translation quality assessment using DistilBERT models.

#### Assessment Process

1. **Select MT for Assessment**
   - Choose from the MT quality queue
   - Review sentence pair and context
   - Note AI-generated preliminary assessment

2. **Review AI Assessment**
   - **Fluency Score**: AI-generated fluency rating
   - **Adequacy Score**: AI-generated adequacy rating
   - **Overall Quality**: AI-generated overall score
   - **Syntax Errors**: Automatically detected syntax issues
   - **Semantic Errors**: Automatically detected semantic issues
   - **Confidence Score**: AI model confidence level

3. **Human Evaluation**
   - Verify AI assessment accuracy
   - Provide human judgment scores
   - Identify errors missed by AI
   - Correct any misclassifications

4. **Feedback and Correction**
   - **Human Feedback**: Your assessment of AI accuracy
   - **Correction Notes**: Specific corrections to AI assessment
   - **Additional Comments**: Context the AI might miss
   - **Final Scores**: Human-verified quality scores

#### AI Assessment Metrics

**Model Performance**:
- **Accuracy**: How often AI scores match human evaluators
- **Consistency**: Variance in AI scoring across similar translations
- **Confidence**: Model confidence in its assessments
- **Coverage**: Percentage of errors correctly identified

**Quality Indicators**:
- **Fluency Confidence**: AI confidence in fluency assessment
- **Adequacy Confidence**: AI confidence in adequacy assessment
- **Error Detection Rate**: Percentage of errors found by AI
- **False Positive Rate**: Incorrect error identifications

### MT Quality Workflow

1. **Queue Management**
   - Prioritize assessments by importance
   - Balance AI and human evaluation workload
   - Track assessment completion rates

2. **Assessment Validation**
   - Verify AI-generated scores
   - Correct algorithmic mistakes
   - Provide human context

3. **Feedback Loop**
   - Report AI accuracy issues
   - Contribute to model improvement
   - Track assessment quality over time

## Evaluation Criteria

### Comprehensive Evaluation Framework

#### 1. Technical Accuracy
- **Error Identification**: Correct spotting of translation errors
- **Classification**: Proper categorization of error types
- **Severity Assessment**: Appropriate minor/major distinctions
- **Coverage**: Thoroughness in finding all issues

#### 2. Linguistic Competence
- **Source Language Understanding**: Correct interpretation of original text
- **Target Language Proficiency**: Appropriate target language expectations
- **Cultural Context**: Understanding of cultural nuances
- **Domain Knowledge**: Relevant field-specific knowledge

#### 3. Annotation Quality
- **Explanation Quality**: Clear, helpful comments
- **Correction Accuracy**: Correct final form translations
- **Consistency**: Uniform application of standards
- **Completeness**: Thorough coverage of all aspects

#### 4. Professional Standards
- **Objectivity**: Unbiased assessment
- **Constructiveness**: Helpful, actionable feedback
- **Timeliness**: Prompt evaluation completion
- **Communication**: Clear, professional feedback

### Scoring Guidelines

#### Calibration Standards

**Score 5 (Excellent)**:
- Zero errors in evaluation
- Comprehensive coverage
- Excellent explanations
- Professional presentation

**Score 4 (Good)**:
- Minor evaluation errors
- Good coverage
- Clear explanations
- Professional work

**Score 3 (Fair)**:
- Some evaluation errors
- Adequate coverage
- Acceptable explanations
- Meets basic standards

**Score 2 (Poor)**:
- Significant evaluation errors
- Limited coverage
- Unclear explanations
- Below standards

**Score 1 (Very Poor)**:
- Major evaluation errors
- Poor coverage
- Confusing explanations
- Unacceptable quality

## Feedback and Communication

### Providing Effective Feedback

#### Feedback Principles

1. **Be Specific**: Reference specific examples and errors
2. **Be Constructive**: Focus on improvement opportunities
3. **Be Positive**: Acknowledge good work
4. **Be Clear**: Use clear, understandable language
5. **Be Actionable**: Provide specific suggestions

#### Feedback Structure

**Positive Feedback**:
```
Good identification of the semantic error in "banco" (bank vs. bench). 
Your explanation clearly shows understanding of context-dependent 
translation choices.
```

**Constructive Feedback**:
```
The fluency score of 2 seems too harsh for this translation. While 
there are grammatical issues, the text is understandable. Consider 
a score of 3 with specific comments about the grammatical problems.
```

**Specific Guidance**:
```
When classifying word order errors, consider whether they're minor 
stylistic issues (MI_ST) or major comprehension problems (MA_ST). 
This particular case affects readability but not meaning, so MI_ST 
would be more appropriate.
```

### Communication Channels

#### Direct Feedback
- **Evaluation Comments**: Detailed feedback on specific evaluations
- **Score Explanations**: Reasoning behind evaluation scores
- **Improvement Suggestions**: Specific areas for development

#### System Notifications
- **Evaluation Completion**: Notifications when evaluations are complete
- **Feedback Responses**: Annotator responses to feedback
- **Quality Updates**: System-wide quality improvements

#### Reporting Mechanisms
- **Quality Reports**: Regular quality assessment reports
- **Trend Analysis**: Performance trends over time
- **Improvement Tracking**: Progress monitoring

## Best Practices

### Evaluation Excellence

#### Preparation
1. **Review Guidelines**: Stay current with evaluation criteria
2. **Calibrate Regularly**: Participate in calibration sessions
3. **Understand Context**: Consider domain and purpose
4. **Plan Time**: Allocate adequate time for thorough evaluation

#### During Evaluation
1. **Read Carefully**: Thoroughly understand source and target texts
2. **Consider Context**: Think about intended audience and purpose
3. **Be Systematic**: Follow consistent evaluation procedures
4. **Document Thoroughly**: Provide detailed, specific feedback

#### Quality Assurance
1. **Double-Check**: Review your evaluations before submission
2. **Seek Clarification**: Ask questions when uncertain
3. **Stay Consistent**: Apply standards uniformly
4. **Continuous Learning**: Learn from feedback and discussions

### Time Management

#### Efficient Evaluation
- **Batch Similar**: Group similar evaluations together
- **Use Templates**: Develop feedback templates for common issues
- **Prioritize Impact**: Focus on most impactful feedback
- **Set Targets**: Establish daily/weekly evaluation goals

#### Quality vs. Speed
- **Quality First**: Never sacrifice quality for speed
- **Efficient Processes**: Develop efficient evaluation workflows
- **Regular Breaks**: Take breaks to maintain focus
- **Balanced Workload**: Distribute evaluation load evenly

### Professional Development

#### Skill Building
1. **Language Skills**: Continuously improve language proficiency
2. **Domain Knowledge**: Develop expertise in relevant domains
3. **Technology Skills**: Stay current with evaluation tools
4. **Communication Skills**: Improve feedback delivery

#### Staying Current
1. **Guidelines Updates**: Stay informed about criteria changes
2. **Best Practices**: Learn from other evaluators
3. **Training Sessions**: Participate in ongoing training
4. **Research**: Stay current with MT evaluation research

## Performance Metrics

### Individual Metrics

#### Evaluation Statistics
- **Evaluations Completed**: Total number of evaluations
- **Average Evaluation Time**: Time spent per evaluation
- **Quality Scores Given**: Distribution of quality scores
- **Feedback Response Rate**: Percentage of feedback acknowledged

#### Quality Metrics
- **Evaluation Accuracy**: Consistency with peer evaluators
- **Feedback Quality**: Usefulness of feedback provided
- **Calibration Score**: Alignment with evaluation standards
- **Improvement Impact**: Annotator improvement following feedback

### System-Wide Metrics

#### Quality Trends
- **Overall Quality Scores**: System-wide quality trends
- **Error Classification Accuracy**: Consistency in error identification
- **Evaluation Consistency**: Agreement between evaluators
- **Feedback Effectiveness**: Impact on annotation quality

#### Productivity Metrics
- **Evaluation Throughput**: Evaluations completed per time period
- **Queue Management**: Time from annotation to evaluation
- **Response Time**: Speed of feedback delivery
- **Resource Utilization**: Efficiency of evaluation processes

### Reporting and Analytics

#### Personal Dashboard
- **Daily Progress**: Evaluations completed today
- **Weekly Goals**: Progress toward weekly targets
- **Quality Trends**: Your evaluation quality over time
- **Feedback Impact**: Annotator responses to your feedback

#### System Reports
- **Quality Reports**: Overall system quality metrics
- **Evaluation Statistics**: System-wide evaluation data
- **Improvement Tracking**: Quality improvement over time
- **Resource Planning**: Evaluation workload planning

## Advanced Features

### Batch Evaluation

#### Batch Processing
- **Multiple Evaluations**: Evaluate multiple annotations simultaneously
- **Consistent Standards**: Apply uniform criteria across batches
- **Efficient Workflow**: Streamlined evaluation process
- **Quality Control**: Maintain quality despite volume

#### Automation Tools
- **Pre-filled Forms**: Automated form completion for similar issues
- **Template Feedback**: Reusable feedback templates
- **Batch Actions**: Apply common actions to multiple evaluations
- **Smart Filtering**: Filter evaluations by criteria

### Advanced Analytics

#### Evaluation Insights
- **Pattern Recognition**: Identify common annotation issues
- **Trend Analysis**: Track quality trends over time
- **Predictive Metrics**: Forecast quality improvements
- **Comparative Analysis**: Compare annotator performance

#### Custom Reports
- **Personalized Metrics**: Customize evaluation dashboards
- **Export Options**: Export evaluation data for analysis
- **Scheduled Reports**: Automated report generation
- **Integration**: Connect with external analytics tools

### Quality Assurance

#### Calibration Systems
- **Peer Review**: Cross-evaluation by multiple evaluators
- **Standard Benchmarks**: Evaluate against known standards
- **Calibration Sessions**: Regular alignment meetings
- **Quality Audits**: Periodic evaluation quality reviews

#### Feedback Loops
- **Continuous Improvement**: Regular process refinement
- **Annotator Development**: Targeted improvement programs
- **Evaluator Training**: Ongoing evaluator development
- **System Enhancement**: Platform improvement based on feedback

## Troubleshooting

### Common Issues

#### Evaluation Platform Issues
- **Login Problems**: Authentication and access issues
- **Performance Issues**: Slow loading or response times
- **Interface Problems**: UI/UX issues and navigation problems
- **Data Sync Issues**: Synchronization problems

#### Evaluation Process Issues
- **Scoring Difficulties**: Unclear evaluation criteria
- **Feedback Delivery**: Communication problems
- **Time Management**: Evaluation workload issues
- **Quality Concerns**: Inconsistent evaluation standards

### Solutions and Support

#### Technical Support
- **System Issues**: Contact technical support team
- **Account Problems**: User account and access issues
- **Performance Issues**: Platform performance problems
- **Data Issues**: Data integrity and synchronization problems

#### Process Support
- **Evaluation Questions**: Clarification on evaluation criteria
- **Training Needs**: Additional training and development
- **Quality Concerns**: Evaluation quality discussions
- **Workflow Issues**: Process improvement suggestions

### Best Practices for Issue Resolution

1. **Document Issues**: Record problems and solutions
2. **Report Promptly**: Report issues quickly for faster resolution
3. **Provide Details**: Include specific information about problems
4. **Follow Up**: Ensure issues are resolved satisfactorily
5. **Share Solutions**: Help other evaluators with similar issues

## Conclusion

Effective evaluation is crucial for maintaining high annotation quality and supporting annotator development. As an evaluator, you play a vital role in:

- **Quality Assurance**: Ensuring annotation standards are met
- **Continuous Improvement**: Helping annotators develop skills
- **System Enhancement**: Contributing to platform improvements
- **Research Goals**: Supporting the broader research objectives

Remember that evaluation is not just about scoring - it's about fostering improvement, maintaining standards, and supporting the annotation community.

For additional support and resources:
- Review the [User Manual](user-manual.md) for general system information
- Check the [API Documentation](api/README.md) for technical details
- Visit the [Support Center](support/contact.md) for help and assistance
- Participate in [Training Programs](training/evaluator-training.md) for skill development

---

**Last Updated**: January 2024
**Evaluator Guide Version**: 1.0.0
**Target Audience**: Annotation Evaluators and Quality Assessors 