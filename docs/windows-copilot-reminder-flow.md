# Windows Copilot UI Reminder Function

This implementation supports the reminder behavior you described:

1. User can enable reminders for:
   - Manual tasks created directly in Copilot.
   - Connector tasks (for example Gmail Calendar appointments and price-watch alerts).
2. Reminder appears as a desktop surface.
3. If no action is taken (neither **Snooze** nor **Cancel**) before timeout, Copilot escalates by triggering a phone call.

## Function entrypoint

Use `createReminderFunction` in `src/reminderFunction.js`.

### Required integrations

- `desktopNotifier.send(...)` to surface a desktop reminder card.
- `waitForAction(...)` to capture `snooze` or `cancel`.
- `phoneCallService.call(...)` to escalate when not acknowledged.

## Example usage

```js
const { createReminderFunction, REMINDER_SCOPE } = require("./src/reminderFunction");

await createReminderFunction({
  userId: "user-123",
  scope: REMINDER_SCOPE.ALL,
  reminders: [
    {
      id: "task-1",
      title: "Review proposal",
      description: "Manual task reminder",
      dueAt: "2026-03-20T09:00:00Z",
      source: "manual",
    },
  ],
  desktopNotifier,
  phoneCallService,
  waitForAction,
});
```

## Suggested Copilot UI text

- **Enable reminders**
  - Manual tasks only
  - Connector tasks only
  - All reminders
- **Escalation behavior**
  - “If not snoozed or cancelled, call my phone.”
