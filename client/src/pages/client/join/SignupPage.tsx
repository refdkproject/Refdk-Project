import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../../services/authService";
import { toast } from "react-toastify";

export default function SignupPage({ role }: { role: "volunteer" | "charity_admin" }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "+966",
    birthDate: "",
    ...(role === "charity_admin" && {
      institutionName: "",
      institutionType: "orphanage",
    }),
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim() || !/^[a-zA-Z\s]+$/.test(formData.name)) {
      errors.name = "Name is required and should contain only letters and spaces.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address (e.g., abc@gmail.com).";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }

    const phoneRegex = /^\+966\d{9,12}$/;
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required.";
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      errors.phoneNumber = "Phone number must start with +966 and contain 9 to 12 digits.";
    }

    if (role === "charity_admin" && !formData.institutionName?.trim()) {
      errors.institutionName = "Institution name is required.";
    }

    if (!formData.birthDate) {
      errors.birthDate = "Birth date is required.";
    }

    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach((error) => toast.error(error));
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const payload = {
        role,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        ...(role === "volunteer" && { birthDate: formData.birthDate }),
        ...(role === "charity_admin" && {
          institutionName: formData.institutionName,
          institutionType: formData.institutionType,
        }),
      };

      const response = await authService.register(payload);

      if (response.data.success) {
        toast.success("Registration successful! Redirecting to login...");
        navigate("/login");
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-xl mx-auto pt-16 pb-24 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">JOIN OUR TEAM</h1>
          <h2 className="text-3xl font-bold text-primary mb-2 text-[#397260]">
            {role === "volunteer" ? "Volunteer" : "Charity Admin"}
          </h2>
          <h2 className="text-3xl font-semibold mb-2">Create new Account</h2>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {role === "charity_admin" && (
            <div>
              <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700 mb-1">
                ORGANIZATION NAME
              </label>
              <input
                type="text"
                id="institutionName"
                required
                className="w-full p-3 bg-primary/20 rounded-md"
                value={formData.institutionName}
                onChange={(e) =>
                  setFormData({ ...formData, institutionName: e.target.value })
                }
              />
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full p-3 bg-primary/20 rounded-md"
              value={formData.name}
              required
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              EMAIL
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-3 bg-primary/20 rounded-md"
              value={formData.email}
              required
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              PASSWORD
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-3 bg-primary/20 rounded-md"
              value={formData.password}
              required
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">
              BIRTH DATE
            </label>
            <input
              type="date"
              id="birthdate"
              className="w-full p-3 bg-primary/20 rounded-md"
              value={formData.birthDate}
              required
              onChange={(e) =>
                setFormData({ ...formData, birthDate: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              CONTACT NUMBER
            </label>
            <input
              type="tel"
              id="phoneNumber"
              className="w-full p-3 bg-primary/20 rounded-md"
              value={formData.phoneNumber}
              required
              onChange={(e) => {
                let value = e.target.value;
                if (!value.startsWith("+966")) {
                  value = "+966";
                }
                value = "+966" + value.replace(/\D/g, "").slice(3);
                setFormData({ ...formData, phoneNumber: value });
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-600 text-white rounded-md py-3 hover:bg-gray-700 transition-colors"
          >
            Sign up
          </button>

          <p className="text-gray-600">
            Already Registered?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Log in here
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
