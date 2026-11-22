// Images are kept below the storage bucket's enforced 100 KiB limit.
export const MAX_AVATAR_BYTES = 100 * 1024
const TYPES = ['image/jpeg','image/png','image/webp']

function loadImage(file) {
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file)
    const img=new Image()
    img.onload=()=>{URL.revokeObjectURL(url);resolve(img)}
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('لم نتمكن من قراءة الصورة'))}
    img.src=url
  })
}

function exportBlob(canvas,type,quality) {
  return new Promise(resolve=>canvas.toBlob(resolve,type,quality))
}

export async function compressAvatar(file){
  if(!TYPES.includes(file.type))throw new Error('الصيغ المسموحة: JPG أو PNG أو WebP')
  if(file.size<=MAX_AVATAR_BYTES)return file
  const img=await loadImage(file)
  if(!img.naturalWidth || !img.naturalHeight)throw new Error('الصورة غير صالحة')
  const canvas=document.createElement('canvas')
  const ctx=canvas.getContext('2d')
  if(!ctx)throw new Error('متصفحك لا يدعم ضغط الصور')
  const originalMax=Math.max(img.naturalWidth,img.naturalHeight)
  // Try WebP first, then JPEG for browsers without WebP encoding.
  const types=['image/webp','image/jpeg']
  const sizes=[1024,800,640,512,384,320,256,192,144]
  const qualities=[0.82,0.68,0.52,0.38]
  for (const type of types){
    for(const limit of sizes){
      const scale=Math.min(1,limit/originalMax)
      canvas.width=Math.max(1,Math.round(img.naturalWidth*scale))
      canvas.height=Math.max(1,Math.round(img.naturalHeight*scale))
      // JPEG doesn't support transparency: use a white background.
      ctx.clearRect(0,0,canvas.width,canvas.height)
      if(type==='image/jpeg'){
        ctx.fillStyle='#ffffff'
        ctx.fillRect(0,0,canvas.width,canvas.height)
      }
      ctx.drawImage(img,0,0,canvas.width,canvas.height)
      for(const quality of qualities){
        const blob=await exportBlob(canvas,type,quality)
        if(!blob || blob.type!==type)break
        if(blob.size>0 && blob.size<=MAX_AVATAR_BYTES){
          return new File([blob],'avatar.'+(type==='image/webp'?'webp':'jpg'),{type,lastModified:Date.now()})
        }
      }
    }
  }
  throw new Error('تعذر ضغط الصورة إلى 100 KB؛ جرّب صورة أخرى')
}
