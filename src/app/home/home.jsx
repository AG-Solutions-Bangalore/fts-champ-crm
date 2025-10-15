import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Users, 
  Building2, 
  Bell, 
  BarChart3, 
  PieChart, 
  RefreshCcw, 
  User, 
  IndianRupee,
  MoreVertical,
} from 'lucide-react';
import Cookies from 'js-cookie';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, registerables } from 'chart.js';
import { NumericFormat } from 'react-number-format';
import moment from 'moment';

import { 
  DASHBOARD_DATA, 
  DASHBOARD_MARK_NOTICE_AS_READ, 
  DASHBOARD_NOTICE, 
} from '@/api';

Chart.register(ArcElement, ...registerables);


const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card className="hover:shadow-md transition-all duration-200 border">
    <CardContent className="p-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <h3 className="text-xl font-bold text-gray-900">
            {value?.toLocaleString()}
          </h3>
        </div>
        <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${color} shadow-sm`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);


const DonationItem = ({ title, amount, count, color, textColor }) => (
  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border">
    <div className="flex items-center gap-2 flex-1">
      <div className={`w-6 h-6 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
        <IndianRupee className={`w-3 h-3 ${textColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900 text-sm">{title}</p>
        <NumericFormat
          value={amount}
          displayType="text"
          thousandSeparator={true}
          prefix="₹ "
          thousandsGroupStyle="lakh"
          className="text-xs text-gray-500"
        />
      </div>
    </div>
    <Badge variant="secondary" className={`${color} ${textColor} text-xs px-1.5 py-0 h-5 min-w-[1.5rem] justify-center`}>
      {count}
    </Badge>
  </div>
);


const NoticeItem = ({ notice, onAcknowledge, onView }) => (
  <div className="group p-2 rounded border hover:border-gray-300 hover:bg-gray-50 transition-all">
    <div className="flex justify-between items-start gap-1 mb-1">
      <div className="min-w-0 flex-1">
        <h4 className="font-medium text-gray-900 text-sm leading-tight truncate">
          {notice.notice_name}
        </h4>
        <p className="text-gray-600 text-xs mt-0.5 line-clamp-2">
          {notice.notice_detail}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Badge 
          variant={notice.is_read == 0 ? "default" : "secondary"} 
          className="text-xs px-1.5 py-0 h-5"
        >
          {notice.is_read == 0 ? 'New' : 'Read'}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onView(notice)} className="text-xs">
              View Details
            </DropdownMenuItem>
            {notice.is_read == 0 && (
              <DropdownMenuItem onClick={() => onAcknowledge(notice)} className="text-xs">
                Acknowledge
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    <div className="flex justify-between items-center mt-1">
      <span className="text-xs text-gray-500">
        {moment(notice.created_at).format('MMM DD')}
      </span>
      {notice.is_read == 0 && (
        <Button
          onClick={() => onAcknowledge(notice)}
          size="sm"
          className="h-6 text-xs px-2"
        >
          Ack
        </Button>
      )}
    </div>
  </div>
);

const Home = () => {
  const token = Cookies.get('token');
  const userTypeId = Cookies.get('user_type_id');
  const [open, setOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);



  const { 
    data: noticesData, 
    isLoading: loadingNotices,
    isFetching:fetchingNotices,
    refetch: refetchNotices 
  } = useQuery({
    queryKey: ['dashboard-notices', userTypeId],
    queryFn: async () => {
      const url = DASHBOARD_NOTICE;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!userTypeId,
   
  });

  const datanotification = noticesData?.data || [];


  const { 
    data: dashboardData, 
    isLoading: loadingDashboardData,
    isFetching:fetchingDashbpardData,
    refetch: refetchDashboard 
  } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const response = await axios.get(`${DASHBOARD_DATA}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    },
 
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000, 
    refetchOnMount: false, 
    refetchOnWindowFocus: false, 
    refetchOnReconnect: false, 
  });

  const result = dashboardData || {};


  const markNoticeAsReadMutation = useMutation({
    mutationFn: async (noticeId) => {
      
      const response = await axios.post(
        `${DASHBOARD_MARK_NOTICE_AS_READ}/${noticeId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
   onSuccess: (data) => {
         toast.success(data.message || 'Notice acknowledged successfully');
         refetchNotices();
       },
       onError: (error) => {
         toast.error(error.response.data.message || 'Error acknowledging notice');
       },
  });

  const handleMarkNoticeAsRead = (notice) => {
    setSelectedNotice(notice);
    setOpen(true);
  };

  const handleViewNotice = (notice) => {
    setSelectedNotice(notice);
    toast.info(`Viewing: ${notice.notice_name}`);
  };

  const confirmAcknowledge = () => {
    if (selectedNotice) {
      markNoticeAsReadMutation.mutate(selectedNotice.id);
    }
    setOpen(false);
  };


  const graphData = result?.graph1?.length > 0 ? {
    labels: result.graph1.map((item) => item.receipt_donation_type),
    datasets: [
      {
        data: result.graph1.map((item) => item.total_count),
        backgroundColor: [
          '#3b82f6', // blue-500
          '#f59e0b', // amber-500
          '#10b981', // emerald-500
          '#6366f1', // indigo-500
        ],
        hoverBackgroundColor: [
          '#2563eb', // blue-600
          '#d97706', // amber-600
          '#059669', // emerald-600
          '#4f46e5', // indigo-600
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  } : null;

  const cardConfig = [
    {
      title: 'Total Donors',
      value: result.total_companies_count,
      icon: Users,
      color: 'bg-blue-600',
    },
    {
      title: 'Individuals',
      value: result.individual_company_count,
      icon: User,
      color: 'bg-green-600',
    },
    {
      title: 'Companies/Trusts',
      value: result.other_companies_count,
      icon: Building2,
      color: 'bg-purple-600',
    },
    {
      title: 'Total Donation',
      value: result.total_donation,
      icon: IndianRupee,
      color: 'bg-amber-600',
    },
  ];

  const donationTypes = [
    {
      title: "OTS",
      amount: result.total_ots_donation,
      count: result.ots_receipts_count,
      color: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Membership",
      amount: result.total_membership_donation,
      count: result.mem_receipts_count,
      color: "bg-amber-50",
      textColor: "text-amber-600"
    },
    {
      title: "General",
      amount: result.total_general_donation,
      count: result.gen_receipts_count,
      color: "bg-green-50",
      textColor: "text-green-600"
    }
  ];

  const isLoading = loadingNotices || loadingDashboardData;
  const isFetching = fetchingNotices || fetchingDashbpardData;

  const handleRefresh = () => {
    refetchDashboard();
    refetchNotices();
    toast.success('Dashboard updated');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 space-y-3">
  
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="h-2.5 w-12" />
                  <Skeleton className="h-5 w-8" />
                </div>
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full rounded" />
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-28 w-full rounded" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 space-y-3 bg-gray-50">
   
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-600">Donation management overview</p>
        </div>
        <Button
          onClick={handleRefresh}
          size="sm"
          variant="outline"
          className="h-8"
        >
          {isFetching ? (
   <RefreshCcw className="h-3 w-3 mr-1 animate-spin" />
          ):(
            <RefreshCcw className="h-3 w-3 mr-1" />
          )}
       
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {cardConfig.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

     
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
 
        <div className="lg:col-span-4 space-y-3">
    
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-indigo-50 flex items-center justify-center">
                    <Bell className="w-3 h-3 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Recent Notices</CardTitle>
                    <CardDescription className="text-xs">Updates and announcements</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {datanotification.filter(n => n.is_read == 0).length} New
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1.5 max-h-80 overflow-y-auto">
                {datanotification.length > 0 ? (
                  datanotification.map((notice) => (
                    <NoticeItem
                      key={notice.id}
                      notice={notice}
                      onAcknowledge={handleMarkNoticeAsRead}
                      onView={handleViewNotice}
                    />
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Bell className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                    <p className="text-gray-500 text-xs">No new notices available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

     
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center">
                  <BarChart3 className="w-3 h-3 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Donation Summary</CardTitle>
                  <CardDescription className="text-xs">Breakdown by type</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1.5">
                {donationTypes.map((type, index) => (
                  <DonationItem
                    key={index}
                    title={type.title}
                    amount={type.amount}
                    count={type.count}
                    color={type.color}
                    textColor={type.textColor}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>


        <div className="space-y-3">
        
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded bg-purple-50 flex items-center justify-center">
                  <PieChart className="w-3 h-3 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Distribution</CardTitle>
                  <CardDescription className="text-xs">Receipt type distribution</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {graphData ? (
                <div className="h-48">
                  <Doughnut
                    data={graphData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 10,
                            font: {
                              size: 10
                            },
                            padding: 12
                          }
                        },
                      },
                      cutout: '55%',
                    }}
                  />
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500 text-xs">
                  No chart data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>


      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Acknowledge Notice</DialogTitle>
            <DialogDescription className="text-sm">
              Confirm you have read and understood this notice?
          
            </DialogDescription>
          </DialogHeader>
          {selectedNotice && (
            <div className="bg-gray-50 p-2 rounded border">
                 
              <h4 className="font-medium text-sm mb-1">{selectedNotice.notice_name}</h4>
              <p className="text-xs text-gray-600 line-clamp-3">{selectedNotice.notice_detail}</p>
            </div>
          )}
          <DialogFooter className="flex gap-1 sm:gap-1">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 h-8 text-xs">
              Cancel
            </Button>
            <Button onClick={confirmAcknowledge} className="flex-1 h-8 text-xs">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;