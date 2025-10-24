import { Friendship } from '../models/friendship.model';
import { buildCrud } from '../utils/crudFactory';

export const { list, getById, create, updateById, removeById } = buildCrud(Friendship);
