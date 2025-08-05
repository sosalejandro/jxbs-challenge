import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

export interface IUsersService {
  findById(id: string): Promise<User | undefined>;
  findByEmail(email: string): Promise<User | undefined>;
  getPreferences(id: string): Promise<any>;
  updatePreferences(id: string, prefs: any): Promise<any>;
}

@Injectable()
export class UsersService implements IUsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async findById(id: string): Promise<User | undefined> {
    try {
      const user = await this.usersRepo.findOne({ where: { id } });
      return user === null ? undefined : user;
    } catch (error) {
      this.logger.error('Error finding user by id', error.stack || error.message);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await this.usersRepo.findOne({ where: { email } });
      return user === null ? undefined : user;
    } catch (error) {
      this.logger.error('Error finding user by email', error.stack || error.message);
      throw error;
    }
  }

  async getPreferences(id: string) {
    try {
      const user = await this.findById(id);
      return user?.notificationPreferences;
    } catch (error) {
      this.logger.error('Error getting user preferences', error.stack || error.message);
      throw error;
    }
  }

  async updatePreferences(id: string, prefs: any) {
    try {
      await this.usersRepo.update(id, { notificationPreferences: prefs });
      return this.getPreferences(id);
    } catch (error) {
      this.logger.error('Error updating user preferences', error.stack || error.message);
      throw error;
    }
  }
}
