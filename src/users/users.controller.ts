import { Controller, Get, Put, Param, Body, UseGuards, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private usersService: UsersService) {}

  @Get(':id/preferences')
  async getPreferences(@Param('id') id: string) {
    try {
      return await this.usersService.getPreferences(id);
    } catch (error) {
      this.logger.error('Error getting user preferences', error.stack || error.message);
      throw error;
    }
  }

  @Put(':id/preferences')
  async updatePreferences(@Param('id') id: string, @Body() prefs: UpdatePreferencesDto) {
    try {
      return await this.usersService.updatePreferences(id, prefs);
    } catch (error) {
      this.logger.error('Error updating user preferences', error.stack || error.message);
      throw error;
    }
  }
}
