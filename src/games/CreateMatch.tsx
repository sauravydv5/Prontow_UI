import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, ImageIcon, ChevronsUpDown, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCountries, Country } from "@/adminApi/countriesApi";
import { addMatch } from "@/adminApi/opinioApi";
import { cn } from "@/lib/utils";

function CreateMatch() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    teamA: "",
    teamB: "",
    isLive: false,
    startTime: "",
  });

  const { data: countries = [], isLoading: isLoadingCountries } = useQuery<Country[]>({
    queryKey: ["countries"],
    queryFn: getCountries,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isLive: checked }));
  };

  const handleTeamSelect = (teamSide: "A" | "B", countryCode: string) => {
    const teamKey = teamSide === "A" ? "teamA" : "teamB";
    setFormData((prev) => ({ ...prev, [teamKey]: countryCode }));
  };

  const teamAFlag = useMemo(() => {
    if (!formData.teamA || !countries.length) return null;
    return countries.find((c) => c.cca2 === formData.teamA)?.flags.svg || null;
  }, [formData.teamA, countries]);

  const teamBFlag = useMemo(() => {
    if (!formData.teamB || !countries.length) return null;
    return countries.find((c) => c.cca2 === formData.teamB)?.flags.svg || null;
  }, [formData.teamB, countries]);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  if (!formData.name || !formData.teamA || !formData.teamB || !formData.startTime) {
    toast.error("Please fill in all required fields");
    setLoading(false);
    return;
  }

  try {
    const teamAData = countries.find(c => c.cca2 === formData.teamA);
    const teamBData = countries.find(c => c.cca2 === formData.teamB);

    if (!teamAData || !teamBData) {
      toast.error("Team data not loaded yet");
      setLoading(false);
      return;
    }

    // ✅ FINAL GMT FIX (USE THIS ONLY)
   const dateTimeGMT = new Date(
  new Date(formData.startTime).getTime() -
  new Date(formData.startTime).getTimezoneOffset() * 60000
)
  .toISOString()
  .replace(".000Z", "Z");


    const payload = [
      {
        apiMatchId: `MANUAL_${Date.now()}`,
        name: formData.name,
        matchType: "t20",
        series: "Manual Series",
        dateTimeGMT,
        teamAName: teamAData.name.common,
        teamBName: teamBData.name.common,
        teamAImg: teamAData.flags.svg,
        teamBImg: teamBData.flags.svg,
      },
    ];

    console.log("MATCH PAYLOAD 👉", payload);

    await addMatch(payload);

    toast.success("Match created successfully!");
    navigate("/games/opinio");
  } catch (error: any) {
    console.error("ADD MATCH ERROR ❌", error.response?.data || error);
    toast.error(
      error.response?.data?.message ||
      error.message ||
      "Failed to create match"
    );
  } finally {
    setLoading(false);
  }
};




  return (
    <AdminLayout title="Games > Opinio > Create Match">
      <div className="p-6">
        <Button
          onClick={() => navigate(-1)}
          className="mb-6 bg-[#119D82] hover:bg-[#0d7d68] text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-xl font-semibold text-gray-800">Match Details</h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter the details for the new match.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Match Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. India vs Australia"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">
                  Start Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                  value={formData.startTime}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamA" className="text-sm font-medium text-gray-700">
                  Team A <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <div className={cn("w-16 rounded-md flex items-center justify-center overflow-hidden border", teamAFlag ? "h-auto" : "h-12 bg-gray-100")}>
                    {teamAFlag ? (
                      <img src={teamAFlag} alt="Team A Flag" className="w-full h-auto object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <CountryCombobox
                    value={formData.teamA}
                    onSelect={(value) => handleTeamSelect("A", value)}
                    countries={countries}
                    isLoading={isLoadingCountries}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamB" className="text-sm font-medium text-gray-700">
                  Team B <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <div className={cn("w-16 rounded-md flex items-center justify-center overflow-hidden border", teamBFlag ? "h-auto" : "h-12 bg-gray-100")}>
                    {teamBFlag ? (
                      <img src={teamBFlag} alt="Team B Flag" className="w-full h-auto object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <CountryCombobox
                    value={formData.teamB}
                    onSelect={(value) => handleTeamSelect("B", value)}
                    countries={countries}
                    isLoading={isLoadingCountries}
                  />
                </div>
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="isLive" className="text-sm font-medium text-gray-700 block mb-3">
                  Match Status
                </Label>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50 h-11">
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium text-gray-900">{formData.isLive ? "Live" : "Not Live"}</span>
                  </div>
                  <Switch
                    id="isLive"
                    checked={formData.isLive}
                    onCheckedChange={handleToggle}
                    className="data-[state=checked]:bg-[#119D82]"
                  />
                </div>
              </div> */}
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="h-11 px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="h-11 px-6 bg-[#119D82] hover:bg-[#0d7d68] text-white min-w-[140px]"
              >
                {loading ? "Creating..." : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Match
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

const CountryCombobox = ({
  value,
  onSelect,
  countries,
  isLoading,
}: {
  value: string;
  onSelect: (value: string) => void;
  countries: Country[];
  isLoading: boolean;
}) => {
  const [open, setOpen] = useState(false);

  const selectedCountry = countries.find(
    (country) => country.cca2.toLowerCase() === (value || "").toLowerCase()
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-11"
          disabled={isLoading}
        >
          {isLoading
            ? "Loading countries..."
            : selectedCountry
            ? selectedCountry.name.common
            : "Select country..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command
          filter={(value, search) => {
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.cca2}
                  value={country.name.common}
                  onSelect={() => {
                    onSelect(country.cca2);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === country.cca2 ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <img src={country.flags.svg} alt={country.flags.alt || country.name.common} className="w-5 h-auto mr-2" />
                  {country.name.common}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CreateMatch;