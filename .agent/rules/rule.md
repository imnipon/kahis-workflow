# KAHIS Workflow Project Rules

## 1. Project Overview & Identity
- **Repository**: `https://github.com/imnipon/kahis-workflow.git`
- **Author Identity**: `imnipon <nipon.w@live.ku.th>`
- **Project Purpose**: Standalone Interactive Animated Blueprint Workflow Explorer for KAHIS Exam Card & Veterinary Outpatient Care Process.

## 2. Emoji & Visual Guidelines
- **Emoji Prohibition**: No Unicode emoji characters are permitted in code or UI markup. Always use Lucide React icons.
- Verify using: `npm run check-icons`.

## 3. Session Wrap-up & Backup Protocol
- When the user indicates they want to wrap up, stop working, or close the session:
  Proactively remind them to run:
  ```powershell
  npm run backup
  ```
  to create a clean, compressed zip archive ready for cloud upload.
