import { db, type IEvent } from './db';

export const getEventReplies = async (eventId: string) => {
	return await db.events
		.where('tags')
		.startsWithIgnoreCase(`e»${eventId}`)
		.distinct()
		.and((it) => it.kind === 1)
		.and((it) => {
			const lastReply = it.tags
				.slice()
				.reverse()
				.find((tag) => !tag.includes('root') && tag.match(new RegExp(`e»${eventId}.*`, 'g'))?.[0]);
			return Boolean(lastReply);
		})
		.toArray();
};

export const getEventRoot = async ({ event, eventId }: { event?: IEvent; eventId?: string }) => {
	if (!event && eventId) event = await db.events.get(eventId);
	if (!event) return;
	const eTags = event.tags.filter((it) => it.startsWith('e»'));
	const rootTag = eTags.find((it) => it.includes('root'));
	console.log(rootTag, eTags);
	const id = rootTag ? rootTag.split('»', 3)[1] : eTags?.[0]?.split('»', 3)[1];
	if (!id) return;
	return await db.events.get(id);
};

export const getEventParent = async ({ event, eventId }: { event?: IEvent; eventId?: string }) => {
	if (!event && eventId) event = await db.events.get(eventId);
	if (!event) return;
	const match = event.tags
		.slice()
		.reverse()
		.find((it) => it.startsWith('e»'));
	if (!match) return;
	const id = match.split('»', 3)[1];
	return await db.events.get(id);
};
