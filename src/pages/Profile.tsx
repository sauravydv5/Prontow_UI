import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminLayout } from "@/components/AdminLayout";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    firstName: "John Doe",
    gender: "Male",
    dob: "2025-01-01",
    phone: "+91 9595857485",
    address: "",
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2F4E9] via-[#D9E8D5] to-[#A1D7C4] relative">
      <AdminLayout title="Profile">
        <main className="container px-4 py-10 flex flex-col items-center justify-center">
          <div className="max-w-md w-full bg-white/80 rounded-3xl shadow-xl p-8 space-y-6 mt-6">
            <div className="text-center space-y-3 relative">
              <h2 className="text-2xl font-bold text-[#0B8A74]">My Profile</h2>

              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-[#A1D7C4] flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-[#0B8A74]" />
                  )}
                </div>

                <button
                  onClick={handleEditClick}
                  className="absolute bottom-0 right-0 bg-[#0B8A74] hover:bg-[#087060] text-white p-2 rounded-full shadow-md"
                >
                  <Pencil size={16} />
                </button>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-semibold">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="h-12 bg-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-semibold">
                  Gender
                </Label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="w-full h-12 rounded-md border border-gray-300 bg-card px-3 text-gray-700 focus:ring-2 focus:ring-[#0B8A74] focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob" className="text-sm font-semibold">
                  Date of Birth
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    id="dob"
                    value={formData.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                    className="h-12 bg-card pr-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="h-12 bg-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold">
                  Address
                </Label>
                <Input
                  id="address"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="h-12 bg-card"
                />
              </div>

              <Button
                onClick={handleSave}
                variant="default"
                size="lg"
                className="w-full h-14 text-lg mt-6 bg-[#0B8A74] hover:bg-[#087060] text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </main>
      </AdminLayout>
    </div>
  );
};

export default Profile;
