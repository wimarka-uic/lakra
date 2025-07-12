# Contributing to Lakra

Thank you for your interest in contributing to Lakra! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/lakra.git
   cd lakra
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python init_db.py
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Start Development Servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   python main.py

   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

## Contributing Guidelines

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes**: Help us fix issues in the codebase
- **Feature enhancements**: Add new functionality or improve existing features
- **Documentation**: Improve or add to our documentation
- **Testing**: Add or improve tests
- **UI/UX improvements**: Enhance the user interface and experience
- **Performance optimizations**: Make the application faster and more efficient

### Branch Naming Convention

Use descriptive branch names that clearly indicate the purpose:

- `feature/annotation-improvements`
- `bugfix/evaluation-score-calculation`
- `docs/api-documentation`
- `test/annotation-interface`
- `refactor/database-queries`

### Commit Message Guidelines

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(annotation): add voice recording functionality
fix(evaluation): correct score calculation algorithm
docs(api): update authentication endpoint documentation
test(frontend): add tests for annotation interface
```

## Pull Request Process

1. **Before Starting Work**
   - Check existing issues and PRs to avoid duplication
   - Create or comment on an issue to discuss your proposed changes
   - Get approval from maintainers for significant changes

2. **Development Process**
   - Create a new branch from `main`
   - Make your changes following our code standards
   - Write or update tests as needed
   - Update documentation if necessary
   - Test your changes thoroughly

3. **Submitting a Pull Request**
   - Push your branch to your fork
   - Create a pull request against the `main` branch
   - Fill out the PR template completely
   - Link to any related issues
   - Request review from maintainers

4. **PR Review Process**
   - Maintainers will review your PR
   - Address any feedback or requested changes
   - Once approved, your PR will be merged

## Code Standards

### Python (Backend)

- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Write docstrings for functions and classes
- Use meaningful variable and function names
- Keep functions small and focused
- Use proper exception handling

**Example:**
```python
def create_annotation(
    db: Session, 
    annotation_data: AnnotationCreate, 
    user_id: int
) -> Annotation:
    """
    Create a new annotation in the database.
    
    Args:
        db: Database session
        annotation_data: Annotation data from request
        user_id: ID of the user creating the annotation
    
    Returns:
        Created annotation object
    
    Raises:
        HTTPException: If annotation creation fails
    """
    # Implementation here
```

### TypeScript/React (Frontend)

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Write reusable components
- Use proper prop types
- Follow consistent naming conventions

**Example:**
```typescript
interface AnnotationProps {
  sentence: Sentence;
  onSubmit: (annotation: AnnotationData) => void;
  isLoading?: boolean;
}

const AnnotationInterface: React.FC<AnnotationProps> = ({
  sentence,
  onSubmit,
  isLoading = false
}) => {
  // Component implementation
};
```

### Database

- Use descriptive table and column names
- Add appropriate indexes for queries
- Include proper foreign key relationships
- Write migration scripts for schema changes
- Document schema changes in commit messages

## Testing

### Backend Testing

- Write unit tests for utility functions
- Test API endpoints with various inputs
- Test database operations
- Test authentication and authorization
- Use pytest for testing framework

### Frontend Testing

- Write component tests using Jest/React Testing Library
- Test user interactions and workflows
- Test error handling and edge cases
- Test accessibility features

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

## Documentation

### Code Documentation

- Write clear docstrings for Python functions
- Add JSDoc comments for complex TypeScript functions
- Document API endpoints with examples
- Include inline comments for complex logic

### User Documentation

- Update user guides when adding new features
- Include screenshots for UI changes
- Write clear step-by-step instructions
- Test documentation with new users

## Issue Reporting

### Before Reporting

- Search existing issues to avoid duplicates
- Check if the issue exists in the latest version
- Try to reproduce the issue consistently

### Bug Reports

Include the following information:

- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to reproduce the bug
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, browser, Python version, etc.
- **Screenshots**: If applicable
- **Logs**: Any relevant error messages

### Use the Bug Report Template

```markdown
## Bug Description
A clear and concise description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., macOS 12.0]
- Browser: [e.g., Chrome 95]
- Python Version: [e.g., 3.9]
- Node Version: [e.g., 16.0]

## Additional Context
Any other information about the problem.
```

## Feature Requests

### Before Requesting

- Check if the feature already exists
- Search existing feature requests
- Consider if the feature fits the project's scope

### Feature Request Template

```markdown
## Feature Description
A clear and concise description of the feature.

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other solutions you've considered.

## Additional Context
Any other information about the feature.
```

## Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For general questions and community discussions
- **Email**: For security issues (see SECURITY.md)

## Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` file
- Release notes for significant contributions
- GitHub contributor graphs

## License

By contributing to Lakra, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to Lakra! Your help makes this project better for everyone. 