import { Comment } from '../models/comment.model';
import { buildCrud } from '../utils/crudFactory';

export const { list, getById, create, updateById, removeById } = buildCrud(Comment);
