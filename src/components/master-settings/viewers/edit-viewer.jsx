import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, Building, Shield, Save, X, Loader2, Info } from 'lucide-react';
import { fetchViewerEditById, VIEWVER_EDIT_UPDATE } from '@/api';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import BASE_URL from '@/config/base-url';

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" }
];

const EditViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', userName: '', contact: '', email: '',
    startDate: '', endDate: '', chapter_id: '', user_position: '', status: '', chapterIds: '',viewerId:''
  });
  const [currentViewerChapterIds, setCurrentViewerChapterIds] = useState([]);
//   const [chapters, setChapters] = useState([]);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [initialFormData, setInitialFormData] = useState({});

  

//   useEffect(() => {
//     const fetchChapters = async () => {
//       try {
//         const response = await axios.get(`${BASE_URL}/api/fetch-chapters`, {
//           headers: { Authorization: `Bearer ${Cookies.get('token')}` },
//         });
//         setChapters(response.data.chapters || []);
//       } catch (error) {
//         toast.error('Failed to fetch chapters.');
//       }
//     };
//     fetchChapters();
//   }, []);
  const { data: chaptersData } = useQuery({
    queryKey: ['chapters'],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/fetch-chapters`, {
        headers: { Authorization: `Bearer ${Cookies.get('token')}` },
      });
      return response.data.chapters || [];
    },
  });
  const chapters = chaptersData || [];
  const { data: viewerData, isLoading } = useQuery({
    queryKey: ['viewer', id],
    queryFn: () => fetchViewerEditById(id),
    enabled: !!id && !!chapters.length,
  });
  useEffect(() => {
    if (viewerData?.users) {
      const user = viewerData.users;
      const chapterIdsArray = user.viewer_chapter_ids ? user.viewer_chapter_ids.split(',') : [];
      
      const newFormData = {
        firstName: user.first_name || '', 
        viewerId: user.id || '', 
        lastName: user.last_name || '', 
        userName: user.name || '',
        contact: user.phone || '', 
        email: user.email || '', 
        startDate: user.viewer_start_date || '',
        endDate: user.viewer_end_date || '', 
        chapter_id: user.chapter_id?.toString() || '', 
        user_position: user.user_position || '', 
        status: user.user_status || '', 
        chapterIds: user.viewer_chapter_ids || ''
      };
      
      setFormData(newFormData);
      setInitialFormData(newFormData);
      setCurrentViewerChapterIds(chapterIdsArray);
    }
  }, [viewerData]);

  useEffect(() => {
    const isDirty = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    setIsFormDirty(isDirty);
  }, [formData, initialFormData]);

  const updateMutation = useMutation({
    mutationFn: (data) => axios.post(VIEWVER_EDIT_UPDATE, data, {
      headers: { Authorization: `Bearer ${Cookies.get('token')}` },
    }),
    onSuccess: (response) => {
      if (response.data.code === 200) {
        toast.success(response.data.msg);
        queryClient.invalidateQueries(['viewers', id]);
        navigate('/master/viewer');
      } else if (response.data.code === 400) {
        toast.error(response.data.msg);
      } else {
        toast.error('Unexpected error occurred');
      }
    },
    onError: () => toast.error('Failed to update viewer'),
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChapterCheckbox = (chapterId, checked) => {
    const newChapterIds = checked
      ? [...currentViewerChapterIds, chapterId.toString()]
      : currentViewerChapterIds.filter(id => id !== chapterId.toString());
    
    setCurrentViewerChapterIds(newChapterIds);
    setFormData(prev => ({ ...prev, chapterIds: newChapterIds.join(',') }));
  };

  const handleContactChange = (value) => {
    if (/^\d*$/.test(value) && value.length <= 10) {
      handleInputChange('contact', value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      id: formData.viewerId, 
      first_name: formData.firstName, 
      last_name: formData.lastName,
      chapter_id: formData.chapter_id, 
      name: formData.userName, 
      mobile_number: formData.contact,
      email: formData.email, 
      viewer_start_date: formData.startDate, 
      viewer_end_date: formData.endDate,
      chapter_ids_comma_separated: formData.chapterIds, 
      user_position: formData.user_position,
      user_status: formData.status,
    };
    updateMutation.mutate(submitData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading viewer data...</span>
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
                  <h1 className="text-md font-semibold text-gray-900">Edit Viewer Donor</h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Update viewer donor information and details
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
          {/* Basic Information Section */}
    
           
            <Card className="p-4 ">
              <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm p-1 rounded-md px-1 font-medium bg-[var(--team-color)] text-white mb-4">
                  <Info className="w-4 h-4" />
                  Personal Details 
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* First Name */}
                  <div className="">
                    <Label htmlFor="firstName" className="text-xs font-medium">
                      First Name <span className="text-red-500">*</span>
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
                      Username <span className="text-red-500">*</span>
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
                      required
                    />
                  </div>
                  
                  {/* Status */}
                  <div className="">
                    <Label htmlFor="status" className="text-xs font-medium">
                      Status <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleInputChange('status', value)} 
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                          checked={currentViewerChapterIds.includes(chapter.id.toString())}
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
              disabled={updateMutation.isLoading || !isFormDirty} 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {updateMutation.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Viewer
                </>
              )}
            </Button>
          </div>
        </form>
      
    </div>
  );
};

export default EditViewer;