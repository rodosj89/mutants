import { DefaultCrudRepository } from '@loopback/repository';
import { Dna, DnaRelations } from '../models';
import { MutantsDbDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class DnaRepository extends DefaultCrudRepository<
  Dna,
  typeof Dna.prototype.id,
  DnaRelations
  > {
  constructor(
    @inject('datasources.mutantsDb') dataSource: MutantsDbDataSource,
  ) {
    super(Dna, dataSource);
  }

  async upsert(dna: Dna) {
    try {
      await this.update(dna);
    } catch (error) {
      this.create(dna);
    }
  }

  async getStats(): Promise<any> {
    const dnas = await this.find();
    const count_mutant_dna = dnas.filter(d => d.isMutant).length;
    const count_human_dna = dnas.length;
    return {
      count_mutant_dna,
      count_human_dna,
      ratio: parseFloat((count_mutant_dna / count_human_dna).toFixed(2)) || 0
    };
  }
}
