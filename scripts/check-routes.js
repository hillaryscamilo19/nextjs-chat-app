import fs from "fs"
import path from "path"

function checkApiRoutes() {
  const apiDir = path.join(process.cwd(), "app", "api")

  const expectedRoutes = [
    "invite/generate/route.ts",
    "invite/verify/[token]/route.ts",
    "invite/join/[token]/route.ts",
    "messages/guest/route.ts",
  ]

  console.log("🔍 Verificando rutas API...\n")

  expectedRoutes.forEach((route) => {
    const fullPath = path.join(apiDir, route)
    const exists = fs.existsSync(fullPath)

    console.log(`${exists ? "✅" : "❌"} ${route}`)

    if (exists) {
      const content = fs.readFileSync(fullPath, "utf8")
      const hasPost = content.includes("export async function POST")
      const hasGet = content.includes("export async function GET")

      console.log(`   POST: ${hasPost ? "✅" : "❌"}`)
      console.log(`   GET: ${hasGet ? "✅" : "❌"}`)
    }
    console.log("")
  })
}

checkApiRoutes()
