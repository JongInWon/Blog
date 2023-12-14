import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class PaginatePostDto {
  // 이전 마지막 데이터의 ID
  @IsNumber()
  @IsOptional()
  where__id_more_than?: number;

  // 정렬
  @IsIn(['ASC'])
  @IsOptional()
  order__createAt: 'ASC' = 'ASC';

  @IsNumber()
  @IsOptional()
  take: number = 20;
}
