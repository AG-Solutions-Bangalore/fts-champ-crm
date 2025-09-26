import { Download } from 'lucide-react'
import React from 'react'

const DonorDownload = () => {
  return (
    <div className="p-4 border-b bg-muted/50">
    <div className="flex items-center gap-2 text-lg font-semibold">
      <Download className="w-5 h-5" />
      Download Donors
    </div>
    <div className="text-sm text-muted-foreground mt-0.5">
      Leave fields blank to get all records
    </div>
  </div>
  )
}

export default DonorDownload


