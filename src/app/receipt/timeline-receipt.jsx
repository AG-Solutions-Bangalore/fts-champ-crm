import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Mail, FileText, Download, Calendar, User, Printer, PlusCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
const TimelineReceipt = () => {
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);


  const followUpData = [
    {
      id: 1,
      action: "Receipt Created",
      date: "2024-01-15",
      time: "10:30 AM",
      description: "Receipt was successfully created in the system",
      type: "creation",
      status: "completed",
      user: "Admin User",
      duration: "2 mins",
      icon: PlusCircle,
      color: "bg-green-500",
      textColor: "text-green-700",
      bgColor: "bg-green-50"
    },
    {
      id: 2,
      action: "First Email Sent",
      date: "2024-01-15",
      time: "11:45 AM",
      description: "Initial receipt email sent to donor@gmail.com",
      type: "email",
      status: "delivered",
      user: "System",
      duration: "15 mins",
      icon: Mail,
      color: "bg-blue-500",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50"
    },
    {
      id: 3,
      action: "PDF Downloaded",
      date: "2024-01-16",
      time: "02:15 PM",
      description: "Receipt PDF was downloaded by staff member",
      type: "download",
      status: "completed",
      user: "Staff User",
      duration: "5 mins",
      icon: Download,
      color: "bg-purple-500",
      textColor: "text-purple-700",
      bgColor: "bg-purple-50"
    },
    {
      id: 4,
      action: "Email Opened by Donor",
      date: "2024-01-16",
      time: "04:30 PM",
      description: "Donor opened the receipt email",
      type: "email",
      status: "viewed",
      user: "Donor",
      duration: "2 mins",
      icon: Mail,
      color: "bg-teal-500",
      textColor: "text-teal-700",
      bgColor: "bg-teal-50"
    },
    {
      id: 5,
      action: "Second Email Sent",
      date: "2024-01-17",
      time: "09:30 AM",
      description: "Follow-up email sent to donor",
      type: "email",
      status: "sent",
      user: "System",
      duration: "10 mins",
      icon: Mail,
      color: "bg-blue-500",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50"
    },
    {
      id: 6,
      action: "Letter Printed",
      date: "2024-01-18",
      time: "03:20 PM",
      description: "Thank you letter was printed for physical copy",
      type: "print",
      status: "completed",
      user: "Admin User",
      duration: "8 mins",
      icon: Printer,
      color: "bg-orange-500",
      textColor: "text-orange-700",
      bgColor: "bg-orange-50"
    },
    {
      id: 7,
      action: "Follow-up Call",
      date: "2024-01-19",
      time: "11:00 AM",
      description: "Thank you call made to donor",
      type: "call",
      status: "completed",
      user: "Volunteer",
      duration: "12 mins",
      icon: User,
      color: "bg-indigo-500",
      textColor: "text-indigo-700",
      bgColor: "bg-indigo-50"
    }
  ];


  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { variant: "default", className: "bg-green-100 text-green-800 border-green-200" },
      sent: { variant: "secondary", className: "bg-blue-100 text-blue-800 border-blue-200" },
      delivered: { variant: "outline", className: "bg-teal-100 text-teal-800 border-teal-200" },
      viewed: { variant: "default", className: "bg-purple-100 text-purple-800 border-purple-200" }
    };
    
    const config = statusConfig[status] || { variant: "outline", className: "bg-gray-100 text-gray-800 border-gray-200" };
    
    return (
      <Badge variant={config.variant} className={`text-xs h-4 px-1.5 ${config.className}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };


  const groupEventsByDate = () => {
    const grouped = {};
    followUpData.forEach(event => {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    });
    return grouped;
  };

  const groupedEvents = groupEventsByDate();

  return (
    <Sheet open={isFollowUpOpen} onOpenChange={setIsFollowUpOpen}>
         <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-md transition-all duration-300 hover:scale-110 border border-[var(--color-border)] hover:shadow-md relative"
        >
          <History className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center border-2 border-white">
            {followUpData.length}
          </span>
        </Button>
      </SheetTrigger>
      </TooltipTrigger>
              <TooltipContent>
                View Receipt Timeline
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader className="border-b pb-3 mb-4">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-blue-600" />
            Receipt Timeline
          </SheetTitle>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline" className="text-xs bg-blue-50">
              Total: {followUpData.length} events
            </Badge>
            <Badge variant="outline" className="text-xs bg-green-50">
              Last: {followUpData[followUpData.length - 1]?.date}
            </Badge>
          </div>
        </SheetHeader>
        
        <ScrollArea className="h-full">
          <div className="space-y-4 pr-4">
            {Object.entries(groupedEvents).map(([date, events]) => (
              <div key={date} className="space-y-2">
                {/* Compact Date Header */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-sm text-gray-800">
                    {new Date(date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="text-xs text-blue-600 font-medium">
                    ({new Date(date).toLocaleDateString('en-US', { weekday: 'short' })})
                  </span>
                  <div className="flex-1" />
                  <Badge variant="secondary" className="bg-white text-blue-800 border-blue-200 text-xs h-5">
                    {events.length} {events.length === 1 ? 'event' : 'events'}
                  </Badge>
                </div>

                {/* Events for this date */}
                <div className="space-y-2 ml-1">
                  {events.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <div key={item.id} className="flex gap-3 group hover:bg-gray-50 rounded-lg p-2 transition-all duration-200 border border-transparent hover:border-gray-200">
                        {/* Timeline line and icon */}
                        <div className="flex flex-col items-center pt-0.5">
                          <div className={`w-7 h-7 rounded-full ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm border-2 border-white`}>
                            <IconComponent className="h-3.5 w-3.5 text-white" />
                          </div>
                          {index !== events.length - 1 && (
                            <div className="w-0.5 h-full bg-gradient-to-b from-gray-200 to-gray-100 mt-1" />
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <h4 className="font-semibold text-sm text-gray-900 truncate">{item.action}</h4>
                              {getStatusBadge(item.status)}
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap shrink-0">
                              {item.time}
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
                          
                          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                            <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded">
                              <User className="h-3 w-3" />
                              <span className="truncate max-w-[80px]">{item.user}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded">
                              <span className="text-xs">⏱️ {item.duration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {/* Summary Footer */}
        <div className="border-t pt-3 mt-4 bg-white">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-sm font-bold text-blue-600">
                {followUpData.filter(item => item.type === 'email').length}
              </div>
              <div className="text-xs text-blue-700 font-medium">Emails</div>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <div className="text-sm font-bold text-purple-600">
                {followUpData.filter(item => item.type === 'download').length}
              </div>
              <div className="text-xs text-purple-700 font-medium">Downloads</div>
            </div>
            <div className="bg-orange-50 p-2 rounded">
              <div className="text-sm font-bold text-orange-600">
                {followUpData.filter(item => item.type === 'print').length}
              </div>
              <div className="text-xs text-orange-700 font-medium">Prints</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="text-sm font-bold text-green-600">
                {followUpData.filter(item => item.type === 'creation').length}
              </div>
              <div className="text-xs text-green-700 font-medium">Created</div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TimelineReceipt;