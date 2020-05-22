import { model, Model, property } from "@loopback/repository";

@model()
export class Stat extends Model {
  @property({
    type: 'number',
  })
  count_mutant_dna?: number;

  @property({
    type: 'number',
  })
  count_human_dna?: number;

  @property({
    type: 'number',
  })
  ratio?: number;
}
