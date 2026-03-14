# vibecodinglearning

## Reminder function for Windows Copilot UI

A reminder function has been added to support:

- manual task reminders,
- connector reminders (for example Gmail Calendar appointments and price-watch alerts),
- desktop reminder surfacing,
- and phone-call escalation when the reminder is not snoozed or cancelled.

### Files

- `src/reminderFunction.js`: core function logic.
- `test/reminderFunction.test.js`: runnable validation script.
- `docs/windows-copilot-reminder-flow.md`: integration flow and usage.

### Run validation

```bash
node test/reminderFunction.test.js
```
