import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { z } from 'zod'
import type { ProductCandidate, ProductCandidateStatus, ProductResearchRun } from '../../../../shared/types/product-research'

const statusSchema = z.enum(['candidate', 'approved', 'rejected', 'imported'])
const candidateSchema = z.object({
  id: z.string(),
  source: z.literal('amazon'),
  marketplace: z.literal('amazon.es'),
  externalId: z.string(),
  asin: z.string(),
  sourceApi: z.literal('amazon-creators-api'),
  sourceUrl: z.string().url(),
  affiliateUrl: z.string().url(),
  imageUrl: z.string().url().nullable(),
  rawFacts: z.array(z.string()),
  suitabilityScore: z.number(),
  totalScore: z.number(),
  status: statusSchema,
}).passthrough()

const runSchema = z.object({
  runId: z.string(),
  createdAt: z.string(),
  source: z.literal('amazon'),
  marketplace: z.literal('amazon.es'),
  mode: z.enum(['live', 'fixture']),
  queries: z.array(z.object({
    query: z.string(),
    category: z.string(),
  })),
  candidates: z.array(candidateSchema),
  errors: z.array(z.object({
    query: z.string().optional(),
    externalId: z.string().optional(),
    code: z.string(),
    message: z.string(),
  })),
}).passthrough()

export class LocalCandidateStorage {
  constructor(private readonly rootDir = join(process.cwd(), 'data', 'product-research')) {}

  latestPath(): string {
    return join(this.rootDir, 'latest.json')
  }

  runPath(runId: string): string {
    return join(this.rootDir, 'runs', `${runId}.json`)
  }

  async saveRun(run: ProductResearchRun): Promise<void> {
    runSchema.parse(run)
    await this.writeAtomic(this.runPath(run.runId), run)
    const latestRaw = JSON.stringify(run, null, 2)
    runSchema.parse(JSON.parse(latestRaw))
    await this.writeAtomic(this.latestPath(), JSON.parse(latestRaw))
  }

  async readLatest(): Promise<ProductResearchRun | null> {
    try {
      return runSchema.parse(JSON.parse(await readFile(this.latestPath(), 'utf8'))) as unknown as ProductResearchRun
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null
      }

      throw error
    }
  }

  async findCandidate(candidateId: string): Promise<ProductCandidate | null> {
    const run = await this.readLatest()
    return run?.candidates.find((candidate) => candidate.id === candidateId) ?? null
  }

  async updateCandidateStatus(candidateId: string, status: ProductCandidateStatus): Promise<ProductCandidate> {
    const run = await this.readLatest()
    if (!run) {
      throw new Error('No hay resultados locales de investigacion.')
    }

    const index = run.candidates.findIndex((candidate) => candidate.id === candidateId)
    if (index === -1) {
      throw new Error('Candidato no encontrado.')
    }

    const current = run.candidates[index]
    if (!current) {
      throw new Error('Candidato no encontrado.')
    }

    const updated = { ...current, status }
    run.candidates[index] = updated
    await this.saveRun(run)
    return updated
  }

  private async writeAtomic(path: string, value: ProductResearchRun): Promise<void> {
    await mkdir(dirname(path), { recursive: true })
    const tempPath = `${path}.${process.pid}.${Date.now()}.tmp`
    await writeFile(tempPath, JSON.stringify(value, null, 2), 'utf8')
    runSchema.parse(JSON.parse(await readFile(tempPath, 'utf8')))
    await rename(tempPath, path)
  }
}
