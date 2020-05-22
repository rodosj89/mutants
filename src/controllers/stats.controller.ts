import { DnaRepository } from "../repositories";
import { repository, property } from "@loopback/repository";
import { get } from "@loopback/rest";
import { Stat } from "./dtos/stats.dtos";

export class StatsController {
  constructor(
    @repository(DnaRepository)
    public dnaRepository: DnaRepository,
  ) { }

  @get('/stats', {
    responses: {
      '200': {
        description: 'Get mutant verification statistics',
        content: { 'application/json': { schema: Stat } },
      },
    },
  })
  async getStats(
  ): Promise<Stat> {
    return this.dnaRepository.getStats();
  }
}
