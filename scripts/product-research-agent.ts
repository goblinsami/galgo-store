import { ProductResearchService } from '../server/services/product-research/ProductResearchService.ts'

function argValue(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  if (index === -1) {
    return undefined
  }

  return process.argv[index + 1]
}

async function main() {
  const query = argValue('--query')
  const category = argValue('--category')
  const rawLimit = argValue('--limit')
  const limit = rawLimit ? Number.parseInt(rawLimit, 10) : undefined

  const run = await new ProductResearchService().run({
    query,
    category: category as never,
    limit,
  })

  console.log(JSON.stringify({
    runId: run.runId,
    mode: run.mode,
    marketplace: run.marketplace,
    candidates: run.candidates.length,
    errors: run.errors,
    latest: 'data/product-research/latest.json',
  }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Error desconocido.')
  process.exitCode = 1
})
