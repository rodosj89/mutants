import { Model } from "@loopback/rest";
import { property, model } from "@loopback/repository";

@model()
export class DNASpec extends Model {
  @property({
    type: 'array',
    itemType: 'string',
    required: true
  })
  dna: string[];
}
