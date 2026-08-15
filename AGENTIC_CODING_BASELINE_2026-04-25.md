# Agentic Coding Baseline (Verified 2026-04-25)

This file records the research baseline used to refresh `AGENTS.md` and `CODEX_WORKFLOW.md`.

## Verified Sources

- OpenAI Models: https://developers.openai.com/api/docs/models
- GPT-5-Codex model: https://developers.openai.com/api/docs/models/gpt-5-codex
- GPT-5.5 pro model: https://developers.openai.com/api/docs/models/gpt-5.5-pro
- OpenAI code generation guide: https://developers.openai.com/api/docs/guides/code-generation
- Codex with ChatGPT plan: https://help.openai.com/en/articles/11369540-codex-in-chatgpt
- Codex AGENTS.md guide: https://developers.openai.com/codex/guides/agents-md
- Codex workflows: https://developers.openai.com/codex/workflows
- Codex best practices: https://developers.openai.com/codex/learn/best-practices
- OpenAI prompt guidance: https://developers.openai.com/api/docs/guides/prompt-guidance
- OpenAI Agents SDK overview: https://developers.openai.com/api/docs/guides/agents

## Current Model Guidance

- `gpt-5.5` is the default flagship choice for complex reasoning, coding, and professional work.
- `gpt-5.4-mini` and `gpt-5.4-nano` are recommended when optimizing for lower latency and cost.
- `gpt-5.5` supports text/image input, text output, reasoning effort levels, a 1M context window, and tools including functions, web search, file search, and computer use.
- `gpt-5.5-pro` is slower and much more expensive, but uses more compute for difficult tasks. Use it only for hard architecture, root-cause debugging, or high-stakes planning where latency and cost are acceptable.
- `gpt-5-codex` is optimized for agentic coding in Codex-like environments and is available through the Responses API.

## Codex Usage Guidance

Codex is the preferred OpenAI product path for agentic software engineering. Use it across:
- CLI or IDE for local repo edits and fast validation
- Codex app/cloud for delegated background tasks and parallel agents
- GitHub/CI review flows for PR feedback
- SDK/API integrations when building coding-agent products

Prerequisites for best results:
- correct project runtime: use `.nvmrc` (`24.12.0`); this repo's locked Vite package requires Node.js `^20.19.0 || >=22.12.0`
- working dependency install
- reproducible build/test commands
- clear `AGENTS.md` instructions
- stable environment variables documented without exposing secrets
- a clean enough working tree to compare diffs
- acceptance criteria and validation command included in the user prompt
- code review loop before shipping risky changes

## Prompting Guidance for Agentic Coding

Use shorter, outcome-first prompts with:
- goal and expected behavior
- current problem or evidence
- constraints and non-goals
- relevant files or module names
- validation requirements
- final answer format

Avoid:
- stale process-heavy prompt stacks
- asking for broad rewrites when an incremental path is safer
- hiding uncertainty or skipped validation
- changing dependencies or architecture without explicit need

## Complete SDLC Workflow

1. Requirements: convert user request into acceptance criteria and risks.
2. Discovery: search relevant files and read active imports/routes before editing.
3. Design: choose the smallest compatible implementation.
4. Implementation: patch focused files and preserve established patterns.
5. Validation: run tests/build/dev server as appropriate.
6. Review: check correctness, security, regressions, edge cases, and missing tests.
7. Documentation: update README/playbooks/audit notes when behavior or workflow changes.
8. Release support: summarize files changed, commands run, failures, and residual risk.

## Repo Comparison Summary

Existing files found:
- `AGENTS.md`: useful but too generic; commands needed Vite/test clarification and lacked current model/Codex guidance.
- `CODEX_WORKFLOW.md`: good workflow skeleton; needed current agentic SDLC patterns, app-specific guardrails, and Vite correction.
- `PROJECT_AUDIT_2026-02-25.md`: valuable app-specific risk memory; left intact and referenced from the active instructions.
- `README.md`: generic Create React App text; updated separately to match the current app and commands.
- `.codex`: empty file; left unchanged.

## Recommended Operating Prompt Template

```text
Task:
<what to change or investigate>

Context:
<feature area, known constraints, relevant files if known>

Acceptance criteria:
- <observable behavior>
- <edge cases>
- <non-goals>

Validation:
- Run <command> or explain why it cannot run.

Final response:
- Outcome
- Files changed
- Validation
- Remaining risk
```
