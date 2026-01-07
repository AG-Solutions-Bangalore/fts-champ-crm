import { Button } from '@/components/ui/button'
import { SquarePlus } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const EventList = () => {
  return (
   <Link 
                to='/event-create'
              
              >
                <Button variant="default">
                  <SquarePlus className="h-3 w-3 mr-2" /> Event Create
                </Button>
              </Link>
  )
}

export default EventList