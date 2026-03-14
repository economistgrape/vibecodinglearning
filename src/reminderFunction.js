/**
 * Reminder function for Copilot-style task orchestration.
 *
 * Supports:
 * 1) Manual reminders (user-created tasks)
 * 2) Connector reminders (calendar appointments, price-watch alerts)
 * 3) Desktop notification surfacing
 * 4) Escalation to phone call if user does not snooze or cancel
 */

const REMINDER_SCOPE = {
  MANUAL_ONLY: "manual",
  CONNECTOR_ONLY: "connector",
  ALL: "all",
};

const CONNECTOR_TYPE = {
  GMAIL_CALENDAR: "gmail_calendar",
  PRICE_WATCH: "price_watch",
  OTHER: "other",
};

function shouldIncludeReminder(scope, reminder) {
  if (scope === REMINDER_SCOPE.ALL) return true;
  if (scope === REMINDER_SCOPE.MANUAL_ONLY) return reminder.source === "manual";
  if (scope === REMINDER_SCOPE.CONNECTOR_ONLY) return reminder.source === "connector";
  return false;
}

async function createReminderFunction({
  userId,
  scope,
  reminders,
  desktopNotifier,
  phoneCallService,
  waitForAction,
  logger = console,
}) {
  if (!userId) throw new Error("userId is required");
  if (!Object.values(REMINDER_SCOPE).includes(scope)) {
    throw new Error(`Unsupported scope: ${scope}`);
  }

  const selectedReminders = reminders.filter((reminder) =>
    shouldIncludeReminder(scope, reminder),
  );

  const results = [];

  for (const reminder of selectedReminders) {
    await desktopNotifier.send({
      userId,
      reminderId: reminder.id,
      title: reminder.title,
      body: reminder.description,
      dueAt: reminder.dueAt,
      source: reminder.source,
      connectorType: reminder.connectorType || null,
      actions: ["snooze", "cancel"],
    });

    const action = await waitForAction({
      reminderId: reminder.id,
      timeoutMs: reminder.escalationDelayMs ?? 60_000,
    });

    if (action === "snooze") {
      logger.info?.(`Reminder ${reminder.id} snoozed by user ${userId}.`);
      results.push({ reminderId: reminder.id, status: "snoozed" });
      continue;
    }

    if (action === "cancel") {
      logger.info?.(`Reminder ${reminder.id} cancelled by user ${userId}.`);
      results.push({ reminderId: reminder.id, status: "cancelled" });
      continue;
    }

    await phoneCallService.call({
      userId,
      reason: "Reminder unacknowledged",
      reminderId: reminder.id,
      reminderTitle: reminder.title,
      source: reminder.source,
      connectorType: reminder.connectorType || null,
    });

    logger.warn?.(
      `Reminder ${reminder.id} was not acknowledged. Escalated to phone call.`,
    );
    results.push({ reminderId: reminder.id, status: "phone_call_escalated" });
  }

  return results;
}

module.exports = {
  REMINDER_SCOPE,
  CONNECTOR_TYPE,
  createReminderFunction,
  shouldIncludeReminder,
};
