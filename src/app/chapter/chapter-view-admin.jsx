import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Building, Save, X, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { ADMIN_CHAPTER_DATA_CHAPTER_LIST, ADMIN_CHAPTER_UPDATE } from '../../api';
import UserListAdmin from './user-list-admin';
import DatasourceListAdmin from './datasource-list-admin';

const committee_type = [
  {
    value: "President",
    label: "President",
  },
  {
    value: "Secretary",
    label: "Secretary",
  },
  {
    value: "Treasurer",
    label: "Treasurer",
  },
];

const ChapterViewAdmin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");
  const id = Cookies.get("chapter_id");

  const [formData, setFormData] = useState({
    chapter_name: "",
    chapter_code: "",
    chapter_address: "",
    chapter_city: "",
    chapter_pin: "",
    chapter_state: "",
    chapter_phone: "",
    chapter_whatsapp: "",
    chapter_email: "",
    chapter_website: "",
    chapter_date_of_incorporation: "",
    chapter_region_code: "",
    auth_sign: "",
  });
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [initialFormData, setInitialFormData] = useState({});


  const { data: chapterData, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['chapter-admin', id],
    queryFn: async () => {
      const response = await axios.get(`${ADMIN_CHAPTER_DATA_CHAPTER_LIST}/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      return response.data;
    },
    enabled: !!id,
  });

  const users = chapterData?.users || [];
  const ImageUrl = chapterData?.image_url;
  const chapterCodeForCreateUser = chapterData?.chapter?.chapter_code;

  useEffect(() => {
    if (chapterData?.chapter) {
      const chapter = chapterData.chapter;
      const newFormData = {
        chapter_name: chapter.chapter_name || "",
        chapter_code: chapter.chapter_code || "",
        chapter_address: chapter.chapter_address || "",
        chapter_city: chapter.chapter_city || "",
        chapter_pin: chapter.chapter_pin || "",
        chapter_state: chapter.chapter_state || "",
        chapter_phone: chapter.chapter_phone || "",
        chapter_whatsapp: chapter.chapter_whatsapp || "",
        chapter_email: chapter.chapter_email || "",
        chapter_website: chapter.chapter_website || "",
        chapter_date_of_incorporation: chapter.chapter_date_of_incorporation || "",
        chapter_region_code: chapter.chapter_region_code || "",
        auth_sign: chapter.auth_sign || "",
      };
      
      setFormData(newFormData);
      setInitialFormData(newFormData);
    }
  }, [chapterData]);

  useEffect(() => {
    const isDirty = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    setIsFormDirty(isDirty);
  }, [formData, initialFormData]);

  const updateMutation = useMutation({
    mutationFn: (data) => 
      axios.put(`${ADMIN_CHAPTER_UPDATE}${id}`, data, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      }),
    onSuccess: (response) => {
      if (response.data.code === 200) {
        toast.success(response.data.msg);
        queryClient.invalidateQueries(['chapter', id]);
        refetch();
      } else if (response.data.code === 400) {
        toast.error(response.data.msg);
      } else {
        toast.error('Unexpected error occurred');
      }
    },
    onError: () => toast.error('Failed to update chapter'),
  });

  const handleInputChange = (field, value) => {
    const digitFields = ["chapter_pin", "chapter_phone", "chapter_whatsapp"];
    if (digitFields.includes(field)) {
      if (/^\d*$/.test(value)) {
        setFormData(prev => ({ ...prev, [field]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleContactChange = (field, value) => {
    if (/^\d*$/.test(value)) {
      const maxLength = field === 'chapter_pin' ? 6 : 10;
      if (value.length <= maxLength) {
        setFormData(prev => ({ ...prev, [field]: value }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isError) {
    return (
      <>
        <div className="w-full p-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-destructive font-medium mb-2">
                Error Fetching Chapter Data
              </div>
              <Button onClick={() => refetch()} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading chapter data...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-full space-y-2">
        {/* Header Card */}
        <Card className="p-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Building className="text-muted-foreground w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h1 className="text-md font-semibold text-gray-900">
                      {formData.chapter_name || "Chapter Details"}
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.chapter_city && formData.chapter_state && formData.chapter_pin && 
                        `${formData.chapter_city}, ${formData.chapter_state} - ${formData.chapter_pin}`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
          
          </div>
        </Card>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
          {/* Chapter Details Form */}
          <Card className="p-4">
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 p-0">
                <div className="flex items-center gap-2 text-xs p-2 rounded font-medium bg-[var(--team-color)] text-white">
                  <Info className="w-3 h-3" />
                  Chapter Details
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Address */}
                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="chapter_address" className="text-xs font-medium">
                      Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="chapter_address"
                      value={formData.chapter_address}
                      onChange={(e) => handleInputChange('chapter_address', e.target.value)}
                      placeholder="Enter address"
                      className="h-8 text-xs"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <Label htmlFor="chapter_phone" className="text-xs font-medium">
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="chapter_phone"
                      type="tel"
                      value={formData.chapter_phone}
                      onChange={(e) => handleContactChange('chapter_phone', e.target.value)}
                      placeholder="Enter phone number"
                      maxLength={10}
                      className="h-8 text-xs"
                      required
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-1">
                    <Label htmlFor="chapter_whatsapp" className="text-xs font-medium">
                      WhatsApp
                    </Label>
                    <Input
                      id="chapter_whatsapp"
                      type="tel"
                      value={formData.chapter_whatsapp}
                      onChange={(e) => handleContactChange('chapter_whatsapp', e.target.value)}
                      placeholder="Enter WhatsApp number"
                      maxLength={10}
                      className="h-8 text-xs"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <Label htmlFor="chapter_email" className="text-xs font-medium">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="chapter_email"
                      type="email"
                      value={formData.chapter_email}
                      onChange={(e) => handleInputChange('chapter_email', e.target.value)}
                      placeholder="Enter email address"
                      className="h-8 text-xs"
                      required
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-1">
                    <Label htmlFor="chapter_website" className="text-xs font-medium">
                      Website
                    </Label>
                    <Input
                      id="chapter_website"
                      value={formData.chapter_website}
                      onChange={(e) => handleInputChange('chapter_website', e.target.value)}
                      placeholder="Enter website URL"
                      className="h-8 text-xs"
                    />
                  </div>

                  {/* Committee Member for Sign */}
                  <div className="space-y-1">
                    <Label htmlFor="auth_sign" className="text-xs font-medium">
                      Comm. Member for Sign <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.auth_sign} 
                      onValueChange={(value) => handleInputChange('auth_sign', value)}
                      required
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select committee member" />
                      </SelectTrigger>
                      <SelectContent>
                        {committee_type.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-xs">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Incorporation Date */}
                  <div className="space-y-1">
                    <Label htmlFor="chapter_date_of_incorporation" className="text-xs font-medium">
                      Incorporation Date
                    </Label>
                    <Input
                      id="chapter_date_of_incorporation"
                      type="date"
                      value={formData.chapter_date_of_incorporation}
                      onChange={(e) => handleInputChange('chapter_date_of_incorporation', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </CardContent>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(-1)} 
                  className="flex items-center gap-2 h-8 text-xs"
                >
                  <X className="w-3 h-3" /> 
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isLoading || !isFormDirty} 
                  className="flex items-center gap-2 bg-[var(--team-color)] hover:bg-blue-700 h-8 text-xs"
                >
                  {updateMutation.isLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3" />
                      Update Chapter
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Users Tab */}
          <Card className='p-4'>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="">
              <TabsList className="grid w-full grid-cols-2 h-9 bg-[var(--team-color)] text-white rounded-md">
                <TabsTrigger value="users" className="text-xs">Users</TabsTrigger>
                <TabsTrigger value="datasource" className="text-xs">Datsource</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="">
                <UserListAdmin 
                  id={id} 
                  users={users} 
                  isLoading={isLoading} 
                  isError={isError} 
                  refetch={refetch} 
                  isFetching={isFetching} 
                  ImageUrl={ImageUrl} 
                  chapterCodeForCreateUser={chapterCodeForCreateUser}
                />
              
              </TabsContent>
              <TabsContent value="datasource" className="">
                <DatasourceListAdmin 
                  
                />
              
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </>
  );
}

export default ChapterViewAdmin;