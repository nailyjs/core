import fs from 'node:fs'
import path from 'node:path'
import { argv } from 'node:process'
import { program } from 'commander'
import pLimit from 'p-limit'
import Sftp from 'ssh2-sftp-client'

const sftp = new Sftp()
const limit = pLimit(9) // 限制并发数为 9

function connect(host: string, username: string, password: string) {
  return sftp.connect({ host, username, password })
    .catch(err => console.error(`[SFTP] Error connecting to ${host}: ${err.message}`))
}

function isExist(serverPath: string) {
  return sftp.stat(serverPath)
    .then(() => {
      console.log(`[SFTP] ${serverPath} exists, removing it...`)
      return true
    })
    .catch(() => {
      console.log(`[SFTP] ${serverPath} does not exist, skipping...`)
      return false
    })
}

function remove(serverPath: string) {
  return sftp.rmdir(serverPath, true)
    .then(() => console.log(`[SFTP] ${serverPath} removed`))
    .catch(err => console.error(`[SFTP] Error removing ${serverPath}: ${err.message}`))
}

function mkdir(serverPath: string) {
  return sftp.mkdir(serverPath, true)
    .then(() => console.log(`[SFTP] ${serverPath} created`))
    .catch(err => console.error(`[SFTP] Error creating ${serverPath}: ${err.message}`))
}

// 递归上传目录内容
async function uploadDirectory(localDir: string, remoteDir: string) {
  const files = fs.readdirSync(localDir)
  const uploadPromises = []

  for (const file of files) {
    const localFilePath = path.join(localDir, file)
    const remoteFilePath = path.join(remoteDir, file).replace(/\\/g, '/') // 处理 Windows 环境下的路径问题

    const stats = fs.statSync(localFilePath)

    if (stats.isDirectory()) {
      await sftp.mkdir(remoteFilePath, true)
      uploadPromises.push(limit(() => uploadDirectory(localFilePath, remoteFilePath)))
    }
    else {
      const uploadPromise = limit(() =>
        sftp.put(localFilePath, remoteFilePath)
          .then(() => console.log(`[SFTP] ${localFilePath} => ${remoteFilePath}`))
          .catch(err => console.error(`[SFTP] Error uploading ${localFilePath}: ${err}`)),
      )

      uploadPromises.push(uploadPromise)
    }
  }

  await Promise.all(uploadPromises)
}

async function upload(localFolder: string, serverPath: string, host: string, username: string, password: string): Promise<void> {
  await connect(host, username, password)
  const removePathIsExist = await isExist(serverPath)
  if (removePathIsExist)
    await remove(serverPath)
  await mkdir(serverPath)
  await uploadDirectory(localFolder, serverPath)
  await sftp.end()
}

program.name('upload-server')
  .description('Upload files to a server')
  .version('1.0.0', '-v, --version')
  .argument('<folder>', 'Folder to upload')
  .argument('<server>', 'Server path to upload to')
  .option('-h, --host <host>', 'Host to connect to the server')
  .option('-u, --user <user>', 'User to connect to the server')
  .option('-p, --password <password>', 'Password to connect to the server')
  .action(async (folder: string, server: string, options: { host: string, user: string, password: string }) =>
    await upload(folder, server, options.host, options.user, options.password)
      .catch(err => console.error(`[SFTP] Error: ${err.message}`)),
  )
  .parse(argv)
