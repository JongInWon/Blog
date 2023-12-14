import { IsString } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';
import { PostsModel } from '../entities/posts.entity';

// Pink, Omit, Partial -> 타입을 반환
// PinkType, OmitType, PartialType -> 값을 반환
export class CreatePostDto extends PickType(PostsModel, [
  'title',
  'contents',
]) {}
