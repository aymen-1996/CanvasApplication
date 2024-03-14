import { Test, TestingModule } from '@nestjs/testing';
import { DonneesController } from './donnees.controller';

describe('DonneesController', () => {
  let controller: DonneesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DonneesController],
    }).compile();

    controller = module.get<DonneesController>(DonneesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
