# Contributing Guidelines

Thank you for your interest in contributing to the **Izzycode820/frontend** project! These guidelines are designed to help you understand how to contribute effectively and ensure that our project remains high-quality.

## Code of Conduct
We expect all contributors to adhere to the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) for respectful and inclusive behavior. 

## Getting Started for Contributors
1. Fork the repository.
2. Clone your forked repository to your local machine.
3. Create a new branch for your feature or bugfix: `git checkout -b feature/your-feature-name`
4. Make your changes and commit them.

## Development Process
- Development should generally be done in feature branches based off of `main`.
- Ensure your code is thoroughly tested before submitting a pull request.

## TypeScript and React Coding Standards
- Follow the TypeScript and React best practices as outlined in the [official documentation](https://www.typescriptlang.org/docs/handbook/intro.html) and [React documentation](https://reactjs.org/docs/getting-started.html).

## Naming Conventions
- **Variables:** Use camelCase.
- **Classes:** Use PascalCase.
- **Constants:** Use UPPER_SNAKE_CASE.

## Code Organization Patterns
- Each component should have its own directory within `src/components/`.
- Follow the structure of **componentName/** with **index.tsx** and **styles.module.css** files.

## Pull Request Process
1. Ensure your branch is up to date with the `main` branch.
2. Open a pull request with a clear description of the changes you made.
3. Use the following template:
   ```
   ## Description
   
   - What does this PR do?
   
   ## Related Issue
   
   - [Link to issue here]
   
   ## Checklist
   - [ ] Code is well-tested
   - [ ] Documentation is updated
   
   ## Additional Notes
   
   - Any additional information.
   ```

## Commit Message Guidelines
Use the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format for commit messages:
- **feat:** A new feature
- **fix:** A bug fix
- **docs:** Documentation only changes
- **style:** Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor:** A code change that neither fixes a bug nor adds a feature
- **test:** Adding missing or correcting existing tests

## Testing Requirements
- All new features should include unit tests.
- Use Jest and React Testing Library for testing components.

## Documentation Standards
- Ensure all public methods and components are documented using JSDoc style comments.

## Common Mistakes to Avoid
- Not following the project's coding standards.
- Skipping tests for your changes.
- Forgetting to update documentation.

For any questions, please reach out in the project discussions or submit an issue!

Happy coding!