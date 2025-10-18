import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import moment from 'moment';
import { 
  ArrowLeft, 
  FileText, 
  Mail,
  Shield,
  User
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import BASE_URL from '@/config/base-url';
import { useFetchDataSource, useFetchMembershipYear, useFetchSchoolAllotmentYear } from '@/hooks/use-api';

const exemptionOptions = [
  { value: '80G', label: '80G' },
  { value: 'Non 80G', label: 'Non 80G' },
  { value: 'FCRA', label: 'FCRA' },
];

const paymentModeOptions = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Transfer', label: 'Transfer' },
  { value: 'Others', label: 'Others' },
];

const donationTypeOptions = [
  { value: 'One Teacher School', label: 'OTS' },
  { value: 'General', label: 'General' },
  { value: 'Membership', label: 'Membership' },
];

const donationType80GOptions = [
  { value: 'One Teacher School', label: 'OTS' },
  { value: 'General', label: 'General' },
];

const ReceiptEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = Cookies.get('token');

  const today = moment();
  const todayDate = today.format('YYYY-MM-DD');
  const currentYear = Cookies.get('currentYear');
  
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const [receipt, setReceipt] = useState({
    receipt_date: '',
    receipt_exemption_type: '',
    receipt_financial_year: currentYear,
    schoolalot_year: '',
    receipt_total_amount: '',
    receipt_realization_date: '',
    receipt_donation_type: '',
    receipt_tran_pay_mode: '',
    receipt_tran_pay_details: '',
    receipt_remarks: '',
    receipt_reason: '',
    receipt_email_count: '',
    m_ship_vailidity: '',
    receipt_no_of_ots: '',
    donor_promoter: '',
    donor_source: '',
    receipt_csr: 'No',
    receipt_ref_no: '',
    individual_company: {
      indicomp_full_name: '',
      indicomp_pan_no: '',
      indicomp_fts_id: '',
      indicomp_email: ''
    }
  });

  // Fetch receipt data
  const { data: receiptData, isLoading: isLoadingReceipt } = useQuery({
    queryKey: ['receipt-data', id],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/receipt/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    },
    retry: 2,
  });

  // Fetch additional data
  const { data: datasourceHook, isLoading: isLoadingDatasource } = useFetchDataSource();
  const { data: membershipYearHook, isLoading: isLoadingMembershipYear } = useFetchMembershipYear();
  const { data: schoolAllotYearHook, isLoading: isLoadingSchoolAllotYear } = useFetchSchoolAllotmentYear();
  
  const isLoadingHook = isLoadingDatasource || isLoadingMembershipYear || isLoadingSchoolAllotYear;

  const dataSources = datasourceHook?.data || [];
  const membershipYears = membershipYearHook?.data || [];
  const schoolAllotYears = schoolAllotYearHook?.data || [];

  // Update receipt state when data is loaded
  useEffect(() => {
    if (receiptData) {
      setReceipt({
        receipt_date: receiptData.receipt_date || '',
        receipt_exemption_type: receiptData.receipt_exemption_type || '',
        receipt_financial_year: receiptData.receipt_financial_year || currentYear,
        schoolalot_year: receiptData.schoolalot_year || '',
        receipt_total_amount: receiptData.receipt_total_amount || '',
        receipt_realization_date: receiptData.receipt_realization_date || '',
        receipt_donation_type: receiptData.receipt_donation_type || '',
        receipt_tran_pay_mode: receiptData.receipt_tran_pay_mode || '',
        receipt_tran_pay_details: receiptData.receipt_tran_pay_details || '',
        receipt_remarks: receiptData.receipt_remarks || '',
        receipt_reason: receiptData.receipt_reason || '',
        receipt_email_count: receiptData.receipt_email_count || '',
        m_ship_vailidity: receiptData.m_ship_vailidity || '',
        receipt_no_of_ots: receiptData.receipt_no_of_ots || '',
        donor_promoter: receiptData.donor_promoter || '',
        donor_source: receiptData.donor_source || '',
        receipt_csr: receiptData.receipt_csr || 'No',
        receipt_ref_no: receiptData.receipt_ref_no || '',
        individual_company: {
          indicomp_full_name: receiptData.indicomp_full_name || '',
          indicomp_pan_no: receiptData.indicomp_pan_no || '',
          indicomp_fts_id: receiptData.indicomp_fts_id || '',
          indicomp_email: receiptData.indicomp_email || ''
        }
      });
    }
  }, [receiptData, currentYear]);

  const handleButtonGroupChange = (stateName, value) => {
    setReceipt((prevReceipt) => {
      const updatedReceipt = {
        ...prevReceipt,
        [stateName]: value,
      };

      if (stateName === 'receipt_donation_type') {
        if (value === 'Membership') {
          updatedReceipt.receipt_total_amount = '1000';
        } else {
          updatedReceipt.receipt_total_amount = prevReceipt.receipt_total_amount;
        }
      }

      return updatedReceipt;
    });
  };

  const validateOnlyDigits = (inputtxt) => /^\d*$/.test(inputtxt);

  const onInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'receipt_total_amount' && receipt.receipt_donation_type === 'Membership') {
      return;
    }

    const digitFields = ['receipt_total_amount', 'receipt_no_of_ots'];

    if (digitFields.includes(name)) {
      if (validateOnlyDigits(value)) {
        setReceipt((prevReceipt) => ({
          ...prevReceipt,
          [name]: value,
        }));
      }
    } else {
      setReceipt((prevReceipt) => ({
        ...prevReceipt,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!receipt.receipt_exemption_type) {
      newErrors.receipt_exemption_type = 'Please Select a category';
      isValid = false;
    }

    if (!receipt.receipt_donation_type) {
      newErrors.receipt_donation_type = 'Purpose is required';
      isValid = false;
    }

    if (!receipt.receipt_total_amount) {
      newErrors.receipt_total_amount = 'Total amount is required';
      isValid = false;
    }

    if (!receipt.receipt_tran_pay_mode) {
      newErrors.receipt_tran_pay_mode = 'Transaction type is required';
      isValid = false;
    }

    if (receipt.receipt_donation_type === 'Membership' && !receipt.m_ship_vailidity) {
      newErrors.m_ship_vailidity = 'Membership End Date is required';
      isValid = false;
    }

    if (receipt.receipt_donation_type === 'One Teacher School') {
      if (!receipt.receipt_no_of_ots) {
        newErrors.receipt_no_of_ots = 'No of school is required';
        isValid = false;
      }
      if (!receipt.schoolalot_year) {
        newErrors.schoolalot_year = 'School Allotment Year is required';
        isValid = false;
      }
    }

    if (!receipt.receipt_reason) {
      newErrors.receipt_reason = 'Reason is required';
      isValid = false;
    }

    if (receipt.receipt_csr === undefined || receipt.receipt_csr === null) {
      newErrors.receipt_csr = 'CSR is required';
      isValid = false;
    }

    setErrors(newErrors);
    return { isValid, errors: newErrors };
  };

  const updateReceiptMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.put(`${BASE_URL}/api/receipt/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.code === 200) {
        toast.success(data.message || 'Receipt updated successfully');
        navigate(`/receipt-view?ref=${encodeURIComponent(id)}`);
        setIsButtonDisabled(false);
      } else {
        toast.error(data.message || 'Unexpected Error');
        setIsButtonDisabled(false);
      }
    },
    onError: (error) => {
      console.error('Error updating receipt:', error);
      toast.error(error.response?.data?.message || 'Error updating receipt');
      setIsButtonDisabled(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validateForm();
    if (!isValid) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      setIsButtonDisabled(false);
      return;
    }

    const formData = new FormData();
    

    if (receipt.receipt_exemption_type) formData.append('receipt_exemption_type', receipt.receipt_exemption_type);
    if (receipt.schoolalot_year) formData.append('schoolalot_year', receipt.schoolalot_year);
    if (receipt.receipt_total_amount) formData.append('receipt_total_amount', receipt.receipt_total_amount);
    if (receipt.receipt_realization_date) formData.append('receipt_realization_date', receipt.receipt_realization_date);
    if (receipt.receipt_donation_type) formData.append('receipt_donation_type', receipt.receipt_donation_type);
    if (receipt.m_ship_vailidity) formData.append('m_ship_vailidity', receipt.m_ship_vailidity);
    if (receipt.receipt_csr) formData.append('receipt_csr', receipt.receipt_csr);
    if (receipt.receipt_tran_pay_mode) formData.append('receipt_tran_pay_mode', receipt.receipt_tran_pay_mode);
    if (receipt.receipt_tran_pay_details) formData.append('receipt_tran_pay_details', receipt.receipt_tran_pay_details);
    if (receipt.receipt_remarks) formData.append('receipt_remarks', receipt.receipt_remarks);
    if (receipt.receipt_reason) formData.append('receipt_reason', receipt.receipt_reason);
    if (receipt.donor_promoter) formData.append('donor_promoter', receipt.donor_promoter);
    if (receipt.donor_source) formData.append('donor_source', receipt.donor_source);
    
 
    const pan = receipt.individual_company?.indicomp_pan_no;
    const withOutPanno = (!pan || pan === 'NA' || pan === '') ? 'Yes' : 'No';
    formData.append('with_out_panno', withOutPanno);

    setIsButtonDisabled(true);
    updateReceiptMutation.mutate(formData);
  };

  const pan = receipt.individual_company?.indicomp_pan_no || 'NA';

  if (isLoadingReceipt && isLoadingHook) {
    return (
      <div className="w-full space-y-4 p-4">
        <Card className="p-4">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-32" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2 p-4">
      <Card className="p-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <FileText className="text-muted-foreground w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Edit Receipt</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Edit receipt for <span className='text-muted-foreground font-semibold'>{receipt.individual_company?.indicomp_full_name}</span> ( {receipt.individual_company?.indicomp_fts_id})
                  </p>
                  <p className="text-sm text-gray-500">
                    Receipt Ref: <span className='text-muted-foreground font-semibold'>{receipt.receipt_ref_no}</span>
                  </p>
                </div>
              </div>
              
              {/* Donor Info Compact */}
            {/* Donor Info - Single Row Compact */}
<div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
  {receipt.individual_company?.indicomp_email && (
    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
      <Mail className="w-4 h-4 text-gray-500" />
      <span className="truncate">{receipt.individual_company.indicomp_email}</span>
    </div>
  )}

  {pan && (
    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
      <Shield className={`w-4 h-4 ${pan ? 'text-gray-500' : 'text-red-600'}`} />
      <span>PAN: {pan}</span>
    </div>
  )}

  <div className="bg-gray-50 px-2 py-1 rounded-md">
    Date: {moment(receipt.receipt_date).format('DD-MM-YYYY')}
  </div>

  <div className="bg-gray-50 px-2 py-1 rounded-md">
    Year: {receipt.receipt_financial_year}
  </div>

  <div className="bg-gray-50 px-2 py-1 rounded-md">
    Exemption: {receipt.receipt_exemption_type}
  </div>

  {receipt.receipt_total_amount > 2000 &&
    receipt.receipt_exemption_type === '80G' &&
    pan === 'NA' && (
      <div className="flex items-center bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-md px-3 py-2">
        Maximum amount allowed without PAN card is ₹2000
      </div>
    )}
</div>

            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/receipt')}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 flex-shrink-0 mt-2 sm:mt-0"
          >
            <ArrowLeft className="w-3 h-3" />
            Back
          </Button>
        </div>

       

        {/* Amount Warning */}
      
      </Card>

      <Card>
        <CardContent className="p-2 pt-4">
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* CSR Checkbox - Compact */}
            <div className="flex items-center justify-end space-x-2 mb-3">
              <Checkbox
                id="receipt_csr"
                checked={receipt.receipt_csr === 'Yes'}
                onCheckedChange={(checked) => 
                  setReceipt(prev => ({ ...prev, receipt_csr: checked ? 'Yes' : 'No' }))
                }
                className="h-4 w-4"
              />
              <Label htmlFor="receipt_csr" className="text-sm font-medium">
                This is a CSR donation
              </Label>
              {errors.receipt_csr && (
                <p className="text-red-500 text-xs">{errors.receipt_csr}</p>
              )}
            </div>

            {/* Compact Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Exemption Type - Compact */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Category *</Label>
                <div className="flex flex-wrap gap-1">
                  {exemptionOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={receipt.receipt_exemption_type === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleButtonGroupChange('receipt_exemption_type', option.value)}
                      className="text-xs h-7 px-2"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                {errors.receipt_exemption_type && (
                  <p className="text-red-500 text-xs">{errors.receipt_exemption_type}</p>
                )}
              </div>

              {/* Donation Type - Compact */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Purpose *</Label>
                <div className="flex flex-wrap gap-1">
                  {(receipt.receipt_exemption_type === '80G' ? donationType80GOptions : donationTypeOptions).map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={receipt.receipt_donation_type === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleButtonGroupChange('receipt_donation_type', option.value)}
                      className="text-xs h-7 px-2"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                {errors.receipt_donation_type && (
                  <p className="text-red-500 text-xs">{errors.receipt_donation_type}</p>
                )}
              </div>

              {/* Total Amount */}
              <div className="space-y-1.5">
                <Label htmlFor="receipt_total_amount" className="text-xs font-medium">
                  Total Amount *
                </Label>
                <Input
                  id="receipt_total_amount"
                  name="receipt_total_amount"
                  type="text"
                  value={receipt.receipt_total_amount}
                  onChange={onInputChange}
                  disabled={receipt.receipt_donation_type === 'Membership'}
                  placeholder="Enter amount"
                  maxLength={8}
                  className="h-8 text-sm"
                />
                {errors.receipt_total_amount && (
                  <p className="text-red-500 text-xs">{errors.receipt_total_amount}</p>
                )}
              </div>

              {/* Payment Mode - Compact */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Transaction Type *</Label>
                <div className="flex flex-wrap gap-1">
                  {paymentModeOptions
                    .filter(option => 
                      !(receipt.receipt_exemption_type === '80G' && 
                        receipt.receipt_total_amount > 2000 && 
                        option.value === 'Cash')
                    )
                    .map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={receipt.receipt_tran_pay_mode === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleButtonGroupChange('receipt_tran_pay_mode', option.value)}
                        className="text-xs h-7 px-2"
                      >
                        {option.label}
                      </Button>
                    ))}
                </div>
                {errors.receipt_tran_pay_mode && (
                  <p className="text-red-500 text-xs">{errors.receipt_tran_pay_mode}</p>
                )}
              </div>

              {/* Realization Date */}
              <div className="space-y-1.5">
                <Label htmlFor="receipt_realization_date" className="text-xs font-medium">
                  Realization Date
                </Label>
                <Input
                  id="receipt_realization_date"
                  name="receipt_realization_date"
                  type="date"
                  value={receipt.receipt_realization_date}
                  onChange={onInputChange}
                  max={todayDate}
                  className="h-8 text-sm"
                />
              </div>

              {/* Conditional Fields - Compact */}
              {receipt.receipt_donation_type === 'Membership' && (
                <div className="space-y-1.5">
                  <Label htmlFor="m_ship_vailidity" className="text-xs font-medium">
                    Membership End Date *
                  </Label>
                  <Select
                    value={receipt.m_ship_vailidity}
                    onValueChange={(value) => setReceipt(prev => ({ ...prev, m_ship_vailidity: value }))}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select end date" />
                    </SelectTrigger>
                    <SelectContent>
                      {membershipYears.map((year) => (
                        <SelectItem key={year.membership_year} value={year.membership_year}>
                          {year.membership_year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.m_ship_vailidity && (
                    <p className="text-red-500 text-xs">{errors.m_ship_vailidity}</p>
                  )}
                </div>
              )}

              {receipt.receipt_donation_type === 'One Teacher School' && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="receipt_no_of_ots" className="text-xs font-medium">
                      Number of Schools *
                    </Label>
                    <Input
                      id="receipt_no_of_ots"
                      name="receipt_no_of_ots"
                      type="text"
                      value={receipt.receipt_no_of_ots}
                      onChange={onInputChange}
                      placeholder="Enter number"
                      maxLength={3}
                      className="h-8 text-sm"
                    />
                    {errors.receipt_no_of_ots && (
                      <p className="text-red-500 text-xs">{errors.receipt_no_of_ots}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="schoolalot_year" className="text-xs font-medium">
                      School Allotment Year *
                    </Label>
                    <Select
                      value={receipt.schoolalot_year}
                      onValueChange={(value) => setReceipt(prev => ({ ...prev, schoolalot_year: value }))}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {schoolAllotYears.map((year) => (
                          <SelectItem key={year.school_allot_year} value={year.school_allot_year}>
                            {year.school_allot_year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.schoolalot_year && (
                      <p className="text-red-500 text-xs">{errors.schoolalot_year}</p>
                    )}
                  </div>
                </>
              )}

              {receipt.receipt_donation_type === 'General' && (
                <div className="space-y-1.5">
                  <Label htmlFor="donor_source" className="text-xs font-medium">
                    Source
                  </Label>
                  <Select
                    value={receipt.donor_source}
                    onValueChange={(value) => setReceipt(prev => ({ ...prev, donor_source: value }))}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSources.map((source) => (
                        <SelectItem key={source.id} value={source.data_source_type}>
                          {source.data_source_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Text Areas - Compact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-2">
              {/* Payment Details */}
              <div className="space-y-1.5">
                <Label htmlFor="receipt_tran_pay_details" className="text-xs font-medium">
                  Transaction Details
                </Label>
                <Textarea
                  id="receipt_tran_pay_details"
                  name="receipt_tran_pay_details"
                  value={receipt.receipt_tran_pay_details}
                  onChange={onInputChange}
                  placeholder="Cheque No / Bank Name / UTR / Any Other Details"
                  className="resize-none h-14 text-sm"
                />
              </div>

              {/* Remarks */}
              <div className="space-y-1.5">
                <Label htmlFor="receipt_remarks" className="text-xs font-medium">
                  Remarks
                </Label>
                <Textarea
                  id="receipt_remarks"
                  name="receipt_remarks"
                  value={receipt.receipt_remarks}
                  onChange={onInputChange}
                  placeholder="Additional remarks..."
                  className="resize-none h-14 text-sm"
                />
              </div>
            </div>

            {/* Reason Field - Required */}
            <div className="space-y-1.5">
              <Label htmlFor="receipt_reason" className="text-xs font-medium">
                Reason for Edit *
              </Label>
              <Textarea
                id="receipt_reason"
                name="receipt_reason"
                value={receipt.receipt_reason}
                onChange={onInputChange}
                placeholder="Please provide reason for editing this receipt..."
                className="resize-none h-14 text-sm"
                required
              />
              {errors.receipt_reason && (
                <p className="text-red-500 text-xs">{errors.receipt_reason}</p>
              )}
            </div>

            {/* Submit Buttons - Compact */}
            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <Button
                type="submit"
                disabled={isButtonDisabled || updateReceiptMutation.isPending}
                className="flex items-center gap-2 h-9"
                size="sm"
              >
                {updateReceiptMutation.isPending ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FileText className="w-3 h-3" />
                    Update Receipt
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/receipt')}
                size="sm"
                className="h-9"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptEdit;