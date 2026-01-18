
import fs from 'fs'
import path from 'path'

const rootDir = process.cwd()
const excludedDirs = ['.git', 'node_modules', '.next', 'dist', 'build', 'coverage', '.gemini', '.agent']
const languageMap: Record<string, string> = {
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript',
    '.js': 'JavaScript',
    '.jsx': 'JavaScript',
    '.mjs': 'JavaScript',
    '.cjs': 'JavaScript',
    '.css': 'CSS',
    '.scss': 'CSS',
    '.sass': 'CSS',
    '.html': 'HTML',
    '.json': 'JSON'
}

const stats: Record<string, number> = {}

function walk(dir: string) {
    const files = fs.readdirSync(dir)
    for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
            if (!excludedDirs.includes(file)) {
                walk(filePath)
            }
        } else {
            const ext = path.extname(file).toLowerCase()
            const lang = languageMap[ext] || 'Other'

            // Skip 'Other' for cleaner code stats, or include if desired.
            // GitHub usually counts recognizable code.
            if (lang !== 'Other' && lang !== 'JSON') {
                stats[lang] = (stats[lang] || 0) + stat.size
            }
        }
    }
}

console.log('Calculating language statistics...')
walk(rootDir)

const totalBytes = Object.values(stats).reduce((a, b) => a + b, 0)
const results = Object.entries(stats)
    .map(([lang, bytes]) => ({
        lang,
        bytes,
        percent: (bytes / totalBytes) * 100
    }))
    .sort((a, b) => b.bytes - a.bytes)

console.log('\nLanguage breakdown:')
results.forEach(r => {
    console.log(`${r.lang}: ${r.percent.toFixed(1)}%`)
})
