import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Building, Save, X, Loader2, Info } from 'lucide-react';
import { VIEWVER_CREATE } from '@/api';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import BASE_URL from '@/config/base-url';

const CreateViewer = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    firstName: '', 
    lastName: '', 
    userName: '', 
    contact: '', 
    email: '',
    password: '',
    startDate: '', 
    endDate: '', 
    chapter_id: '', 
    user_position: '', 
    chapterIds: ''
  });
  
  const [selectedChapterIds, setSelectedChapterIds] = useState([]);


  // Fetch chapters
  const { data: chapters = [], isLoading: chaptersLoading } = useQuery({
    queryKey: ['chapters'],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/fetch-chapters`, {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` },
      });
      return response.data.chapters || [];
    },
  });

 

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => axios.post(VIEWVER_CREATE, data, {
      headers: { Authorization: `Bearer ${Cookies.get('token')}` },
    }),
    onSuccess: (response) => {
      if (response.data.code === 200) {
        toast.success(response.data.msg);
        queryClient.invalidateQueries(['viewers']);
        navigate('/master/viewer');
      } else if (response.data.code === 400) {
        toast.error(response.data.msg);
      } else {
        toast.error('Unexpected error occurred');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create viewer');
    },
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChapterCheckbox = (chapterId, checked) => {
    const newChapterIds = checked
      ? [...selectedChapterIds, chapterId.toString()]
      : selectedChapterIds.filter(id => id !== chapterId.toString());
    
    setSelectedChapterIds(newChapterIds);
    setFormData(prev => ({ ...prev, chapterIds: newChapterIds.join(',') }));
  };

  const handleContactChange = (value) => {
    if (/^\d*$/.test(value) && value.length <= 10) {
      handleInputChange('contact', value);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
   

    const submitData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      chapter_id: formData.chapter_id,
      username: formData.userName,
      mobile_number: formData.contact,
      email: formData.email,
      viewer_start_date: formData.startDate,
      viewer_end_date: formData.endDate,
      chapter_ids_comma_separated: formData.chapterIds,
      user_position: formData.user_position,
   
      password: formData.password,
    };

    createMutation.mutate(submitData);
  };

  if (chaptersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading chapters...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full space-y-2">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Building className="text-muted-foreground w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-md font-semibold text-gray-900">Create Viewer Donor</h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Add new viewer donor information and details
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
            <Button 
              onClick={() => navigate('/master/viewer')}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Back
            </Button>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Personal Details Section */}
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm p-1 rounded-md px-1 font-medium bg-[var(--team-color)] text-white mb-4">
              <Info className="w-4 h-4" />
              Personal Details 
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* First Name */}
              <div className="">
                <Label htmlFor="firstName" className="text-xs font-medium">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>

           

              {/* Username */}
              <div className="">
                <Label htmlFor="userName" className="text-xs font-medium">
                  Username(Login Name) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="userName"
                  value={formData.userName}
                  onChange={(e) => handleInputChange('userName', e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>

              {/* Mobile Number */}
              <div className="">
                <Label htmlFor="contact" className="text-xs font-medium">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contact"
                  type="tel"
                  value={formData.contact}
                  onChange={(e) => handleContactChange(e.target.value)}
                  placeholder="Enter mobile number"
                  maxLength={10}
                  required
                />
              </div>

              {/* Email */}
              <div className="">
                <Label htmlFor="email" className="text-xs font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              {/* Password */}
              <div className="">
                <Label htmlFor="password" className="text-xs font-medium">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              {/* Designation */}
              <div className="">
                <Label htmlFor="user_position" className="text-xs font-medium">
                  Designation <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="user_position"
                  value={formData.user_position}
                  onChange={(e) => handleInputChange('user_position', e.target.value)}
                  placeholder="Enter designation"
                  required
                />
              </div>

              {/* Start Date */}
              <div className="">
                <Label htmlFor="startDate" className="text-xs font-medium">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  min={getTodayDate()}
                  required
                />
              </div>

              {/* End Date */}
              <div className="">
                <Label htmlFor="endDate" className="text-xs font-medium">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  min={getTodayDate()}
                  required
                />
              </div>
              
           
             
            </div>

            <div className="flex items-center gap-2 text-sm p-1 rounded-md px-1 font-medium bg-[var(--team-color)] text-white mb-4">
              <Info className="w-4 h-4" />
              Chapter Selection
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
              <div className="space-y-2">
                <Label htmlFor="chapter_id" className="text-xs font-medium">
                  Primary Chapter <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.chapter_id} 
                  onValueChange={(value) => handleInputChange('chapter_id', value)} 
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {chapters.map((chapter) => (
                      <SelectItem key={chapter.id} value={chapter.id.toString()}>
                        {chapter.chapter_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">This is the main chapter associated with the viewer</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Additional Chapter Access</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {chapters.map((chapter) => (
                  <div key={chapter.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50/50">
                    <Checkbox
                      id={`chapter-${chapter.id}`}
                      checked={selectedChapterIds.includes(chapter.id.toString())}
                      onCheckedChange={(checked) => handleChapterCheckbox(chapter.id, checked)}
                    />
                    <Label htmlFor={`chapter-${chapter.id}`} className="text-sm font-normal cursor-pointer flex-1">
                      {chapter.chapter_name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/master/viewer')} 
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" /> 
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createMutation.isLoading } 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {createMutation.isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Viewer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateViewer;