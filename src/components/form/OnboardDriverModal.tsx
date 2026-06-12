import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { driverService } from "../../services/api";

interface OnboardDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OnboardDriverModal({ isOpen, onClose, onSuccess }: OnboardDriverModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");
  const [drivingLicense, setDrivingLicense] = useState<File | null>(null);
  const [driverId, setDriverId] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Auto-generate Driver ID and PIN when the modal opens
      const generatedId = "DRV-" + Math.floor(1000 + Math.random() * 9000);
      const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
      setDriverId(generatedId);
      setPin(generatedPin);
      
      // Reset other fields
      setName("");
      setPhone("");
      setUpiId("");
      setDrivingLicense(null);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !phone || !upiId || !drivingLicense) {
      setError("Please fill all required fields and upload the driving license.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("upiId", upiId);
      formData.append("driverId", driverId);
      formData.append("pin", pin);
      formData.append("drivingLicense", drivingLicense);


      // We use the pre-configured axios instance so it automatically attaches the correct Authorization header.
      const response = await driverService.onboardDriver(formData);

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(response.data?.message || "Failed to onboard driver");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6">
      <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
        Onboard New Driver
      </h2>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* Driver Information */}
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Driver Details
            </h3>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                UPI ID
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="name@upi"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Driving License (Image)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setDrivingLicense(e.target.files[0]);
                  }
                }}
                className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:text-slate-400 dark:file:bg-blue-900/30 dark:file:text-blue-400"
              />
            </div>
          </div>

          {/* System Generated Fields */}
          <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              System Generated (Auto)
            </h3>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Generated Driver ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full rounded-lg border border-blue-200 bg-white/50 px-3 py-2 text-sm font-bold text-slate-900 outline-none cursor-not-allowed dark:border-slate-700 dark:bg-slate-800/50 dark:text-white"
                  value={driverId}
                  disabled
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Unique identifier for this driver.</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Generated Login PIN
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full rounded-lg border border-blue-200 bg-white/50 px-3 py-2 text-2xl tracking-[0.5em] font-black text-blue-600 outline-none cursor-not-allowed dark:border-slate-700 dark:bg-slate-800/50 dark:text-blue-400"
                  value={pin}
                  disabled
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Provide this 4-digit PIN to the driver so they can log into the Rider app.</p>
            </div>
            
            <div className="mt-4 flex flex-col justify-center rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-200">
              <strong>Note:</strong> Give the driver their phone number and this PIN immediately. They will not be able to log in without it!
            </div>
          </div>

        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose} className="px-6">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit as any} disabled={isLoading} className="px-6">
            {isLoading ? "Onboarding..." : "Complete Onboarding"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
