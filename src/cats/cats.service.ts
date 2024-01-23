import { BadRequestException, Body, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cat } from './entities/cat.entity';
import { Repository } from 'typeorm';
import { Breed } from '../breeds/entities/breed.entity';
import { ActiveUserInterface } from '../common/interfaces/active-user.interface';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private readonly catRepository: Repository<Cat>,
    @InjectRepository(Breed)
    private readonly breedsRepository: Repository<Breed>,
  ) {}

  async create(@Body() createCatDto: CreateCatDto, user: ActiveUserInterface) {
    try {
      const breed = await this.validateBreed(createCatDto.breed);

      return await this.catRepository.save({
        ...createCatDto,
        breed,
        userEmail: user.email,
      });
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async findAll(user: ActiveUserInterface) {
    if (user.role === Role.ADMIN) return await this.catRepository.find();

    return await this.catRepository.find({
      where: {
        userEmail: user.email,
      },
    });
  }

  async findOne(id: number, user: ActiveUserInterface) {
    const cat = await this.catRepository.findOneBy({ id });

    if (!cat) {
      throw new BadRequestException('Cat not found');
    }

    this.validateCatOwnership(cat, user);

    return cat;
  }

  async update(id: number, updateCatDto: UpdateCatDto, user: ActiveUserInterface) {
    await this.findOne(id, user);

    return await this.catRepository.update(id, {
      ...updateCatDto,
      breed: updateCatDto.breed ? await this.validateBreed(updateCatDto.breed) : undefined,
      userEmail: user.email,
    });
  }

  async remove(id: number, user: ActiveUserInterface) {
    await this.findOne(id, user);

    return await this.catRepository.softDelete({ id });
  }

  private async validateBreed(breed: string) {
    const breedEntity = await this.breedsRepository.findOneBy({ name: breed });

    if (!breedEntity) {
      throw new BadRequestException('Breed not found');
    }

    return breedEntity;
  }

  private validateCatOwnership(cat: Cat, user: ActiveUserInterface) {
    if (user.role !== Role.ADMIN && cat.userEmail !== user.email) {
      throw new UnauthorizedException();
    }
  }
}
