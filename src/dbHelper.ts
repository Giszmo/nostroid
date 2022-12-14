import { db, type IEvent } from './db';
import { getEventRootId } from './nostrHelper';

export const getEventReplies = async (eventId: string) => {
	return await db.events
		.where('tags')
		.startsWithIgnoreCase(`e»${eventId}`)
		.distinct()
		.and((it) => it.kind === 1)
		.and((it) => {
			const tags = it.tags.slice().filter((it) => it.startsWith('e»'));

			const lastReply = tags.find((tag) => tag.match(new RegExp(`e».*reply`, 'g'))?.[0]);

			if (lastReply) return lastReply.includes(eventId);
			const positionalReply = tags[1]?.match(new RegExp(`e».*`, 'g'))?.[0];

			if (positionalReply) return positionalReply.includes(eventId);

			const positionalRoot = tags[0].match(new RegExp(`e»${eventId}.*`, 'g'))?.[0];

			return Boolean(positionalRoot);
		})
		.toArray();
};

export const getEventRoot = async ({ event, eventId }: { event?: IEvent; eventId?: string }) => {
	if (!event && eventId) event = await db.events.getWithFallback(eventId);
	if (!event) return;
	const id = await getEventRootId(event);
	if (!id) return;
	return await db.events.getWithFallback(id);
};

export const getEventParent = async ({ event, eventId }: { event?: IEvent; eventId?: string }) => {
	if (!event && eventId) event = await db.events.getWithFallback(eventId);
	if (!event) return;
	const eTags = [...event.tags].reverse().filter((it) => it.startsWith('e»'));
	const replyTag = eTags.find((it) => it.includes('reply'));
	const id = replyTag ? replyTag.split('»', 3)[1] : eTags?.[0]?.split('»', 3)[1];
	if (!id) return;
	return await db.events.getWithFallback(id);
};
