import { Button } from '@/components/ui/button'
import { SquarePlus } from 'lucide-react'
import React from 'react'

const CreateUserSuperadmin = () => {
  return (
    <Button variant="default" size='sm' className={`ml-2`}>
             <SquarePlus className="h-4 w-4 mr-2" /> User
           </Button>
  )
}

export default CreateUserSuperadmin