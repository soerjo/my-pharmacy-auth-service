import { Injectable } from '@nestjs/common';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';

/**
 * Service for managing example resources.
 * Provides CRUD operations for example entities.
 */
@Injectable()
export class ExampleService {
  /**
   * Creates a new example resource.
   * @param createExampleDto - The data transfer object containing example details
   * @returns The created example resource
   */
  create(createExampleDto: CreateExampleDto) {
    return 'This action adds a new example';
  }

  /**
   * Retrieves all example resources.
   * @returns A list of all example resources
   */
  findAll() {
    return `This action returns all example`;
  }

  /**
   * Retrieves a single example resource by ID.
   * @param id - The unique identifier of the example
   * @returns The found example resource
   */
  findOne(id: number) {
    return `This action returns a #${id} example`;
  }

  /**
   * Updates an existing example resource.
   * @param id - The unique identifier of the example to update
   * @param updateExampleDto - The data transfer object containing update details
   * @returns The updated example resource
   */
  update(id: number, updateExampleDto: UpdateExampleDto) {
    return `This action updates a #${id} example`;
  }

  /**
   * Removes an example resource.
   * @param id - The unique identifier of the example to remove
   * @returns The result of the removal operation
   */
  remove(id: number) {
    return `This action removes a #${id} example`;
  }
}
