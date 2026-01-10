import { AdminLayout } from "@/components/AdminLayout";
import { Trash2, PlusCircle } from "lucide-react";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; 
import { addSpinWheel } from "@/adminApi/spinWheelApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SectionPayload {
  title: string;
  type: "token" | "cash";
  value: number;
  color: string;
  probability: number;
}

function CreateNewWheel() {
  const navigate = useNavigate();

  const [wheelName, setWheelName] = useState("");
  const [sections, setSections] = useState<SectionPayload[]>([
    { title: "", type: "token", value: 0, color: "#FF5733", probability: 0 },
  ]);
  const [isActive, setIsActive] = useState(true); // State for the new status toggle

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Wheel Name Change
  const handleWheelNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWheelName(e.target.value);
    if (errors.wheelName) {
      setErrors((prev) => ({ ...prev, wheelName: "" }));
    }
  };

  // Section Change
  const handleSectionChange = (
    index: number,
    field: keyof SectionPayload,
    value: string | number
  ) => {
    const updatedSections = sections.map((section, i) => {
      if (i === index) {
        return { ...section, [field]: value };
      }
      return section;
    });
    setSections(updatedSections);

    if (errors[`section-${index}-${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`section-${index}-${field}`]: "",
      }));
    }
  };

  // Add Section
  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { title: "", type: "token", value: 0, color: "#808080", probability: 0 },
    ]);
  };

  // Remove Section
  const removeSection = (index: number) => {
    const updated = sections.filter((_, i) => i !== index);
    setSections(updated);

    const newErrors = { ...errors };
    Object.keys(newErrors).forEach((key) => {
      if (key.startsWith(`section-${index}`)) delete newErrors[key];
    });

    setErrors(newErrors);
  };

  // Validate Form
  const validateForm = () => {
    const newErrors: any = {};

    if (!wheelName.trim()) newErrors.wheelName = "Wheel Name is required.";

    sections.forEach((s, index) => {
      if (!s.title.trim())
        newErrors[`section-${index}-title`] = "Title is required.";

      if (!s.type)
        newErrors[`section-${index}-type`] = "Type is required.";

      if (s.value === null || isNaN(Number(s.value)))
        newErrors[`section-${index}-value`] =
          "Value must be a valid number.";

      if (!s.color)
        newErrors[`section-${index}-color`] = "Color is required.";

      if (s.probability === null || isNaN(Number(s.probability)))
        newErrors[`section-${index}-probability`] =
          "Probability must be a valid number.";
      else if (Number(s.probability) < 0 || Number(s.probability) > 100)
        newErrors[`section-${index}-probability`] =
          "Probability must be between 0 and 100.";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    const totalProbability = sections.reduce(
      (sum, s) => sum + Number(s.probability),
      0
    );

    if (totalProbability !== 100) {
      toast.error(
        `Total probability must be 100%. Current total: ${totalProbability}%`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: wheelName,
        sections: sections.map((s) => ({
          ...s,
          value: Number(s.value),
          probability: Number(s.probability),
        })),
        isActive: isActive, // Add isActive to the payload
      };

      const response = await addSpinWheel(payload);

      if (response.data?.status) {
        toast.success("Spin Wheel created successfully!");
        navigate("/games/spin-the-wheel");
      } else {
        toast.error(response.data?.message || "Failed to create spin wheel.");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Games > Spin the wheel > Create New Wheel">
      <div className="p-4 md:p-6 lg:p-10">
        <div className="max-w-5xl mx-auto w-full space-y-6">

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-xl shadow-lg border rounded-xl p-6 space-y-6">

            {/* Heading */}
            <h2 className="text-2xl font-bold text-[#0C4128] tracking-wide">
              Create New Spin Wheel
            </h2>

            {/* Wheel Name */}
            <div className="space-y-2">
              <Label className="font-medium text-gray-700">Wheel Name</Label>
              <Input
                placeholder="Enter wheel name"
                value={wheelName}
                onChange={handleWheelNameChange}
                className="h-11 border-gray-300"
              />
              {errors.wheelName && (
                <p className="text-red-500 text-xs">{errors.wheelName}</p>
              )}
            </div>
            
            {/* Is Active Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="is-active" className="text-base font-medium">Wheel Status</Label>
                <p className="text-sm text-muted-foreground">Set the wheel to active or inactive on creation.</p>
              </div>
              <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
            </div>

            {/* Total Segments */}
            <div className="flex items-center justify-between bg-[#F8F7F3] p-4 rounded-lg border">
              <p className="text-[#0C4128] font-medium text-base">
                Total Segments: <span className="font-bold">{sections.length}</span>
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={addSection}
                className="border-[#0C4128] text-[#0C4128] hover:bg-[#0C4128] hover:text-white transition-all duration-200"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Segment
              </Button>
            </div>

            {/* Segment Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className="relative bg-white shadow-md border rounded-xl p-5 space-y-4 hover:shadow-lg transition-all"
                >
                  {sections.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSection(index)}
                      className="absolute top-3 right-3 text-red-500 hover:bg-red-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}

                  <h4 className="font-semibold text-lg text-gray-800">
                    Segment {index + 1}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Title */}
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={section.title}
                        onChange={(e) =>
                          handleSectionChange(index, "title", e.target.value)
                        }
                        placeholder="e.g. 10 Tokens"
                        className="h-10"
                      />
                      {errors[`section-${index}-title`] && (
                        <p className="text-red-500 text-xs">
                          {errors[`section-${index}-title`]}
                        </p>
                      )}
                    </div>

                    {/* Type */}
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={section.type}
                        onValueChange={(val) =>
                          handleSectionChange(index, "type", val)
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="token">Token</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors[`section-${index}-type`] && (
                        <p className="text-red-500 text-xs">
                          {errors[`section-${index}-type`]}
                        </p>
                      )}
                    </div>

                    {/* Value */}
                    <div>
                      <Label>Value</Label>
                      <Input
                        type="number"
                        value={section.value}
                        onChange={(e) =>
                          handleSectionChange(index, "value", e.target.value)
                        }
                        placeholder="e.g. 10"
                        className="h-10"
                      />
                      {errors[`section-${index}-value`] && (
                        <p className="text-red-500 text-xs">
                          {errors[`section-${index}-value`]}
                        </p>
                      )}
                    </div>

                    {/* Color */}
                    <div>
                      <Label>Color</Label>
                      <Input
                        type="color"
                        value={section.color}
                        onChange={(e) =>
                          handleSectionChange(index, "color", e.target.value)
                        }
                        className="h-10 p-1"
                      />
                      {errors[`section-${index}-color`] && (
                        <p className="text-red-500 text-xs">
                          {errors[`section-${index}-color`]}
                        </p>
                      )}
                    </div>

                    {/* Probability */}
                    <div className="sm:col-span-2">
                      <Label>Probability (%)</Label>
                      <Input
                        type="number"
                        value={section.probability}
                        onChange={(e) =>
                          handleSectionChange(
                            index,
                            "probability",
                            e.target.value
                          )
                        }
                        placeholder="e.g. 40"
                        className="h-10"
                      />
                      {errors[`section-${index}-probability`] && (
                        <p className="text-red-500 text-xs">
                          {errors[`section-${index}-probability`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#119D82] hover:bg-[#0e866f] text-white rounded-full px-8 py-2 text-sm font-semibold tracking-wide shadow-md"
              >
                {isSubmitting ? "Creating..." : "Create Wheel"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default CreateNewWheel;
