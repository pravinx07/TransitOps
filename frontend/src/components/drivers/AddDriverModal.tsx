
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDriver } from '../../services/driversApi';
import toast from 'react-hot-toast';

const driverSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  licenseNumber: z.string().min(3, 'License number is required'),
  licenseCategory: z.string().min(1, 'Category is required'),
  licenseExpiry: z.string().min(10, 'Expiry date is required'),
  contactNumber: z.string().regex(/^\d{10}$/, 'Contact number must be exactly 10 digits'),
  safetyScore: z.number().min(0).max(100).optional(),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'ON_LEAVE', 'OFF_DUTY', 'SUSPENDED']),
});

type DriverFormData = z.infer<typeof driverSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddDriverModal({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: { safetyScore: 100, status: 'AVAILABLE' }
  });

  const mutation = useMutation({
    mutationFn: createDriver,
    onSuccess: () => {
      toast.success('Driver added successfully');
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      reset();
      onClose();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to add driver');
    }
  });

  const onSubmit = (data: DriverFormData) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-indigo-100 bg-indigo-50/30">
          <h2 className="text-xl font-bold text-[#4F46E5]">Add New Driver</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-[#4F46E5] transition-colors bg-white rounded-full p-1 shadow-sm border border-gray-100">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              {...register('name')} 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 focus:bg-white transition-all"
              placeholder="Alex Johnson"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License No.</label>
              <input 
                {...register('licenseNumber')} 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 focus:bg-white transition-all"
                placeholder="DL-88213"
              />
              {errors.licenseNumber && <p className="text-red-500 text-xs mt-1">{errors.licenseNumber.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                {...register('licenseCategory')} 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 focus:bg-white transition-all"
              >
                <option value="">Select...</option>
                <option value="LMV">LMV</option>
                <option value="HMV">HMV</option>
                <option value="HGMV">HGMV</option>
              </select>
              {errors.licenseCategory && <p className="text-red-500 text-xs mt-1">{errors.licenseCategory.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input 
                type="date"
                {...register('licenseExpiry')} 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 focus:bg-white transition-all"
              />
              {errors.licenseExpiry && <p className="text-red-500 text-xs mt-1">{errors.licenseExpiry.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact No.</label>
              <input 
                {...register('contactNumber')} 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 focus:bg-white transition-all"
                placeholder="98765xxxxx"
              />
              {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              {...register('status')} 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 focus:bg-white transition-all"
            >
              <option value="AVAILABLE">Available</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="OFF_DUTY">Off Duty</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-gray-600 hover:text-[#4F46E5] hover:bg-indigo-50 transition-colors font-medium border border-transparent hover:border-indigo-100"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={mutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-[#4F46E5] text-white font-semibold hover:bg-[#4338CA] transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 flex items-center justify-center disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {mutation.isPending ? 'Adding...' : 'Add Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
