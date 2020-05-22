import { bind, /* inject, */ BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import { DnaRepository } from '../repositories';
import { DNASpec } from '../controllers/specs/dna.specs';
import { Dna } from '../models';

@bind({ scope: BindingScope.TRANSIENT })
export class MutantService {
  mutantSequence: string[][] = [
    ['A', 'T', 'G', 'C', 'G', 'A'],
    ['C', 'A', 'G', 'T', 'G', 'C'],
    ['T', 'T', 'A', 'T', 'G', 'T'],
    ['A', 'G', 'A', 'A', 'G', 'G'],
    ['C', 'C', 'C', 'C', 'T', 'A'],
    ['T', 'C', 'A', 'C', 'T', 'G']];

  nitrogenousBases: string[] = ['A', 'T', 'C', 'G'];

  matchSize: number = 4;

  orientations: Function[] =
    [this.getRowBase, this.getColumnBase, this.getDiagonalBase]

  constructor(
    @repository(DnaRepository)
    private dnaRepository: DnaRepository
  ) { }

  async isMustant(dnaSpec: DNASpec) {
    const id = dnaSpec.dna.toString().replace(/,/g, '');
    let find = 2;
    await this.isValidDNA(dnaSpec.dna);
    let i = 0;
    do {
      find = this.validateBases(dnaSpec.dna, find, this.orientations[i]);
      i++;
    } while (find > 0 && this.orientations.length > i);

    this.dnaRepository.upsert(new Dna({ id, isMutant: find == 0 }));

    return find > 0 ? false : true;
  }

  isValidDNA(dna: string[]) {
    const result = dna.toString()
      .replace(/,/g, '').match(`^[${this.nitrogenousBases}]+$`);
    if (!result)
      this.throwError(400,
        'BadRequest',
        `Only nitrogenous bases are allowed: ${this.nitrogenousBases}`)
  }

  throwError(statusCode: number, name: string, message: string) {
    throw Object.assign(new Error(), {
      statusCode,
      name,
      message
    });
  }

  getRowBase(self: any, row: number) {
    return self.mutantSequence[row].join().replace(/,/g, '');
  }

  getColumnBase(self: any, column: number) {
    return self.mutantSequence
      .map((s: any) => s[column]).toString().replace(/,/g, '');
  }

  getDiagonalBase(self: any, diagonal: number) {
    let sequence = '';
    let middle = self.mutantSequence[0].length / 2;
    let i = 0;
    do {
      sequence += diagonal > middle - 1 ?
        self.mutantSequence[(diagonal - middle) + i][i] :
        self.mutantSequence[i][diagonal + i];
      i++;
    } while (sequence.length < self.matchSize);
    return sequence;
  }

  validateBases(dna: string[], find: number, getBase: Function) {
    for (let i = 0; i < this.mutantSequence.length; i++) {
      dna.some((seq, idx) => {
        const base = getBase(this, i);
        if (seq.startsWith(base.substr(0, this.matchSize))) {
          find--;
          dna.splice(idx, 1);
          return true;
        }
      });
      i = find == 0 ? this.mutantSequence.length : i;
    }
    return find;
  }
}
