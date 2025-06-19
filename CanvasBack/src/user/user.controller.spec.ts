import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';

describe('UserController', () => {
  let controller: UserController;
  let userService: Partial<Record<keyof UserService, jest.Mock>>;
  
  beforeEach(async () => {
    userService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should create a user and return it', async () => {
      const mockUser = { idUser: 1, emailUser: 'test@example.com' };
      const signupData = { emailUser: 'test@example.com', passwordUser: 'password123' };

      userService.create.mockResolvedValue(mockUser);

      const result = await controller.register(signupData);

      expect(userService.create).toHaveBeenCalledWith(signupData);
      expect(result).toEqual(mockUser);
    });
  });
});
