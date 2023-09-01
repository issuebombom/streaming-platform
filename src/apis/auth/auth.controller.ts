import { Body, Controller, Get, Post, Render, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { RefreshAuthGuard } from './guard/auth.guard';
import { User, UserAfterAuth } from 'src/commons/decorators/user.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, //
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto, //
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login({
      loginDto,
    });
    res.cookie('refreshToken', refreshToken);
    res.cookie('accessToken', accessToken);
    // , { httpOnly: true, secure: true }
    // res.setHeader('Authorization', `Bearer ${accessToken}`);

    return { message: '로그인을 성공적으로 완료하였습니다.' };
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refresh(
    @User() user: UserAfterAuth,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = await this.authService.refresh({
      userId: user.id,
    });

    res.setHeader('Authorization', `Bearer ${accessToken}`);
    return { message: 'refresh' };
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('accessToken', '', { expires: new Date(0) });
    res.cookie('refreshToken', '', { expires: new Date(0) });
  }
}
