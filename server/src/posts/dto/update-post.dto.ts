import { CreatePostDto } from './create-post.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsString({ message: stringValidationMessage })
  @IsOptional()
  title?: string;

  @IsString({ message: stringValidationMessage })
  @IsOptional()
  contents?: string;
}
