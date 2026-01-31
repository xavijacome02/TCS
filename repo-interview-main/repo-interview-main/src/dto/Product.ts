import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { ProductInterface } from "../interfaces/product.interface";

export class ProductDTO implements ProductInterface {
  @IsNotEmpty()
  id!: string;

  @MinLength(6)
  @MaxLength(100)
  name!: string;

  @MinLength(10)
  @MaxLength(200)
  description!: string;

  @IsNotEmpty()
  logo!: string;

  @Type(() => Date)
  @IsDate()
  date_release!: Date;

  @Type(() => Date)
  @IsDate()
  date_revision!: Date;
}
