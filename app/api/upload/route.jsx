import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'

// export const config = {
//     api: {
//         bodyParser: false,
//     },
// };

export async function POST(req, res) {
  console.log("You are in the resume file")
  const data = await req.formData();  
  const file = data.get('file')
  console.log(data)

  if (!data) {
    console.log("No file?")
    return NextResponse.json({ success: false })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
    
  // With the file data in the buffer, you can do whatever you want with it.
  // For this, we'll just write it to the filesystem in a new location
  const path = `data/input_resume/${file.name}`
  await writeFile(path, buffer)
  console.log(`open ${path} to see the uploaded file`)

  return NextResponse.json({ success: true })

};