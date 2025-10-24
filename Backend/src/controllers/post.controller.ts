import { Post } from '../models/post.model';
import { buildCrud } from '../utils/crudFactory';

export const { list, getById, create, updateById, removeById } = buildCrud(Post);
