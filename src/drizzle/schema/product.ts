import { relations } from 'drizzle-orm'
import { integer, pgEnum, pgTable, text } from 'drizzle-orm/pg-core'
import { createdAt, id, updatedAt } from '../schemaHelpers'
import { CourseProductTable } from './courseProduct'

export const ProductStatuses = ['private', 'public'] as const
export type ProductStatus = (typeof ProductStatuses)[number]
export const ProductStatusEnum = pgEnum('product_status', ProductStatuses)

export const ProductTable = pgTable('products', {
  id,
  name: text().notNull(),
  description: text().notNull(),
  imageUrl: text().notNull(),
  priceInDollars: integer().notNull(),
  status: ProductStatusEnum().notNull().default('private'),
  createdAt,
  updatedAt,
})

export const ProductRelationships = relations(ProductTable, ({ many }) => ({
  courseProducts: many(CourseProductTable),
}))
