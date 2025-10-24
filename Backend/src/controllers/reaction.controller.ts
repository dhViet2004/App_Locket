import { Reaction } from '../models/reaction.model';
import { buildCrud } from '../utils/crudFactory';

export const { list, getById, create, updateById, removeById } = buildCrud(Reaction);
