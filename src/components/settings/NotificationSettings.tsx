/**
 * NotificationSettings - UI for configuring reminder preferences
 */

import { useNotificationStore } from '../../store/useNotificationStore';
import { REMINDER_LABELS, DAY_LABELS } from '../../types/notifications';

export function NotificationSettings() {
  const { preferences, setEnabled, toggleReminder, updateReminder } =
    useNotificationStore();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
          <p className="text-sm text-gray-500">
            Set up reminders to stay on track
          </p>
        </div>

        {/* Master toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
        </label>
      </div>

      {/* Individual reminders */}
      <div
        className={`space-y-4 ${!preferences.enabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {preferences.reminders.map((reminder) => {
          const labels = REMINDER_LABELS[reminder.type];

          return (
            <div
              key={reminder.id}
              className="p-4 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {reminder.type === 'due_date' && '📅'}
                      {reminder.type === 'weekly' && '🔄'}
                      {reminder.type === 'inactivity' && '🐉'}
                    </span>
                    <h3 className="font-medium text-gray-800">{labels.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 ml-7">
                    {labels.description}
                  </p>
                </div>

                {/* Toggle switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminder.enabled}
                    onChange={() => toggleReminder(reminder.id)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>

              {/* Type-specific settings */}
              {reminder.enabled && (
                <div className="mt-3 ml-7">
                  {reminder.type === 'due_date' && (
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Remind me</span>
                      <input
                        type="number"
                        min={1}
                        max={14}
                        value={reminder.daysBefore ?? 3}
                        onChange={(e) =>
                          updateReminder(reminder.id, {
                            daysBefore: parseInt(e.target.value) || 3,
                          })
                        }
                        className="w-14 px-2 py-1 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      />
                      <span>days before due date</span>
                    </label>
                  )}

                  {reminder.type === 'weekly' && (
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Remind me every</span>
                      <select
                        value={reminder.dayOfWeek ?? 0}
                        onChange={(e) =>
                          updateReminder(reminder.id, {
                            dayOfWeek: parseInt(e.target.value),
                          })
                        }
                        className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      >
                        {DAY_LABELS.map((day, index) => (
                          <option key={day} value={index}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {reminder.type === 'inactivity' && (
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Remind me after</span>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={reminder.inactiveDays ?? 7}
                        onChange={(e) =>
                          updateReminder(reminder.id, {
                            inactiveDays: parseInt(e.target.value) || 7,
                          })
                        }
                        className="w-14 px-2 py-1 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      />
                      <span>days away</span>
                    </label>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-700">
          <span className="font-medium">Note:</span> Reminders appear when you
          open the app. Browser push notifications coming soon!
        </p>
      </div>
    </div>
  );
}
