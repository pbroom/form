import {defineSchema, defineTable} from 'convex/server';
import {v} from 'convex/values';

export default defineSchema({
	projects: defineTable({
		name: v.string(),
		data: v.string(),
		createdAt: v.string(),
		updatedAt: v.string(),
	})
		.index('by_updatedAt', ['updatedAt'])
		.index('by_name', ['name']),
});
