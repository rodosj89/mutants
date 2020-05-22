import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import { Dna } from '../models';
import { DnaRepository } from '../repositories';
import { DNASpec } from './specs/dna.specs';
import { MutantService } from '../services';
import { inject, intercept } from '@loopback/core';

export class MutantsController {
  constructor(
    @inject('services.MutantService')
    private mutantService: MutantService
  ) { }

  @intercept('CacheDna')
  @post('/mutant', {
    responses: {
      '200': {
        description: 'Detects if the human sequence is mutant',
        content: { 'application/json': { schema: getModelSchemaRef(Dna) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DNASpec),
        },
      },
    })
    dna: DNASpec,
  ): Promise<any> {
    return await this.mutantService.isMustant(dna);
  }
}
