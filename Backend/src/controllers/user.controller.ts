import { User } from '../models/user.model';
import { buildCrud } from '../utils/crudFactory';

export const { list, getById, create, updateById, removeById } = buildCrud(User);
