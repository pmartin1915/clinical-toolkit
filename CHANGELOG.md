# Changelog

## [Unreleased]

### Added
- **Security:** AES-256-GCM encryption for all patient data
- **Security:** PBKDF2 key derivation with 100,000 iterations
- **Security:** Automatic data migration from Base64 to encrypted storage
- **State Management:** Zustand store with encrypted persistence
- **Tests:** Encryption, storage, and migration test suites

### Changed
- **BREAKING:** Replaced StorageManager singleton with Zustand store
- **Security:** All localStorage data now encrypted with AES-256-GCM
- **Performance:** Async storage operations (non-blocking UI)

### Removed
- Base64 "encryption" (replaced with real encryption)

### Security
- Fixed critical security vulnerability: Base64 encoding replaced with AES-256-GCM
- All sensitive patient data now properly encrypted at rest
- Session-based encryption keys (not persisted)

## [1.0.2] - Previous

- Initial release with 25 clinical calculators
- 10 medical condition modules
- 104+ tests
