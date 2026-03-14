const assert = require("node:assert/strict");
const {
  REMINDER_SCOPE,
  CONNECTOR_TYPE,
  createReminderFunction,
} = require("../src/reminderFunction");

async function run() {
  const desktopEvents = [];
  const phoneCalls = [];

  const reminders = [
    {
      id: "m1",
      title: "Submit report",
      description: "Manual task",
      dueAt: "2026-03-20T09:00:00Z",
      source: "manual",
      escalationDelayMs: 10,
    },
    {
      id: "c1",
      title: "Gmail Calendar appointment",
      description: "Meeting in 10 minutes",
      dueAt: "2026-03-20T09:50:00Z",
      source: "connector",
      connectorType: CONNECTOR_TYPE.GMAIL_CALENDAR,
      escalationDelayMs: 10,
    },
    {
      id: "c2",
      title: "Price watch alert",
      description: "Target price reached",
      dueAt: "2026-03-20T10:00:00Z",
      source: "connector",
      connectorType: CONNECTOR_TYPE.PRICE_WATCH,
      escalationDelayMs: 10,
    },
  ];

  const result = await createReminderFunction({
    userId: "user-123",
    scope: REMINDER_SCOPE.ALL,
    reminders,
    desktopNotifier: {
      async send(payload) {
        desktopEvents.push(payload);
      },
    },
    phoneCallService: {
      async call(payload) {
        phoneCalls.push(payload);
      },
    },
    async waitForAction({ reminderId }) {
      if (reminderId === "m1") return "snooze";
      if (reminderId === "c1") return "cancel";
      return null;
    },
    logger: { info() {}, warn() {} },
  });

  assert.equal(desktopEvents.length, 3, "All reminders should surface on desktop");
  assert.equal(phoneCalls.length, 1, "One unacknowledged reminder should escalate");
  assert.deepEqual(result, [
    { reminderId: "m1", status: "snoozed" },
    { reminderId: "c1", status: "cancelled" },
    { reminderId: "c2", status: "phone_call_escalated" },
  ]);

  console.log("All reminder function checks passed.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
