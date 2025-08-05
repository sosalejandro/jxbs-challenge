import { IsUUID, IsString, IsIn } from 'class-validator';

export class SendNotificationDto {
  @IsUUID()
  userId: string;

  @IsIn(['email', 'in-app'])
  type: 'email' | 'in-app';

  @IsString()
  message: string;
}
