import { integer, pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { createdAt, id, updatedAt } from '../schemaHelpers'
import { CourseTable } from './course'
import { relations } from 'drizzle-orm'
import { LessonTable } from './lesson'

export const CourseSectionStatuses = ['private', 'public'] as const
export type CourseSectionStatus = (typeof CourseSectionStatuses)[number]
export const CourseSectionStatusEnum = pgEnum(
  'course_section_status',
  CourseSectionStatuses
)

export const CourseSectionTable = pgTable('course_sections', {
  id,
  name: text().notNull(),
  status: CourseSectionStatusEnum().notNull().default('private'),
  order: integer().notNull(),
  courseId: uuid()
    .notNull()
    .references(() => CourseTable.id, { onDelete: 'restrict' }),
  createdAt,
  updatedAt,
})

export const CourseSectionRelationships = relations(
  CourseSectionTable,
  ({ one, many }) => ({
    course: one(CourseTable, {
      fields: [CourseSectionTable.courseId],
      references: [CourseTable.id],
    }),
    lessons: many(LessonTable),
  })
)
 