# Contributing to LangOmni Adventure

Thank you for your interest in contributing to LangOmni Adventure! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain a professional demeanor

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/LangOmni_Adventure.git`
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Test thoroughly
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

## Development Setup

See [README.md](README.md) for detailed setup instructions.

Quick start:
```bash
make install
make dev
```

## Coding Standards

### Python (Backend)

- Follow PEP 8
- Use Black for formatting: `black app/`
- Use Ruff for linting: `ruff check app/`
- Type hints are encouraged
- Write docstrings for all public functions

Example:
```python
async def process_action(
    player_id: str,
    action_type: str,
    action_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Process a player action.

    Args:
        player_id: Unique player identifier
        action_type: Type of action (move, talk, etc.)
        action_data: Additional action parameters

    Returns:
        Dictionary containing action results

    Raises:
        ValueError: If action is invalid
        TimeoutError: If processing takes too long
    """
    pass
```

### TypeScript (Frontend)

- Use TypeScript strict mode
- Follow Airbnb style guide
- Use Prettier for formatting: `npm run format`
- Use ESLint: `npm run lint`
- Prefer functional components with hooks

Example:
```typescript
interface PlayerStats {
  playerId: string
  username: string
  level: number
  hp: number
  maxHp: number
}

const PlayerCard: React.FC<{ player: PlayerStats }> = ({ player }) => {
  return (
    <div className="card">
      <h3>{player.username}</h3>
      <p>Level {player.level}</p>
    </div>
  )
}
```

## Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

Write tests for:
- API endpoints
- Orchestrator logic
- GPU manager
- Cache service
- Rate limiter

### Frontend Tests

```bash
cd frontend
npm run test
```

Write tests for:
- Component rendering
- User interactions
- API calls
- State management

## Pull Request Process

1. **Update Documentation**: If you change APIs or add features, update relevant docs
2. **Add Tests**: New features should include tests
3. **Format Code**: Run formatters before committing
4. **Clear Commits**: Use descriptive commit messages
5. **Rebase**: Keep your branch up to date with main
6. **Description**: Provide a clear PR description explaining your changes

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat(orchestrator): add priority queue for combat actions

Implement a priority queue system that prioritizes combat actions
over exploration actions to ensure responsive gameplay during fights.

Closes #123
```

## Areas for Contribution

### High Priority

- [ ] Implement persistent player sessions
- [ ] Add more NPC personality templates
- [ ] Improve world generation algorithms
- [ ] Optimize GPU batch sizing
- [ ] Add comprehensive error handling

### Medium Priority

- [ ] Mobile-responsive frontend
- [ ] Player trading system
- [ ] Guild/party system
- [ ] Quest editor interface
- [ ] Admin dashboard features

### Good First Issues

- [ ] Add more unit tests
- [ ] Improve documentation
- [ ] Fix typos and formatting
- [ ] Add example quest templates
- [ ] Create more NPC dialogue samples

## Feature Requests

Open an issue with:
- Clear description of the feature
- Use cases and benefits
- Potential implementation approach
- Any relevant mockups or diagrams

## Bug Reports

Open an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs. actual behavior
- System information (OS, GPU, versions)
- Error logs or screenshots

## Questions

- GitHub Discussions for general questions
- GitHub Issues for specific technical questions
- Discord for real-time chat (if available)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be added to the CONTRIBUTORS.md file and acknowledged in release notes.

Thank you for contributing to LangOmni Adventure! 🎮✨
