import path from 'node:path'
import fs from 'fs'
import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Xác định đường dẫn DB (dev vs build)
const dbPath = process.env.NODE_ENV === 'development'
  ? path.resolve(__dirname, '..', 'database', 'database.db')
  : path.join(process.resourcesPath, 'database', 'database.db')

// Đảm bảo thư mục tồn tại
fs.mkdirSync(path.dirname(dbPath), { recursive: true })
// Kết nối DB
let db
try {
  db = new sqlite3.Database(dbPath)
  console.log('Database connected successfully')
} catch (error) {
  console.error('Database connection failed:', error)
  db = null
}

// Helper tránh lặp lại check !db
const safe = (fn, fallback) => db ? fn() : fallback

// CRUD helpers - sử dụng callback API của sqlite3
const queryAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve([])
      return
    }
    db.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows || [])
    })
  })
}

const queryGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve(null)
      return
    }
    db.get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(row || null)
    })
  })
}

const execute = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve({ changes: 0, lastInsertRowid: 0 })
      return
    }
    db.run(sql, params, function(err) {
      if (err) reject(err)
      else resolve({ changes: this.changes, lastInsertRowid: this.lastID })
    })
  })
}

// Extra features
const transaction = (queries) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve([])
      return
    }
    db.serialize(() => {
      db.run('BEGIN TRANSACTION')
      const results = []
      let completed = 0
      
      queries.forEach((query, index) => {
        db.run(query.sql, query.params || [], function(err) {
          if (err) {
            db.run('ROLLBACK')
            reject(err)
            return
          }
          results[index] = { changes: this.changes, lastInsertRowid: this.lastID }
          completed++
          if (completed === queries.length) {
            db.run('COMMIT', (err) => {
              if (err) reject(err)
              else resolve(results)
            })
          }
        })
      })
    })
  })
}

const batch = (queries) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve({ changes: 0 })
      return
    }
    db.serialize(() => {
      let totalChanges = 0
      let completed = 0
      
      queries.forEach((query, index) => {
        db.run(query, [], function(err) {
          if (err) {
            reject(err)
            return
          }
          totalChanges += this.changes
          completed++
          if (completed === queries.length) {
            resolve({ changes: totalChanges })
          }
        })
      })
    })
  })
}

// Info & close
const getDatabaseInfo = () => ({
  path: dbPath,
  isOpen: db?.open || false,
  inTransaction: db?.inTransaction || false
})

const close = () => {
  if (db) {
    db.close()
    console.log('Database connection closed')
  }
}

export default db

export {
  db,
  queryAll,
  queryGet,
  execute,
  transaction,
  batch,
  getDatabaseInfo,
  close
}
