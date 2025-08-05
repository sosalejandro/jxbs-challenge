import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  async getPreferences(id: string) {
    const user = await this.findById(id);
    return user?.notificationPreferences;
  }

  async updatePreferences(id: string, prefs: any) {
    await this.usersRepo.update(id, { notificationPreferences: prefs });
    return this.getPreferences(id);
  }
}
