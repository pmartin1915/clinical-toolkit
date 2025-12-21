# Security

## Encryption

Clinical Toolkit uses **AES-256-GCM** authenticated encryption for all patient data stored in localStorage.

### Implementation

- **Algorithm:** AES-256-GCM (Galois/Counter Mode)
- **Key Derivation:** PBKDF2 with SHA-256 (100,000 iterations)
- **IV:** Random 12-byte IV per encryption operation
- **Salt:** Random 16-byte salt for key derivation

### Key Management

- Encryption keys are **session-based** (generated per browser session)
- Keys are **never persisted** to disk or localStorage
- Keys are cleared when the browser tab is closed
- New keys are generated on each app load

### Data Protection

All sensitive patient data is encrypted:
- Patient profiles (name, demographics, medical history)
- Assessment results
- Vital signs
- Goals and education progress

### Browser Compatibility

- Requires Web Crypto API support (95%+ of browsers)
- Graceful fallback to unencrypted storage if unavailable
- Automatic detection and warning if encryption fails

### Migration

Existing data is automatically migrated from Base64 encoding to AES-256-GCM encryption on first load after update.

## Reporting Security Issues

Please report security vulnerabilities to the maintainer privately.

## Security Best Practices

1. **Do not share patient data** outside the application
2. **Use HTTPS** when deploying to production
3. **Clear browser data** when using shared computers
4. **Keep browser updated** for latest security patches
