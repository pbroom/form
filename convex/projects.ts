import {mutation, query} from './_generated/server';
import {v} from 'convex/values';

export const create = mutation({
	args: {
		name: v.string(),
		data: v.string(),
		createdAt: v.string(),
	},
	handler: async (ctx, args) => {
		const now = args.createdAt;
		const id = await ctx.db.insert('projects', {
			name: args.name,
			data: args.data,
			createdAt: now,
			updatedAt: now,
		});
		return id;
	},
});

export const save = mutation({
	args: {
		id: v.id('projects'),
		data: v.string(),
		updatedAt: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, {
			data: args.data,
			updatedAt: args.updatedAt,
		});
		return args.id;
	},
});

export const load = query({
	args: {
		id: v.id('projects'),
	},
	handler: async (ctx, args) => {
		const doc = await ctx.db.get(args.id);
		if (!doc) return null;
		return {
			id: doc._id,
			name: doc.name,
			data: doc.data,
			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt,
		};
	},
});
