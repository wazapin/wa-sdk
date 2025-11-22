# Changelog

All notable changes to @wazapin/wa-sdk will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **License changed from MIT to Apache 2.0 with additional conditions** (2025-11-22)
  - Added LOGO and copyright protection for frontend components
  - Added usage notification requirement for all projects
  - Contact hello@wazapin.com for licensing inquiries

### Added

#### SDK Branding & Developer Experience (2025-11-22)
- **HTTP Headers Branding** - Automatic SDK identification in all API requests
  - User-Agent header: RFC 9110 compliant format `wazapin-wa/1.0.0 (Node/v18.17.0; linux; x64)`
  - Custom SDK version header: `Wazapin-SDK-Version: 1.0.0`
  - Auto-detect SDK version from package.json
  - Auto-detect platform info (Node version, OS, architecture)
  - Helps Meta track SDK usage for better support and analytics
  
- **Structured Logger** - Production-ready logging with branded format
  - Branded log format: `[wazapin-wa] [LEVEL] Message`
  - Log levels: debug, info, warn, error (default: info)
  - Optional timestamps: `[2025-11-22T10:19:49.423Z] [wazapin-wa] [INFO] Message`
  - Automatic sensitive data redaction (tokens, passwords, secrets, API keys)
  - Custom handler support for integration with external logging systems
  - Zero performance impact when disabled
  - 41 comprehensive tests (version utilities + logger)

#### P0 Critical Features (2025-11-22)
- **Business Profile Management** - Full business profile management
  - Get business profile information (all fields or specific)
  - Update business profile (about, address, description, email, websites, vertical, profile picture)
  - 17 business categories/verticals supported
  - Character limits validation (about 139, address 256, description 512, email 128)
  - 16 comprehensive tests
  
- **Interactive CTA URL Button Messages** - Send messages with call-to-action URL buttons
  - Send interactive CTA messages with clean URL presentation
  - Support for text, image, video, and document headers
  - Optional footer text
  - Character limits validation (header 60, body 1024, button 20, footer 60)
  - 12 comprehensive tests
  
- **Conversational Components** - Configure in-chat interaction features
  - Enable/disable welcome message notifications
  - Configure ice breakers/prompts (max 4, 80 chars each)
  - Configure slash commands (max 30, name 32 chars, desc 256 chars)
  - Get current configuration
  - Full validation with character limits
  - 16 comprehensive tests

#### Account Management
- Messaging Limits feature (2025-11-22)
- Account namespace to WhatsAppClient
- Support for all messaging limit tiers (TIER_250, TIER_2000, TIER_10K, TIER_100K, TIER_UNLIMITED)

#### Documentation
- Comprehensive documentation reorganization (2025-11-22)
- `docs/` folder with focused documentation (CONTRIBUTING.md, API_VERIFICATION.md, PROJECT_STATUS.md)

#### Webhooks
- Unsupported messages webhook support (2025-11-21)
  - `unsupported` message type for messages not supported by Cloud API
  - `errors` field in `WebhookMessage` for error code 131051 and other errors
  - `unsupported.type` field to indicate unsupported message type (edit/poll/button/etc)
  - `identityKeyHash` optional field in `WebhookContact` for identity change check

### Documentation
- Reorganized documentation from 11 files to 5 core files (61% reduction)
- Updated API verification to 24 pages verified (100% success rate)
- Improved documentation navigation and clarity

### Tests
- **Total**: 408 tests (up from 367)
- **New Tests**: 41 tests for SDK branding
  - Version utilities: 16 tests
  - Logger: 25 tests
- **Previous**: 44 tests for P0 features
  - Business Profile: 16 tests
  - Interactive CTA: 12 tests
  - Conversational Components: 16 tests
- **Coverage**: Maintained high coverage
- **All tests passing**: ✅

### Verified
- 27 WhatsApp API documentation pages verified with 100% compliance (2025-11-22)
- All implemented features match Meta's official API specifications via Firecrawl verification
- Business Profile API verified
- Interactive CTA URL Messages API verified
- Conversational Components API verified

## [1.0.0] - 2025-11-21

### Added
- Initial SDK release
- Core messaging features:
  - Text messages with preview URL support
  - Media messages (image, video, audio, document, sticker)
  - Interactive messages (buttons, lists)
  - Template messages with all parameter types
  - Location messages
  - Contact messages (full vCard support)
  - Reaction messages
  - Mark as read
- Media operations:
  - Upload media (Buffer and Blob support)
  - Download media with metadata
  - File size validation per media type
- Webhook operations:
  - Parse webhook payloads
  - Verify webhook signatures (HMAC SHA256)
- HTTP Client with retry logic and exponential backoff
- Zod-based validation with three modes (off, relaxed, strict)
- TypeScript types for all operations
- Comprehensive error handling (5 error types)
- 171 tests with 88% coverage
- Complete documentation (README, guides)
- ESM module support for Node.js, Deno, Bun, and browsers

### Verified
- 18 Meta WhatsApp API documentation pages verified
- 100% API compliance for all implemented features

## [0.1.0] - 2025-11-15

### Added
- Project initialization
- Basic project structure
- TypeScript configuration
- ESLint setup
- Vitest testing framework

---

## Upgrade Guide

### Upgrading to 1.0.0

No breaking changes from initial release.

---

## Links

- [GitHub Repository](https://github.com/wazapin/wa-sdk)
- [Documentation](./README.md)
- [Contributing Guide](./docs/CONTRIBUTING.md)
- [API Verification](./docs/API_VERIFICATION.md)
- [Project Status](./docs/PROJECT_STATUS.md)
