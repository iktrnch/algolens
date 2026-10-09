# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is a computer-science learner who has an algorithm in front of them and wants to understand what it does, how efficient it is, and how it could be improved.

## Product Purpose

AlgoLens turns a pasted algorithm into a concise learning aid: a plain-language explanation, time and space complexity, and up to four improvement suggestions. Success means the learner can understand the algorithm and identify their next improvement without needing a more complex analysis environment.

## Positioning

AlgoLens is deliberately small and focused. It provides a single, approachable analysis pass for learning rather than behaving like an IDE, debugger, visualization suite, or comprehensive code-review platform.

## Operating Context

The learner selects one of the supported programming languages, pastes an algorithm, runs the analysis, and reads the explanation, complexity assessment, and suggested improvements on the same page.

## Capabilities and Constraints

- The input contract is code plus a selected language.
- Supported languages are Python, JavaScript, TypeScript, Java, C++, C, Go, and Rust.
- The result contract contains a plain-text explanation, time and space complexity with one explanatory sentence, and a short list of improvement strings.
- The result contract should remain simple; line-linked findings, rewritten code, and other richer analysis structures are out of scope.
- Analysis is performed with Cloudflare Workers AI through the existing SvelteKit and Cloudflare application.
- The interface must account for idle, running, recovered-running, error, and complete states.

## Brand Commitments

- The product name is AlgoLens.
- The current proof-of-concept visual language is not a brand commitment and must not be carried into production.
- The production interface must avoid generic AI-product styling and derive its character from learning and algorithmic reasoning.

## Evidence on Hand

- The repository contains working examples for Python binary search and JavaScript merge sort.
- No testimonials, usage metrics, institutional endorsements, or other external proof are present; future work must not fabricate them.

## Product Principles

- Teach before impressing.
- Keep the path from pasted code to understanding short.
- Make the relationship between an input and its result trustworthy.
- Prefer a focused learning aid over IDE-like complexity.
- Communicate AI limitations and recovery states honestly.

## Accessibility & Inclusion

The interface must support keyboard operation, visible focus, screen-reader labels and status announcements, readable contrast, reduced motion, and practical mobile touch targets.
