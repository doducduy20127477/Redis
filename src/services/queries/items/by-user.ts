import { client } from '$services/redis';
import { deserialize } from './deserialize';
import { itemsIndexKey } from '$services/keys';

interface QueryOpts {
	page: number;
	perPage: number;
	sortBy: string;
	direction: string;
}

export const itemsByUser = async (userId: string, opts: QueryOpts) => {
	//query
	const query = `@ownerId:{${userId}}`;
	//search criteria
	const sortCriteria = opts.sortBy &&
		opts.direction && {
			BY: opts.sortBy,
			DIRECTION: opts.direction
		};
	// search to get items list
	const { total, documents } = await client.ft.search(itemsIndexKey(), query, {
		ON: 'HASH',
		SORTBY: sortCriteria,
		LIMIT: {
			from: opts.page * opts.perPage,
			size: opts.perPage
		}
	} as any);

	//return
	return {
		totalPages: Math.ceil(total / opts.perPage),
		items: documents.map(({ id, value }) => {
			return deserialize(id.replace('items#', ''), value as any);
		})
	};
};
