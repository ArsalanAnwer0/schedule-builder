import dbConnect from '../db/mongodb';
import ScheduleTemplate from '../db/models/ScheduleTemplate';
import ScheduleConfiguration from '../db/models/ScheduleConfiguration';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Migrate all ScheduleTemplate records to ScheduleConfiguration format
 * This function is idempotent - it won't re-migrate already migrated templates
 */
export async function migrateTemplatesToConfigurations() {
  await dbConnect();

  try {
    // Find all templates that haven't been migrated yet
    const templates = await ScheduleTemplate.find({
      migratedAt: null
    }).populate('createdBy');

    if (templates.length === 0) {
      return {
        success: true,
        migratedCount: 0,
        message: 'No templates to migrate'
      };
    }

    const migratedConfigs = [];
    const errors = [];

    for (const template of templates) {
      try {
        // Convert template to configuration format
        const configData = {
          name: template.name,
          description: template.description || `Migrated from template on ${new Date().toLocaleDateString()}`,
          organizationName: template.organizationName,
          createdBy: template.createdBy._id,

          // Business Hours - use template office hours for all days
          businessHours: DAYS_OF_WEEK.map(day => ({
            day,
            isOpen: true,
            startTime: template.config?.officeStartTime || '08:00',
            endTime: template.config?.officeEndTime || '16:30'
          })),

          // Shift Preferences
          shiftPreferences: {
            minWorkers: 1,
            maxWorkers: 5,
            minShiftLength: template.config?.minShiftLength || '2',
            maxShiftLength: template.config?.maxShiftLength || '8',
            allowSplitShifts: false
          },

          // Break Times - empty for migrated templates
          breakTimes: [],

          // Priority Slots - empty for migrated templates
          prioritySlots: [],

          // Overtime Rules
          overtimeRules: {
            maxHoursPerDay: '8',
            maxHoursPerWeek: template.config?.hoursPerWorkerPerWeek || template.config?.totalHoursPerWeek || '40',
            maxConsecutiveDays: '5',
            enableWarnings: true
          },

          // Preserve metadata
          timesUsed: template.timesUsed || 0,
          lastUsedAt: template.lastUsedAt,
          isDefault: template.isDefault || false
        };

        // Create new configuration
        const newConfig = await ScheduleConfiguration.create(configData);
        migratedConfigs.push(newConfig);

        // Mark template as migrated
        template.migratedAt = new Date();
        template.migratedToConfigId = newConfig._id;
        await template.save();

        console.log(`Migrated template "${template.name}" to configuration "${newConfig.name}"`);
      } catch (error) {
        console.error(`Failed to migrate template ${template._id}:`, error);
        errors.push({
          templateId: template._id,
          templateName: template.name,
          error: error.message
        });
      }
    }

    return {
      success: true,
      migratedCount: migratedConfigs.length,
      totalAttempted: templates.length,
      errors: errors.length > 0 ? errors : null,
      message: `Successfully migrated ${migratedConfigs.length} out of ${templates.length} templates`
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      migratedCount: 0,
      error: error.message
    };
  }
}
