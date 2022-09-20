import InlineEvent from './InlineEvent.svelte'
import InlineHtml from './InlineHtml.svelte'
import InlinePubkey from './InlinePubkey.svelte'
import InlineTagReference from './InlineTagReference.svelte'
import type { IEvent } from '../db'

interface IComponentContent {
  component: any
  content: object
}

/**
 * Splits a string into components
 * 
 * @param text - the text with tag references in the form of `#[<number>]`
 * @returns array<IComponent> and array of special elements and plain text
 *          chunks ready to be used with <svelte:component />
 */
export function tagLinky(text: string, event: IEvent) {
  const regexp = /#\[(.*?)\]/g
  const parts: IComponentContent[] = []
  let match: RegExpExecArray | null
  let start = 0
  while (match = regexp.exec(text)) {
    const gap = text.slice(start, match.index)
    if (gap.length > 0)
      parts.push({component: InlineHtml, content: {msg: gap}})
    const tagRef = parseInt(match[1])
    if (!Number.isInteger(tagRef)) {
      continue
    }
    const tag = event.tags[tagRef].split('»')
    if (tag) {
      switch(tag[0]) {
        case 'e':
          parts.push({component: InlineEvent, content: {eventId: tag[1]}})
          break
        case 'p':
          parts.push({component: InlinePubkey, content: {pubkey: tag[1]}})
          break
        default:
          parts.push({component: InlineTagReference, content: {k: tag[0], v: tag[1]}})
      }
    } else {
      parts.push({component: InlineHtml, content: {msg: match[0]}})
    }
    start = regexp.lastIndex
  }
  parts.push({component: InlineHtml, content: {msg: text.slice(start)}})
  return parts
}
