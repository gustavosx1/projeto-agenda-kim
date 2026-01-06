import { supabase } from "../database/supabase.js"

/**
 * Converte arquivo para base64
 * @param {File} file - Arquivo a converter
 * @returns {Promise<string>} - String em base64
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Faz upload de múltiplos arquivos para Supabase Storage
 * @param {File[]} files - Array de arquivos para upload
 * @param {string} userId - ID do usuário
 * @param {string} eventId - ID do evento (opcional, para nomear pasta)
 * @returns {Promise<string[]>} - Array de URLs públicas dos arquivos
 */
export const uploadFilesToStorage = async (files, userId, eventId = "temp") => {
  const uploadedUrls = []

  for (const file of files) {
    try {
      // Validar tipo de arquivo
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      if (!allowedTypes.includes(file.type)) {
        console.warn(`Arquivo ${file.name} tem tipo não permitido`)
        continue
      }

      // Validar tamanho (máximo 10MB)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        console.warn(`Arquivo ${file.name} é muito grande (máximo 10MB)`)
        continue
      }

      // Criar nome único para o arquivo
      const timestamp = Date.now()
      const fileName = `${userId}/${eventId}/${timestamp}-${file.name}`

      // Fazer upload
      const { data, error } = await supabase.storage
        .from("event-attachments")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false
        })

      if (error) {
        console.error(`Erro ao fazer upload de ${file.name}:`, error)
        continue
      }

      // Obter URL pública
      const { data: publicData } = supabase.storage
        .from("event-attachments")
        .getPublicUrl(fileName)

      if (publicData?.publicUrl) {
        uploadedUrls.push(publicData.publicUrl)
      }
    } catch (err) {
      console.error(`Erro ao processar arquivo ${file.name}:`, err)
    }
  }

  return uploadedUrls
}

/**
 * Converte arquivos em base64 data URLs
 * @param {File[]} files - Array de arquivos
 * @returns {Promise<string[]>} - Array de data URLs base64
 */
export const filesToBase64Array = async (files) => {
  const base64Array = []

  for (const file of files) {
    try {
      const base64 = await fileToBase64(file)
      base64Array.push(base64)
    } catch (err) {
      console.error(`Erro ao converter ${file.name} para base64:`, err)
    }
  }

  return base64Array
}

/**
 * Valida se um arquivo é permitido
 * @param {File} file - Arquivo a validar
 * @returns {boolean} - true se permitido
 */
export const isFileAllowed = (file) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt']
  const fileName = file.name.toLowerCase()

  return allowedExtensions.some(ext => fileName.endsWith(ext))
}

/**
 * Obtém o nome do arquivo a partir de uma URL ou caminho
 * @param {string} filePath - Caminho ou URL do arquivo
 * @returns {string} - Nome do arquivo
 */
export const getFileName = (filePath) => {
  if (!filePath) return 'Arquivo'

  // Se for uma URL, extrai o nome
  if (filePath.startsWith('http')) {
    const url = new URL(filePath)
    const pathname = url.pathname
    return pathname.split('/').pop() || 'Arquivo'
  }

  // Se for um caminho, extrai o nome
  return filePath.split('/').pop() || 'Arquivo'
}

/**
 * Deleta um arquivo do Supabase Storage
 * @param {string} fileUrl - URL pública do arquivo
 * @returns {Promise<boolean>} - true se deletado com sucesso
 */
export const deleteFileFromStorage = async (fileUrl) => {
  try {
    // Extrair caminho do arquivo da URL
    const url = new URL(fileUrl)
    const filePath = url.pathname.split('/storage/v1/object/public/event-attachments/')[1]

    if (!filePath) return false

    const { error } = await supabase.storage
      .from("event-attachments")
      .remove([filePath])

    return !error
  } catch (err) {
    console.error('Erro ao deletar arquivo:', err)
    return false
  }
}
