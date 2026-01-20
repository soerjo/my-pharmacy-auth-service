import { Controller, Get, Param } from '@nestjs/common';
import { ExampleService } from './example.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Example')
@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all examples' })
  findAll() {
    return this.exampleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get example by ID' })
  @ApiParam({ name: 'id', description: 'Example ID' })
  findOne(@Param('id') id: string) {
    return this.exampleService.findOne(+id);
  }
}
