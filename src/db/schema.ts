import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Districts table
export const districts = sqliteTable('districts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  districtCode: text('district_code').notNull().unique(),
  districtNameEn: text('district_name_en').notNull(),
  districtNameHi: text('district_name_hi').notNull(),
  stateName: text('state_name').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// District performance table
export const districtPerformance = sqliteTable('district_performance', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  districtId: integer('district_id').notNull().references(() => districts.id),
  dataDate: text('data_date').notNull(),
  workCompleted: integer('work_completed').notNull(),
  fundsUtilizedPercentage: integer('funds_utilized_percentage').notNull(),
  activeWorkers: integer('active_workers').notNull(),
  averageWage: integer('average_wage').notNull(),
  workCompletionRate: integer('work_completion_rate').notNull(),
  fundUtilizationRate: integer('fund_utilization_rate').notNull(),
  workerParticipationRate: integer('worker_participation_rate').notNull(),
  targetWorks: integer('target_works').notNull(),
  achievementWorks: integer('achievement_works').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Monthly trends table
export const monthlyTrends = sqliteTable('monthly_trends', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  districtId: integer('district_id').notNull().references(() => districts.id),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  workCompleted: integer('work_completed').notNull(),
  fundsUtilized: integer('funds_utilized').notNull(),
  activeWorkers: integer('active_workers').notNull(),
  createdAt: text('created_at').notNull(),
});

// Category breakdown table
export const categoryBreakdown = sqliteTable('category_breakdown', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  districtId: integer('district_id').notNull().references(() => districts.id),
  dataDate: text('data_date').notNull(),
  categoryName: text('category_name').notNull(),
  percentage: integer('percentage').notNull(),
  workCount: integer('work_count').notNull(),
  createdAt: text('created_at').notNull(),
});