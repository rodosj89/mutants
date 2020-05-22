import { Entity, model, property } from '@loopback/repository';

@model()
export class Dna extends Entity {
  @property({
    type: 'string',
    required: true,
    id: true,
  })
  id: string;

  @property({
    type: 'boolean',
    default: false,
  })
  isMutant?: boolean;


  constructor(data?: Partial<Dna>) {
    super(data);
  }
}

export interface DnaRelations {
  // describe navigational properties here
}

export type DnaWithRelations = Dna & DnaRelations;
