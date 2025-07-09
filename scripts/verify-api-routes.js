import fs from "fs"
import path from "path"

function verifyApiRoutes() {
  const apiDir = path.join(process.cwd(), "app", "api")

  const requiredRoutes = [
    "invite/generate/route.ts",
    "invite/verify/[token]/route.ts",
    "invite/join/[token]/route.ts",
    "messages/guest/route.ts",
    "messages/conversation/[id]/guest/route.ts", // ✅ Esta es la que falta
    "conversations/route.ts",
    "conversations/[id]/messages/route.ts",
  ]

  console.log("🔍 Verificando estructura de rutas API...\n")

  requiredRoutes.forEach((route) => {
    const fullPath = path.join(apiDir, route)
    const exists = fs.existsSync(fullPath)

    console.log(`${exists ? "✅" : "❌"} ${route}`)

    if (!exists) {
      // Crear directorios si no existen
      const dir = path.dirname(fullPath)
      if (!fs.existsSync(dir)) {
        console.log(`   📁 Creando directorio: ${dir}`)
        fs.mkdirSync(dir, { recursive: true })
      }
    }
  })

  console.log("\n📊 Estructura actual:")
  showDirectoryTree(apiDir, "", 0)
}

function showDirectoryTree(dir, prefix = "", depth = 0) {
  if (depth > 3) return // Limitar profundidad

  try {
    const items = fs.readdirSync(dir)

    items.forEach((item, index) => {
      const fullPath = path.join(dir, item)
      const isLast = index === items.length - 1
      const currentPrefix = prefix + (isLast ? "└── " : "├── ")
      const nextPrefix = prefix + (isLast ? "    " : "│   ")

      console.log(currentPrefix + item)

      if (fs.statSync(fullPath).isDirectory()) {
        showDirectoryTree(fullPath, nextPrefix, depth + 1)
      }
    })
  } catch (error) {
    console.log(prefix + "❌ Error leyendo directorio")
  }
}

verifyApiRoutes()
