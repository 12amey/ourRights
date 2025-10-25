"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Award,
  Languages,
  ArrowRight,
  CheckCircle,
  Shield,
  AlertCircle,
  Loader2,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import { LoadingLogo } from "@/components/ui/loading-logo";

interface State {
  code: string;
  nameEn: string;
  nameHi: string;
}

interface District {
  code: string;
  nameEn: string;
  nameHi: string;
}

export default function Home() {
  const router = useRouter();
  const { language, toggleLanguage, t } = useLanguage();
  
  const [states, setStates] = useState<State[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [error, setError] = useState<string>("");

  // Suppress ResizeObserver error (harmless browser warning from animations)
  useEffect(() => {
    // Method 1: Event listener approach
    const resizeObserverErrHandler = (e: ErrorEvent) => {
      if (
        e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
        e.message === 'ResizeObserver loop limit exceeded'
      ) {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
      }
    };
    
    // Method 2: Direct window.onerror override
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (
        typeof message === 'string' &&
        (message.includes('ResizeObserver loop completed with undelivered notifications') ||
         message.includes('ResizeObserver loop limit exceeded'))
      ) {
        return true; // Prevent error from being logged
      }
      
      // Call original error handler for other errors
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };
    
    window.addEventListener('error', resizeObserverErrHandler);
    
    return () => {
      window.removeEventListener('error', resizeObserverErrHandler);
      window.onerror = originalOnError; // Restore original handler
    };
  }, []);

  // Fetch states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoadingStates(true);
        setError("");
        const response = await fetch("/api/states");
        
        if (!response.ok) {
          throw new Error("Failed to fetch states");
        }
        
        const data = await response.json();
        setStates(data.states || []);
      } catch (err) {
        const errorMsg = language === "en" 
          ? "Failed to load states. Please try again." 
          : "राज्य लोड करने में विफल। कृपया पुनः प्रयास करें।";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoadingStates(false);
      }
    };

    fetchStates();
  }, []);

  // Fetch districts when state is selected
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedState) {
        setDistricts([]);
        setSelectedDistrict("");
        return;
      }

      try {
        setLoadingDistricts(true);
        setError("");
        const response = await fetch(`/api/states/${selectedState}/districts`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch districts");
        }
        
        const data = await response.json();
        setDistricts(data.districts || []);
        setSelectedDistrict("");
        
        if (data.districts.length === 0) {
          const noDistrictsMsg = language === "en"
            ? "No districts available for this state"
            : "इस राज्य के लिए कोई जिला उपलब्ध नहीं है";
          toast.error(noDistrictsMsg);
        }
      } catch (err) {
        const errorMsg = language === "en"
          ? `Failed to load districts: ${err instanceof Error ? err.message : "Unknown error"}`
          : `जिले लोड करने में विफल: ${err instanceof Error ? err.message : "अज्ञात त्रुटि"}`;
        setError(errorMsg);
        toast.error(errorMsg);
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [selectedState, language]);

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      const errorMsg = language === "en"
        ? "Geolocation is not supported by your browser"
        : "आपके ब्राउज़र द्वारा भू-स्थान समर्थित नहीं है";
      toast.error(errorMsg);
      return;
    }

    setDetectingLocation(true);
    const loadingMsg = language === "en"
      ? "Detecting your location..."
      : "आपका स्थान खोज रहे हैं...";
    toast.loading(loadingMsg);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'MGNREGA-Dashboard'
              }
            }
          );

          if (!response.ok) {
            throw new Error("Failed to get location details");
          }

          const data = await response.json();
          const detectedState = data.address?.state;
          const detectedDistrict = data.address?.state_district || data.address?.county || data.address?.district;

          if (!detectedState) {
            throw new Error("Could not determine state from location");
          }

          toast.dismiss();

          const matchedState = states.find(
            (state) =>
              state.nameEn.toLowerCase().includes(detectedState.toLowerCase()) ||
              detectedState.toLowerCase().includes(state.nameEn.toLowerCase())
          );

          if (matchedState) {
            setSelectedState(matchedState.code);
            
            try {
              const districtResponse = await fetch(`/api/states/${matchedState.code}/districts`);
              if (districtResponse.ok) {
                const districtData = await districtResponse.json();
                const fetchedDistricts = districtData.districts || [];
                setDistricts(fetchedDistricts);
                
                if (detectedDistrict && fetchedDistricts.length > 0) {
                  const matchedDistrict = fetchedDistricts.find(
                    (district: District) =>
                      district.nameEn.toLowerCase().includes(detectedDistrict.toLowerCase()) ||
                      detectedDistrict.toLowerCase().includes(district.nameEn.toLowerCase())
                  );
                  
                  if (matchedDistrict) {
                    setSelectedDistrict(matchedDistrict.code);
                    const successMsg = language === "en"
                      ? `Location detected: ${matchedState.nameEn}, ${matchedDistrict.nameEn}`
                      : `स्थान का पता लगाया गया: ${matchedState.nameHi}, ${matchedDistrict.nameHi}`;
                    toast.success(successMsg);
                  } else {
                    const partialSuccessMsg = language === "en"
                      ? `State detected: ${matchedState.nameEn}. Please select district manually.`
                      : `राज्य का पता लगाया गया: ${matchedState.nameHi}। कृपया जिला मैन्युअल रूप से चुनें।`;
                    toast.success(partialSuccessMsg);
                  }
                } else {
                  const successMsg = language === "en"
                    ? `State detected: ${matchedState.nameEn}. Please select district.`
                    : `राज्य का पता लगाया गया: ${matchedState.nameHi}। कृपया जिला चुनें।`;
                  toast.success(successMsg);
                }
              }
            } catch (districtErr) {
              const successMsg = language === "en"
                ? `State detected: ${matchedState.nameEn}. Please select district manually.`
                : `राज्य का पता लगाया गया: ${matchedState.nameHi}। कृपया जिला मैन्युअल रूप से चुनें।`;
              toast.success(successMsg);
            }
          } else {
            const notFoundMsg = language === "en"
              ? `State "${detectedState}" not found in the list. Please select manually.`
              : `राज्य "${detectedState}" सूची में नहीं मिला। कृपया मैन्युअल रूप से चुनें।`;
            toast.error(notFoundMsg);
          }
        } catch (err) {
          toast.dismiss();
          const errorMsg = language === "en"
            ? "Failed to detect location. Please select manually."
            : "स्थान का पता लगाने में विफल। कृपया मैन्युअल रूप से चुनें।";
          toast.error(errorMsg);
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        toast.dismiss();
        setDetectingLocation(false);
        
        let errorMsg = language === "en"
          ? "Location access denied. Please select manually."
          : "स्थान तक पहुंच अस्वीकृत। कृपया मैन्युअल रूप से चुनें।";

        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = language === "en"
            ? "Location permission denied. Please enable location access in your browser settings."
            : "स्थान अनुमति अस्वीकृत। कृपया अपनी ब्राउज़र सेटिंग्स में स्थान तक पहुंच सक्षम करें।";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = language === "en"
            ? "Location information unavailable."
            : "स्थान जानकारी अनुपलब्ध।";
        }

        toast.error(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleViewDashboard = () => {
    if (selectedDistrict) {
      router.push(`/dashboard/${selectedDistrict}`);
    }
  };

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: language === "en" ? "Real-time Analytics" : "रियल-टाइम विश्लेषण",
      description: language === "en" 
        ? "Track performance metrics and trends in real-time"
        : "रियल-टाइम में प्रदर्शन मेट्रिक्स और रुझानों को ट्रैक करें",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: language === "en" ? "Worker Participation" : "कामगार भागीदारी",
      description: language === "en"
        ? "Monitor active workers and participation rates"
        : "सक्रिय कामगारों और भागीदारी दर की निगरानी करें",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: language === "en" ? "Fund Utilization" : "निधि उपयोग",
      description: language === "en"
        ? "Analyze fund allocation and utilization patterns"
        : "निधि आवंटन और उपयोग पैटर्न का विश्लेषण करें",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: language === "en" ? "Performance Reports" : "प्रदर्शन रिपोर्ट",
      description: language === "en"
        ? "Generate comprehensive PDF and CSV reports"
        : "व्यापक पीडीएफ और सीएसवी रिपोर्ट उत्पन्न करें",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Moving Background */}
      <div className="fixed inset-0 -z-10" style={{ willChange: 'transform' }}>
        {/* Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10" />
        
        {/* Floating Gradient Orbs */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 80, 0],
            y: [0, -80, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Animated Grid Pattern */}
        <motion.div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Shield className="h-12 w-12 text-primary drop-shadow-lg" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent animate-gradient-shift">
                {t.title}
              </h1>
            </div>
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {t.subtitle}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={toggleLanguage}
                variant="outline"
                size="lg"
                className="gap-2 backdrop-blur-sm bg-background/50 hover:bg-background/80 border-2 relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{
                    x: ["-100%", "100%"]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <Languages className="h-5 w-5 relative z-10" />
                <span className="relative z-10">{language === "en" ? "Switch to हिन्दी" : "Switch to English"}</span>
              </Button>
            </motion.div>
          </motion.div>

          {/* State & District Selector Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="p-8 shadow-2xl border-2 backdrop-blur-sm bg-background/80 relative overflow-hidden group">
              {/* Animated corner accents */}
              <motion.div
                className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />

              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent relative z-10"
              >
                {t.selectState}
              </motion.h2>
              
              <div className="space-y-4 relative z-10">
                {/* Location Detection Button */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={detectLocation}
                    disabled={detectingLocation || loadingStates}
                    variant="secondary"
                    size="lg"
                    className="w-full gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity"
                      animate={{
                        x: ["-100%", "100%"]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    {detectingLocation ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin relative z-10" />
                        <span className="relative z-10">{language === "en" ? "Detecting Location..." : "स्थान खोज रहे हैं..."}</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-5 w-5 relative z-10" />
                        <span className="relative z-10">{language === "en" ? "Auto-Detect My Location" : "मेरा स्थान स्वतः पता लगाएं"}</span>
                      </>
                    )}
                  </Button>
                </motion.div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      {language === "en" ? "Or select manually" : "या मैन्युअल रूप से चुनें"}
                    </span>
                  </div>
                </div>

                {/* State Selector */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  <label className="text-sm font-medium mb-2 block">
                    {t.selectState}
                  </label>
                  {loadingStates ? (
                    <div className="flex items-center justify-center h-24 border rounded-md bg-muted/50">
                      <LoadingLogo size="sm" message={t.loading} />
                    </div>
                  ) : (
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger className="w-full h-12 text-lg">
                        <SelectValue placeholder={t.selectStatePlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.code} value={state.code}>
                            {language === "en" ? state.nameEn : state.nameHi}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </motion.div>

                {/* District Selector */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, type: "spring" }}
                >
                  <label className="text-sm font-medium mb-2 block">
                    {t.selectDistrict}
                  </label>
                  {loadingDistricts ? (
                    <div className="flex items-center justify-center h-24 border rounded-md bg-muted/50">
                      <LoadingLogo size="sm" message={t.loadingDistricts} />
                    </div>
                  ) : (
                    <Select 
                      value={selectedDistrict} 
                      onValueChange={setSelectedDistrict}
                      disabled={!selectedState || districts.length === 0}
                    >
                      <SelectTrigger className="w-full h-12 text-lg">
                        <SelectValue placeholder={t.selectDistrictPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district.code} value={district.code}>
                            {language === "en" ? district.nameEn : district.nameHi}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </motion.div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md"
                  >
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleViewDashboard}
                    disabled={!selectedDistrict || loadingDistricts}
                    size="lg"
                    className="w-full h-12 text-lg gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                      animate={{
                        x: ["-100%", "100%"]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    <span className="relative z-10">{t.viewDashboard}</span>
                    <ArrowRight className="h-5 w-5 relative z-10" />
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent"
          >
            {language === "en" ? "Key Features" : "मुख्य विशेषताएं"}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <Card className="p-6 h-full hover:shadow-2xl transition-all duration-300 backdrop-blur-sm bg-background/80 border-2 relative overflow-hidden group">
                  {/* Animated Gradient Background */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  
                  <div className="relative z-10">
                    <motion.div 
                      className={`text-transparent bg-gradient-to-br ${feature.gradient} bg-clip-text mb-4`}
                      whileInView={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1 + 0.3
                      }}
                    >
                      {feature.icon}
                    </motion.div>
                    <motion.h3 
                      className="text-lg font-semibold mb-2"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                    >
                      {feature.title}
                    </motion.h3>
                    <motion.p 
                      className="text-muted-foreground text-sm"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      {feature.description}
                    </motion.p>
                  </div>
                  
                  {/* Corner Accent */}
                  <motion.div
                    className={`absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-full blur-2xl opacity-0 group-hover:opacity-30`}
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}