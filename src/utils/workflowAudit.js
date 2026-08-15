export const buildWorkflowEvent = ({ step, action, user }) => ({
  step,
  action,
  at: new Date(),
  byUid: user?.authUid || user?.id || null,
  byName: user?.fullName || user?.name || user?.email || "Unknown user",
  byRole: user?.role || null,
});
