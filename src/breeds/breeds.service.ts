import { Injectable } from '@nestjs/common';
import { CreateBreedDto } from './dto/create-breed.dto';
import { UpdateBreedDto } from './dto/update-breed.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Breed } from './entities/breed.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BreedsService {
  constructor(
    @InjectRepository(Breed)
    private readonly breedsRepository: Repository<Breed>,
  ) {}

  async create(createBreedDto: CreateBreedDto) {
    return await this.breedsRepository.save(createBreedDto);
  }

  async findAll() {
    return await this.breedsRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} breed`;
  }

  update(id: number, updateBreedDto: UpdateBreedDto) {
    console.log(updateBreedDto);

    return `This action updates a #${id} breed`;
  }

  remove(id: number) {
    return `This action removes a #${id} breed`;
  }
}
