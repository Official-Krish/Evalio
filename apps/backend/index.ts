import { app } from "./src/app"
import { startWsServer } from "./src/ws"
import { initRedis } from "./src/lib/redis"

async function main() {
  await initRedis()

  const port = parseInt(Bun.env.PORT ?? "3000")

  app.listen({ port }, ({ hostname, port }) => {
    console.log(`backend running at http://${hostname}:${port}`)
  })

  startWsServer()
}

main().catch((err) => {
  console.error("Failed to start:", err)
  process.exit(1)
})

export { app }
export type App = typeof app
