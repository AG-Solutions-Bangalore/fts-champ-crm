import React from "react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, SquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { ADMIN_CHAPTER_CREATE } from "../../api";

const CreateUserAdmin = ({ chapterCodeForCreateUser, refetch }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [user, setUser] = useState({
    name: "",
    email: "",
    first_name: "",
    image: null,
    last_name: "",
    phone: "",
    password: "",
    confirm_password: "",
    user_type_id: "",
  });

  const queryClient = useQueryClient();

  const UserDrop = [
    {
      value: "1",
      label: "User",
    },
  ];

  const handleSubmit = async () => {
    // Basic validation
    if (!user.name.trim() || !user.email.trim() || !user.first_name.trim() || 
        !user.phone.trim() || !user.password || !user.confirm_password || !user.user_type_id) {
      toast.error("All fields are required");
      return;
    }

    if (user.password !== user.confirm_password) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    if (user.phone.length !== 10) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    setIsLoading(true);
    try {
      const token = Cookies.get("token");
      const chapterId = Cookies.get("chapter_id");
      
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("first_name", user.first_name);
      formData.append("last_name", user.last_name || "");
      formData.append("email", user.email);
      formData.append("phone", user.phone);
      formData.append("password", user.password);
      formData.append("user_type", user.user_type_id);
      formData.append("chapter_id", chapterId); 
      
      if (user.image instanceof File) {
        formData.append("image", user.image);
      }

      const response = await axios.post(
        ADMIN_CHAPTER_CREATE,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response?.data.code === 200) {
        toast.success(response.data.msg || "User created successfully");

        // Reset form
        setUser({
          name: "",
          email: "",
          first_name: "",
          image: null,
          last_name: "",
          phone: "",
          password: "",
          confirm_password: "",
          user_type_id: "",
        });
        setError("");
        
     
        refetch();
        setOpen(false);
      } else {
        toast.error(response.data.msg || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(
        error.response?.data?.msg || "Failed to create user"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      // Only allow digits and limit to 10 characters
      if (/^\d*$/.test(value) && value.length <= 10) {
        setUser((prev) => ({ ...prev, [name]: value }));
      }
    } else if (name === "confirm_password") {
      setUser((prev) => ({ ...prev, [name]: value }));
      if (value && value !== user.password) {
        setError("Passwords do not match");
      } else {
        setError("");
      }
    } else {
      setUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setUser((prev) => ({ 
      ...prev, 
      image: e.target.files[0] 
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="h-8 text-xs">
          <SquarePlus className="h-4 w-4 mr-2" /> Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Enter the details for the new user
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Username <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Enter username"
                value={user.name}
                onChange={handleInputChange}
                className="h-9"
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email"
                value={user.email}
                onChange={handleInputChange}
                className="h-9"
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="first_name" className="text-sm font-medium">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="first_name"
                name="first_name"
                placeholder="Enter full name"
                value={user.first_name}
                onChange={handleInputChange}
                className="h-9"
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                id="phone"
                name="phone"
                placeholder="Enter phone number"
                value={user.phone}
                onChange={handleInputChange}
                maxLength={10}
                className="h-9"
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="user_type_id" className="text-sm font-medium">
                User Type <span className="text-red-500">*</span>
              </label>
              <select
                id="user_type_id"
                name="user_type_id"
                value={user.user_type_id}
                onChange={handleInputChange}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select User Type</option>
                {UserDrop.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="image" className="text-sm font-medium">
                Upload Image
              </label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="h-9"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password <span className="text-red-500">*</span>
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={user.password}
                onChange={handleInputChange}
                className="h-9"
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="confirm_password" className="text-sm font-medium">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                placeholder="Confirm password"
                value={user.confirm_password}
                onChange={handleInputChange}
                className="h-9"
                required
              />
              {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="h-9"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserAdmin;