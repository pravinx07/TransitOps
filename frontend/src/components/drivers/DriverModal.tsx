import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDriver, updateDriver, type Driver } from '../../services/driversApi';
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
  driver?: Driver | null;
}

export default function DriverModal({ isOpen, onClose, driver }: Props) {
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: { safetyScore: 100, status: 'AVAILABLE' }
  });

  const isEditing = !!driver;

  useEffect(() => {
    if (driver) {
      reset({
        name: driver.name,
        licenseNumber: driver.licenseNumber,
        licenseCategory: driver.licenseCategory,
        licenseExpiry: driver.licenseExpiry.split('T')[0], // format date for input
        contactNumber: driver.contactNumber,
        safetyScore: driver.safetyScore,
        status: driver.status,
      });
    } else {
      reset({ safetyScore: 100, status: 'AVAILABLE' });
    }
  }, [driver, reset, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: DriverFormData) => {
      if (isEditing && driver) {
        return updateDriver(driver.id, data);
      }
      return createDriver(data);
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Driver updated successfully' : 'Driver added successfully');
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      reset();
      onClose();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} driver`);
    }
  });

  const onSubmit = (data: DriverFormData) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111422] border border-[#1E2336] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-[#1E2336] bg-[#0A0C16]">
          <h2 className="text-xl font-bold text-white tracking-wide">{isEditing ? 'Edit Driver' : 'Add New Driver'}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-[#1E2336] rounded-full p-1 border border-[#2A314A]">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 font-sans">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Full Name</label>
            <input 
              {...register('name')} 
              className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#5D87FF] transition-all placeholder-gray-600"
              placeholder="Alex Johnson"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">License No.</label>
              <input 
                {...register('licenseNumber')} 
                className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#5D87FF] transition-all placeholder-gray-600"
                placeholder="DL-88213"
              />
              {errors.licenseNumber && <p className="text-red-400 text-xs mt-1">{errors.licenseNumber.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Category</label>
              <select 
                {...register('licenseCategory')} 
                className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#5D87FF] transition-all"
              >
                <option value="">Select...</option>
                <option value="LMV">LMV</option>
                <option value="HMV">HMV</option>
                <option value="HGMV">HGMV</option>
              </select>
              {errors.licenseCategory && <p className="text-red-400 text-xs mt-1">{errors.licenseCategory.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Expiry Date</label>
              <input 
                type="date"
                {...register('licenseExpiry')} 
                className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#5D87FF] transition-all"
                style={{ colorScheme: 'dark' }}
              />
              {errors.licenseExpiry && <p className="text-red-400 text-xs mt-1">{errors.licenseExpiry.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Contact No.</label>
              <div className="relative flex items-center">
                <div className="absolute left-0 inset-y-0 flex items-center pl-4 pointer-events-none">
                  <span className="text-gray-400 font-semibold">+91</span>
                </div>
                <input 
                  type="text"
                  maxLength={10}
                  {...register('contactNumber', {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    }
                  })}
                  className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-lg pl-12 pr-4 py-2.5 text-white focus:outline-none focus:border-[#5D87FF] transition-all placeholder-gray-600"
                  placeholder="98765xxxxx"
                />
              </div>
              {errors.contactNumber && <p className="text-red-400 text-xs mt-1">{errors.contactNumber.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Status</label>
            <select 
              {...register('status')} 
              className="w-full bg-[#0A0C16] border border-[#1E2336] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#5D87FF] transition-all"
            >
              <option value="AVAILABLE">Available</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="OFF_DUTY">Off Duty</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            {errors.status && <p className="text-red-400 text-xs mt-1">{errors.status.message}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#1E2336] transition-colors font-medium border border-[#1E2336] hover:border-transparent"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={mutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-[#4F46E5] text-white font-semibold hover:bg-[#4338CA] transition-all flex items-center justify-center disabled:opacity-50 shadow-[0_0_15px_rgba(79,70,229,0.2)] hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
            >
              {mutation.isPending ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Driver' : 'Add Driver')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
