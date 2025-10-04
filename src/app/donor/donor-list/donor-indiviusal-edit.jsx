import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { ArrowLeft, Info, User, Mail, MapPin, Building } from 'lucide-react';
import AddToGroup from './add-to-group';
import honorific from '@/utils/honorific';
import belongs_to from '@/utils/belongs-to';
import donor_type from '@/utils/donor-type';
import { DONOR_INDIVISUAL_EDIT_FETCH, DONOR_INDIVISUAL_FAMILY_GROUP_UPDATE, DONOR_INDIVISUAL_UPDATE_SUMBIT } from '@/api';
import BASE_URL from '@/config/base-url';
import { useFetchDataSource, useFetchPromoter, useFetchState } from '@/hooks/use-api';

// Shadcn Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Constants
const gender = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const corrpreffer = [
  { value: "Residence", label: "Residence" },
  { value: "Office", label: "Office" },
  { value: "Digital", label: "Digital" },
];

const DonorEditIndv = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = Cookies.get('token');
  const [userImageBase, setUserImageBase] = useState("");
  const [noImageUrl, setNoImageUrl] = useState("");
  
  // State
  const [donor, setDonor] = useState({
    indicomp_full_name: "",
    title: "",
    indicomp_father_name: "",
    indicomp_mother_name: "",
    indicomp_gender: "",
    indicomp_spouse_name: "",
    indicomp_dob_annualday: "",
    indicomp_doa: "",
    indicomp_pan_no: "",
    indicomp_image_logo: "",
    indicomp_remarks: "",
    indicomp_promoter: "",
    indicomp_newpromoter: "",
    indicomp_belongs_to: "",
    indicomp_source: "",
    indicomp_donor_type: "",
    indicomp_type: "",
    indicomp_mobile_phone: "",
    indicomp_mobile_whatsapp: "",
    indicomp_email: "",
    indicomp_website: "",
    indicomp_res_reg_address: "",
    indicomp_res_reg_area: "",
    indicomp_res_reg_ladmark: "",
    indicomp_res_reg_city: "",
    indicomp_res_reg_state: "",
    indicomp_res_reg_pin_code: "",
    indicomp_off_branch_address: "",
    indicomp_off_branch_area: "",
    indicomp_off_branch_ladmark: "",
    indicomp_off_branch_city: "",
    indicomp_off_branch_state: "",
    indicomp_off_branch_pin_code: "",
    indicomp_corr_preffer: "",
  });

  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);

  // API calls with TanStack Query
  const {data:statesHook} = useFetchState()
  const {data:datasourceHook} = useFetchDataSource()
  const {data:promoterHook} = useFetchPromoter()

  const { data: donorData, isLoading } = useQuery({
    queryKey: ['donor', id],
    queryFn: async () => {
      const response = await axios.get(`${DONOR_INDIVISUAL_EDIT_FETCH}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const donorData = response.data?.individualCompany;
      const cleanedData = {};
      
      Object.keys(donorData).forEach(key => {
        cleanedData[key] = donorData[key] === null ? "" : donorData[key];
      });
      
      setDonor(cleanedData);
      const userImageBase = response.data.image_url.find(
        (img) => img.image_for === "Donor"
      )?.image_url;
      const noImageUrl = response.data.image_url.find(
        (img) => img.image_for === "No Image"
      )?.image_url;

      setUserImageBase(userImageBase);
      setNoImageUrl(noImageUrl);
      return response.data;
    },
    enabled: !!id,
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await axios({
        url: `${DONOR_INDIVISUAL_UPDATE_SUMBIT}${id}?_method=PUT`,
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.code === 200) {
        toast.success(data.msg);
        queryClient.invalidateQueries(['donor', id]);
        navigate('/donor/donors');
      } else if (data.code === 400) {
        toast.error(data.msg);
      } else {
        toast.error('Unexpected Error');
      }
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error('An error occurred during updating');
    },
  });

  const familyGroupMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios({
        url: `${DONOR_INDIVISUAL_FAMILY_GROUP_UPDATE}${id}`,
        method: 'PUT',
        data,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.msg||'Data Successfully Updated');
      setDonor(data.individualCompany);
      setShowModal(false);
      navigate('/donor/donors');
    },
    onError: (error) => {
      toast.error('Failed to update family group');
    },
  });

  // Handlers
  const validateOnlyDigits = (inputtxt) => {
    const phoneno = /^\d+$/;
    return inputtxt.match(phoneno) || inputtxt.length === 0;
  };

  const onInputChange = (e) => {
    const { name, value } = e.target;
    
    if (['indicomp_mobile_phone', 'indicomp_mobile_whatsapp', 'indicomp_res_reg_pin_code', 'indicomp_off_branch_pin_code'].includes(name)) {
      if (validateOnlyDigits(value)) {
        setDonor(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === "indicomp_image_logo") {
      const file = e.target.files[0];
      setDonor(prev => ({ ...prev, indicomp_image_logo: file }));
    } else {
      setDonor(prev => ({ ...prev, [name]: value }));
    }
  };

  const onSelectChange = (name, value) => {
    setDonor(prev => ({ ...prev, [name]: value }));
  };

  const onChangePanNumber = (e) => {
    setDonor(prev => ({ ...prev, indicomp_pan_no: e.target.value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!donor.indicomp_full_name?.trim()) {
      newErrors.indicomp_full_name = "Full Name is required";
    }
    if (!donor.title) {
      newErrors.title = "Title is required";
    }
    if (!donor.indicomp_gender) {
      newErrors.indicomp_gender = "Gender is required";
    }
    if (!donor.indicomp_promoter) {
      newErrors.indicomp_promoter = "Promoter is required";
    }
    if (donor.indicomp_promoter === "Other" && !donor.indicomp_newpromoter?.trim()) {
      newErrors.indicomp_newpromoter = "Please specify promoter";
    }
    if (!donor.indicomp_mobile_phone || !/^\d{10}$/.test(donor.indicomp_mobile_phone)) {
      newErrors.indicomp_mobile_phone = "Valid 10-digit Mobile Number is required";
    }
    if (!donor.indicomp_res_reg_city?.trim()) {
      newErrors.indicomp_res_reg_city = "City is required";
    }
    if (!donor.indicomp_res_reg_state) {
      newErrors.indicomp_res_reg_state = "State is required";
    }
    if (!donor.indicomp_res_reg_pin_code || !/^\d{6}$/.test(donor.indicomp_res_reg_pin_code)) {
      newErrors.indicomp_res_reg_pin_code = "Valid 6-digit Pincode is required";
    }
    if (!donor.indicomp_corr_preffer) {
      newErrors.indicomp_corr_preffer = "Correspondence Preference is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    const formData = new FormData();

    const processValue = (value) => {
      if (value === "" || value === null || value === undefined) {
        return "";
      }
      return value;
    };

    formData.append("indicomp_full_name", processValue(donor.indicomp_full_name));
    formData.append("title", processValue(donor.title));
    formData.append("indicomp_type", processValue(donor.indicomp_type));
    formData.append("indicomp_father_name", processValue(donor.indicomp_father_name));
    formData.append("indicomp_mother_name", processValue(donor.indicomp_mother_name));
    formData.append("indicomp_gender", processValue(donor.indicomp_gender));
    formData.append("indicomp_spouse_name", processValue(donor.indicomp_spouse_name));
    formData.append("indicomp_dob_annualday", processValue(donor.indicomp_dob_annualday));
    formData.append("indicomp_doa", processValue(donor.indicomp_doa));
    formData.append("indicomp_pan_no", processValue(donor.indicomp_pan_no));

    // Handle file upload
    if (donor.indicomp_image_logo instanceof File) {
      formData.append("indicomp_image_logo", donor.indicomp_image_logo);
    } else if (donor.indicomp_image_logo) {
      formData.append("indicomp_image_logo", processValue(donor.indicomp_image_logo));
    }

    formData.append("indicomp_remarks", processValue(donor.indicomp_remarks));
    formData.append("indicomp_promoter", processValue(donor.indicomp_promoter));
    formData.append("indicomp_newpromoter", processValue(donor.indicomp_newpromoter));
    formData.append("indicomp_source", processValue(donor.indicomp_source));
    formData.append("indicomp_mobile_phone", processValue(donor.indicomp_mobile_phone));
    formData.append("indicomp_mobile_whatsapp", processValue(donor.indicomp_mobile_whatsapp));
    formData.append("indicomp_email", processValue(donor.indicomp_email));
    formData.append("indicomp_website", processValue(donor.indicomp_website));
    formData.append("indicomp_res_reg_address", processValue(donor.indicomp_res_reg_address));
    formData.append("indicomp_res_reg_area", processValue(donor.indicomp_res_reg_area));
    formData.append("indicomp_res_reg_ladmark", processValue(donor.indicomp_res_reg_ladmark));
    formData.append("indicomp_res_reg_city", processValue(donor.indicomp_res_reg_city));
    formData.append("indicomp_res_reg_state", processValue(donor.indicomp_res_reg_state));
    formData.append("indicomp_res_reg_pin_code", processValue(donor.indicomp_res_reg_pin_code));
    formData.append("indicomp_off_branch_address", processValue(donor.indicomp_off_branch_address));
    formData.append("indicomp_off_branch_area", processValue(donor.indicomp_off_branch_area));
    formData.append("indicomp_off_branch_ladmark", processValue(donor.indicomp_off_branch_ladmark));
    formData.append("indicomp_off_branch_city", processValue(donor.indicomp_off_branch_city));
    formData.append("indicomp_off_branch_state", processValue(donor.indicomp_off_branch_state));
    formData.append("indicomp_off_branch_pin_code", processValue(donor.indicomp_off_branch_pin_code));
    formData.append("indicomp_corr_preffer", processValue(donor.indicomp_corr_preffer));
    formData.append("indicomp_belongs_to", processValue(donor.indicomp_belongs_to));
    formData.append("indicomp_donor_type", processValue(donor.indicomp_donor_type));

    updateMutation.mutate(formData);
  };

  const familyGroupStatus = (status) => {
    const data = status === "add_to_family_group" 
      ? { indicomp_related_id: donor.indicomp_related_id }
      : { leave_family_group: true };
    
    familyGroupMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
               
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/donor/donors')}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Edit Individual Donor</h1>
            <p className="text-sm text-muted-foreground">Update donor information and details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/donor/donors')}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isLoading}
          >
            {updateMutation.isLoading ? 'Updating...' : 'Update Donor'}
          </Button>
                        <Button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={donor.indicomp_related_id !== donor.indicomp_fts_id}
                variant={donor.indicomp_related_id === donor.indicomp_fts_id ? "default" : "outline"}
                className={
                  donor.indicomp_related_id === donor.indicomp_fts_id 
                    ? "bg-green-600 hover:bg-green-700" 
                    : ""
                }
              >
                Attach to Group
              </Button>

              <Button
                type="button"
                onClick={() => familyGroupStatus("leave_family_group")}
                disabled={donor.indicomp_related_id === donor.indicomp_fts_id}
                variant={donor.indicomp_related_id !== donor.indicomp_fts_id ? "default" : "outline"}
                className={
                  donor.indicomp_related_id !== donor.indicomp_fts_id 
                    ? "bg-orange-600 hover:bg-orange-700" 
                    : ""
                }
              >
                Leave Group
              </Button>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Communication
          </TabsTrigger>
          <TabsTrigger value="residence" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Residence
          </TabsTrigger>
          <TabsTrigger value="office" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Office
          </TabsTrigger>
        </TabsList>

        {/* Personal Details Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>Basic details and personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                  <Select value={donor.title} onValueChange={(value) => onSelectChange("title", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Title" />
                    </SelectTrigger>
                    <SelectContent>
                      {honorific.map(title => (
                        <SelectItem key={title} value={title}>{title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_full_name">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="indicomp_full_name"
                    name="indicomp_full_name"
                    value={donor.indicomp_full_name}
                    onChange={onInputChange}
                    placeholder="Enter full name"
                  />
                  {errors.indicomp_full_name && <p className="text-red-500 text-xs">{errors.indicomp_full_name}</p>}
                </div>

                {/* Father Name */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_father_name">Father Name</Label>
                  <Input
                    id="indicomp_father_name"
                    name="indicomp_father_name"
                    value={donor.indicomp_father_name}
                    onChange={onInputChange}
                    placeholder="Father's name"
                  />
                </div>

                {/* Mother Name */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_mother_name">Mother Name</Label>
                  <Input
                    id="indicomp_mother_name"
                    name="indicomp_mother_name"
                    value={donor.indicomp_mother_name}
                    onChange={onInputChange}
                    placeholder="Mother's name"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_gender">Gender <span className="text-red-500">*</span></Label>
                  <Select value={donor.indicomp_gender} onValueChange={(value) => onSelectChange("indicomp_gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {gender.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.indicomp_gender && <p className="text-red-500 text-xs">{errors.indicomp_gender}</p>}
                </div>

                {/* Spouse Name */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_spouse_name">Spouse Name</Label>
                  <Input
                    id="indicomp_spouse_name"
                    name="indicomp_spouse_name"
                    value={donor.indicomp_spouse_name}
                    onChange={onInputChange}
                    placeholder="Spouse name"
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_dob_annualday">Date of Birth</Label>
                  <Input
                    type="date"
                    id="indicomp_dob_annualday"
                    name="indicomp_dob_annualday"
                    value={donor.indicomp_dob_annualday}
                    onChange={onInputChange}
                  />
                </div>

                {/* Date of Anniversary */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_doa">Date of Anniversary</Label>
                  <Input
                    type="date"
                    id="indicomp_doa"
                    name="indicomp_doa"
                    value={donor.indicomp_doa}
                    onChange={onInputChange}
                  />
                </div>

                {/* PAN Number */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_pan_no">PAN Number</Label>
                  <Input
                    id="indicomp_pan_no"
                    name="indicomp_pan_no"
                    value={donor.indicomp_pan_no}
                    onChange={onChangePanNumber}
                    placeholder="AAAAA9999A"
                  />
                </div>

                {/* Upload Image */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_image_logo">Profile Image</Label>
                  <div className="flex items-center gap-3">
                    {donor.indicomp_image_logo && (
                      <img
                        src={
                          typeof donor.indicomp_image_logo === "string"
                            ? `${userImageBase}${donor.indicomp_image_logo}`
                            : URL.createObjectURL(donor.indicomp_image_logo)
                        }
                        alt="User"
                        className="w-10 h-10 object-cover rounded-md border"
                      />
                    )}
                    <Input
                      type="file"
                      id="indicomp_image_logo"
                      accept="image/*"
                      onChange={(e) =>
                        setDonor({
                          ...donor,
                          indicomp_image_logo: e.target.files[0],
                        })
                      }
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                {/* Remarks */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_remarks">Remarks</Label>
                  <Input
                    id="indicomp_remarks"
                    name="indicomp_remarks"
                    value={donor.indicomp_remarks}
                    onChange={onInputChange}
                    placeholder="Additional remarks"
                  />
                </div>

                {/* Promoter */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_promoter">Promoter <span className="text-red-500">*</span></Label>
                  <Select value={donor.indicomp_promoter} onValueChange={(value) => onSelectChange("indicomp_promoter", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Promoter" />
                    </SelectTrigger>
                    <SelectContent>
                      {promoterHook?.promoter.map(option => (
                        <SelectItem key={option.indicomp_promoter} value={option.indicomp_promoter}>
                          {option.indicomp_promoter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.indicomp_promoter && <p className="text-red-500 text-xs">{errors.indicomp_promoter}</p>}
                </div>

                {/* New Promoter (if Other selected) */}
                {donor.indicomp_promoter === "Other" && (
                  <div className="space-y-2">
                    <Label htmlFor="indicomp_newpromoter">New Promoter <span className="text-red-500">*</span></Label>
                    <Input
                      id="indicomp_newpromoter"
                      name="indicomp_newpromoter"
                      value={donor.indicomp_newpromoter}
                      onChange={onInputChange}
                      placeholder="Specify promoter"
                    />
                    {errors.indicomp_newpromoter && <p className="text-red-500 text-xs">{errors.indicomp_newpromoter}</p>}
                  </div>
                )}

                {/* Belong To */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_belongs_to">Belong To</Label>
                  <Select value={donor.indicomp_belongs_to} onValueChange={(value) => onSelectChange("indicomp_belongs_to", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Belong To" />
                    </SelectTrigger>
                    <SelectContent>
                      {belongs_to.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Source */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_source">Source</Label>
                  <Select value={donor.indicomp_source} onValueChange={(value) => onSelectChange("indicomp_source", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Source" />
                    </SelectTrigger>
                    <SelectContent>
                      {datasourceHook?.datasource.map(option => (
                        <SelectItem key={option.id} value={option.data_source_type}>
                          {option.data_source_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Donor Type */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_donor_type">Donor Type</Label>
                  <Select value={donor.indicomp_donor_type} onValueChange={(value) => onSelectChange("indicomp_donor_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Donor Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {donor_type.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_type">Type</Label>
                  <Input
                    id="indicomp_type"
                    name="indicomp_type"
                    value={donor.indicomp_type}
                    onChange={onInputChange}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Details Tab */}
        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Communication Details</CardTitle>
              <CardDescription>Contact information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Mobile Phone */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_mobile_phone">Mobile Phone <span className="text-red-500">*</span></Label>
                  <Input
                    type="tel"
                    id="indicomp_mobile_phone"
                    name="indicomp_mobile_phone"
                    value={donor.indicomp_mobile_phone}
                    onChange={onInputChange}
                    maxLength={10}
                    placeholder="10-digit number"
                  />
                  {errors.indicomp_mobile_phone && <p className="text-red-500 text-xs">{errors.indicomp_mobile_phone}</p>}
                </div>

                {/* WhatsApp */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_mobile_whatsapp">WhatsApp</Label>
                  <Input
                    type="tel"
                    id="indicomp_mobile_whatsapp"
                    name="indicomp_mobile_whatsapp"
                    value={donor.indicomp_mobile_whatsapp}
                    onChange={onInputChange}
                    maxLength={10}
                    placeholder="WhatsApp number"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_email">Email</Label>
                  <Input
                    type="email"
                    id="indicomp_email"
                    name="indicomp_email"
                    value={donor.indicomp_email}
                    onChange={onInputChange}
                    placeholder="email@example.com"
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_website">Website</Label>
                  <Input
                    type="text"
                    id="indicomp_website"
                    name="indicomp_website"
                    value={donor.indicomp_website}
                    onChange={onInputChange}
                    placeholder="Website URL"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Residence Address Tab */}
        <TabsContent value="residence" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Residence Address</CardTitle>
              <CardDescription>Primary residential address details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* House & Street */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_res_reg_address">House & Street Number</Label>
                  <Textarea
                    id="indicomp_res_reg_address"
                    name="indicomp_res_reg_address"
                    value={donor.indicomp_res_reg_address}
                    onChange={onInputChange}
                    placeholder="House number and street"
                    rows={2}
                  />
                </div>

                {/* Area */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_res_reg_area">Area</Label>
                  <Input
                    id="indicomp_res_reg_area"
                    name="indicomp_res_reg_area"
                    value={donor.indicomp_res_reg_area}
                    onChange={onInputChange}
                    placeholder="Area/locality"
                  />
                </div>

                {/* Landmark */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_res_reg_ladmark">Landmark</Label>
                  <Input
                    id="indicomp_res_reg_ladmark"
                    name="indicomp_res_reg_ladmark"
                    value={donor.indicomp_res_reg_ladmark}
                    onChange={onInputChange}
                    placeholder="Nearby landmark"
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_res_reg_city">City <span className="text-red-500">*</span></Label>
                  <Input
                    id="indicomp_res_reg_city"
                    name="indicomp_res_reg_city"
                    value={donor.indicomp_res_reg_city}
                    onChange={onInputChange}
                    placeholder="City name"
                  />
                  {errors.indicomp_res_reg_city && <p className="text-red-500 text-xs">{errors.indicomp_res_reg_city}</p>}
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_res_reg_state">State <span className="text-red-500">*</span></Label>
                  <Select value={donor.indicomp_res_reg_state} onValueChange={(value) => onSelectChange("indicomp_res_reg_state", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {statesHook?.states.map(state => (
                        <SelectItem key={state.id} value={state.state_name}>{state.state_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.indicomp_res_reg_state && <p className="text-red-500 text-xs">{errors.indicomp_res_reg_state}</p>}
                </div>

                {/* Pincode */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_res_reg_pin_code">Pincode <span className="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    id="indicomp_res_reg_pin_code"
                    name="indicomp_res_reg_pin_code"
                    value={donor.indicomp_res_reg_pin_code}
                    onChange={onInputChange}
                    maxLength={6}
                    placeholder="6-digit pincode"
                  />
                  {errors.indicomp_res_reg_pin_code && <p className="text-red-500 text-xs">{errors.indicomp_res_reg_pin_code}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Office Address Tab */}
        <TabsContent value="office" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Office Address</CardTitle>
              <CardDescription>Office or business address details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Office & Street */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_off_branch_address">Office & Street Number</Label>
                  <Textarea
                    id="indicomp_off_branch_address"
                    name="indicomp_off_branch_address"
                    value={donor.indicomp_off_branch_address}
                    onChange={onInputChange}
                    placeholder="Office address"
                    rows={2}
                  />
                </div>

                {/* Area */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_off_branch_area">Area</Label>
                  <Input
                    id="indicomp_off_branch_area"
                    name="indicomp_off_branch_area"
                    value={donor.indicomp_off_branch_area}
                    onChange={onInputChange}
                    placeholder="Office area"
                  />
                </div>

                {/* Landmark */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_off_branch_ladmark">Landmark</Label>
                  <Input
                    id="indicomp_off_branch_ladmark"
                    name="indicomp_off_branch_ladmark"
                    value={donor.indicomp_off_branch_ladmark}
                    onChange={onInputChange}
                    placeholder="Nearby landmark"
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_off_branch_city">City</Label>
                  <Input
                    id="indicomp_off_branch_city"
                    name="indicomp_off_branch_city"
                    value={donor.indicomp_off_branch_city}
                    onChange={onInputChange}
                    placeholder="City name"
                  />
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_off_branch_state">State</Label>
                  <Select value={donor.indicomp_off_branch_state} onValueChange={(value) => onSelectChange("indicomp_off_branch_state", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {statesHook?.states.map(state => (
                        <SelectItem key={state.id} value={state.state_name}>{state.state_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pincode */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_off_branch_pin_code">Pincode</Label>
                  <Input
                    type="text"
                    id="indicomp_off_branch_pin_code"
                    name="indicomp_off_branch_pin_code"
                    value={donor.indicomp_off_branch_pin_code}
                    onChange={onInputChange}
                    maxLength={6}
                    placeholder="6-digit pincode"
                  />
                </div>

                {/* Correspondence Preference */}
                <div className="space-y-2">
                  <Label htmlFor="indicomp_corr_preffer">Correspondence Preference <span className="text-red-500">*</span></Label>
                  <Select value={donor.indicomp_corr_preffer} onValueChange={(value) => onSelectChange("indicomp_corr_preffer", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Preference" />
                    </SelectTrigger>
                    <SelectContent>
                      {corrpreffer.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.indicomp_corr_preffer && <p className="text-red-500 text-xs">{errors.indicomp_corr_preffer}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      {/* <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => setShowModal(true)}
                disabled={donor.indicomp_related_id !== donor.indicomp_fts_id}
                variant={donor.indicomp_related_id === donor.indicomp_fts_id ? "default" : "outline"}
                className={
                  donor.indicomp_related_id === donor.indicomp_fts_id 
                    ? "bg-green-600 hover:bg-green-700" 
                    : ""
                }
              >
                Attach to Group
              </Button>

              <Button
                type="button"
                onClick={() => familyGroupStatus("leave_family_group")}
                disabled={donor.indicomp_related_id === donor.indicomp_fts_id}
                variant={donor.indicomp_related_id !== donor.indicomp_fts_id ? "default" : "outline"}
                className={
                  donor.indicomp_related_id !== donor.indicomp_fts_id 
                    ? "bg-orange-600 hover:bg-orange-700" 
                    : ""
                }
              >
                Leave Group
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/donor/donors')}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={updateMutation.isLoading}
              >
                {updateMutation.isLoading ? 'Updating...' : 'Update Donor'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <AddToGroup 
              id={donor.id} 
              closegroupModal={() => setShowModal(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorEditIndv;