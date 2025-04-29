

"use client";

import { useForm, Controller } from "react-hook-form";
// Removed zodResolver and reportSchema as validation will be based on dynamic fields
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Upload, Send, Loader2, MapPin, Mic, Image as ImageIcon, Trash2, AlertCircle, RadioGroupIndicator, TextCursorInput, ListOrdered, CheckSquare } from "lucide-react"; // Import base icons
import { useState, useEffect, useRef } from "react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { mockUser } from '@/lib/mock-data';
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Assuming RadioGroup exists
import { Alert, AlertTitle } from "@/components/ui/alert"; // For GPS/Audio messages

// Helper to get icon for display
const getIconForType = (type) => {
    switch(type) {
        case 'text': return <TextCursorInput className="w-4 h-4 mr-1" />;
        case 'multiple_choice': return <ListOrdered className="w-4 h-4 mr-1" />;
        case 'checkboxes': return <CheckSquare className="w-4 h-4 mr-1" />;
        case 'rating': return <Star className="w-4 h-4 mr-1" />;
        case 'image_upload': return <ImageIcon className="w-4 h-4 mr-1" />;
        case 'gps_capture': return <MapPin className="w-4 h-4 mr-1" />;
        case 'audio_recording': return <Mic className="w-4 h-4 mr-1" />;
        default: return null;
    }
};


// Component now receives surveyQuestions prop
export function ReportSubmissionForm({ mission, surveyQuestions = [], onSubmitAction }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State to manage dynamic field previews/data
  const [imagePreviews, setImagePreviews] = useState({}); // { questionId: [url1, url2] }
  const [gpsCoords, setGpsCoords] = useState({}); // { questionId: { lat: num, lng: num } | null }
  const [audioData, setAudioData] = useState({}); // { questionId: { url: '...', status: 'idle'|'recording'|'recorded' } }
  const audioRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);


   // Initialize react-hook-form without resolver, as fields are dynamic
   const form = useForm({
       // No defaultValues needed here initially, they are set based on questions
   });

   // Helper function to generate unique field name for RHF based on question id and type
   const getFieldName = (q) => `q_${q.id}_${q.type}`;

   // --- Media Handling ---

   // Image Upload Handling
   const handleImageChange = async (event, questionId, maxImages, allowMultiple) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const currentPreviews = imagePreviews[questionId] || [];
    const filesToProcess = allowMultiple ? files.slice(0, maxImages - currentPreviews.length) : [files[0]]; // Respect limits

    if (filesToProcess.length === 0 && !allowMultiple && currentPreviews.length > 0) {
         toast({ variant: "destructive", title: "Limit Reached", description: "Only one image allowed for this question." });
         return;
    }
     if (allowMultiple && filesToProcess.length < files.length) {
        toast({ variant: "destructive", title: "Limit Reached", description: `Maximum ${maxImages} images allowed.` });
    }

    const newPreviews = { ...imagePreviews };
    newPreviews[questionId] = [...currentPreviews];

    const uploadPromises = filesToProcess.map(file => {
      return new Promise(async (resolve) => {
        // 1. Create Preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => ({
            ...prev,
            [questionId]: [...(prev[questionId] || []), reader.result] // Add preview URL immediately
          }));
          newPreviews[questionId].push(reader.result); // Also keep track for form value setting
        };
        reader.readAsDataURL(file);

        // 2. Simulate Upload & Get URL
        console.log(`Simulating upload for ${file.name}...`);
        await new Promise(res => setTimeout(res, 1000 + Math.random() * 500)); // Simulate variable delay
        const placeholderUrl = `https://picsum.photos/400/300?random=${Math.random()}`;
        console.log(`Simulated upload complete for ${file.name}: ${placeholderUrl}`);
        resolve(placeholderUrl); // Resolve with the simulated URL
      });
    });

    // Wait for all simulations to complete
     const uploadedUrls = await Promise.all(uploadPromises);

     // Set RHF value: store array of URLs if multiple, single URL otherwise
     const existingUrls = form.getValues(getFieldName({ id: questionId, type: 'image_upload' })) || [];
     const finalUrls = allowMultiple ? [...existingUrls, ...uploadedUrls] : [uploadedUrls[0]]; // If not multiple, replace existing
     form.setValue(getFieldName({ id: questionId, type: 'image_upload' }), finalUrls);

     toast({ title: `Uploaded ${uploadedUrls.length} image(s)`, description: "Placeholder URLs generated." });
  };

    // Remove Image
  const removeImage = (questionId, indexToRemove) => {
        const currentUrls = form.getValues(getFieldName({ id: questionId, type: 'image_upload' })) || [];
        const updatedUrls = currentUrls.filter((_, index) => index !== indexToRemove);
        form.setValue(getFieldName({ id: questionId, type: 'image_upload' }), updatedUrls);

         // Update previews
        setImagePreviews(prev => ({
            ...prev,
             [questionId]: (prev[questionId] || []).filter((_, index) => index !== indexToRemove)
        }));
    };


  // GPS Capture Handling
  const handleGpsCapture = (questionId) => {
        setGpsCoords(prev => ({ ...prev, [questionId]: 'loading' })); // Show loading state
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setGpsCoords(prev => ({ ...prev, [questionId]: coords }));
              form.setValue(getFieldName({ id: questionId, type: 'gps_capture' }), coords); // Set RHF value
              toast({ title: "Location Captured", description: `Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}` });
              console.log("GPS Captured:", coords);
            },
            (error) => {
               setGpsCoords(prev => ({ ...prev, [questionId]: 'error' })); // Show error state
               console.error("Error getting location:", error);
               toast({ variant: "destructive", title: "Location Error", description: error.message });
               form.setValue(getFieldName({ id: questionId, type: 'gps_capture' }), null); // Clear RHF value on error
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Options
          );
        } else {
            setGpsCoords(prev => ({ ...prev, [questionId]: 'error' }));
            toast({ variant: "destructive", title: "Geolocation Not Supported", description: "Your browser does not support geolocation." });
            form.setValue(getFieldName({ id: questionId, type: 'gps_capture' }), null);
        }
    };


  // Audio Recording Handling
    const startRecording = async (questionId, maxDurationSeconds) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = []; // Reset chunks

            audioRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };

            audioRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Or appropriate type
                // Simulate upload
                console.log(`Simulating audio upload (${(audioBlob.size / 1024).toFixed(2)} KB)...`);
                await new Promise(res => setTimeout(res, 1500));
                const placeholderAudioUrl = `/audio/simulated_${questionId}_${Date.now()}.webm`; // Placeholder URL
                console.log("Simulated audio upload complete:", placeholderAudioUrl);

                setAudioData(prev => ({
                    ...prev,
                    [questionId]: { url: placeholderAudioUrl, status: 'recorded' }
                }));
                form.setValue(getFieldName({ id: questionId, type: 'audio_recording' }), placeholderAudioUrl); // Set RHF value

                toast({ title: "Audio Recorded & Uploaded (Simulated)" });

                 // Stop tracks to release mic
                stream.getTracks().forEach(track => track.stop());
            };

            audioRecorderRef.current.start();
            setAudioData(prev => ({ ...prev, [questionId]: { url: null, status: 'recording' } }));
            toast({ title: "Recording Started...", description: `Max ${maxDurationSeconds} seconds.` });

            // Stop recording after max duration
            setTimeout(() => {
                if (audioRecorderRef.current && audioRecorderRef.current.state === "recording") {
                    stopRecording(questionId);
                }
            }, maxDurationSeconds * 1000);

        } catch (error) {
            console.error("Error starting recording:", error);
            toast({ variant: "destructive", title: "Audio Error", description: "Could not start recording. Check microphone permissions." });
             setAudioData(prev => ({ ...prev, [questionId]: { url: null, status: 'error' } }));
        }
    };

    const stopRecording = (questionId) => {
        if (audioRecorderRef.current && audioRecorderRef.current.state === "recording") {
            audioRecorderRef.current.stop();
            // Status update happens in 'onstop' handler
        }
    };

    const removeAudio = (questionId) => {
        setAudioData(prev => ({ ...prev, [questionId]: { url: null, status: 'idle' } }));
        form.setValue(getFieldName({ id: questionId, type: 'audio_recording' }), null); // Clear RHF value
         if (audioRecorderRef.current && audioRecorderRef.current.state === "recording") {
            audioRecorderRef.current.stop(); // Stop recording if active
            // Stop tracks
            audioRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
        }
         toast({ title: "Audio Removed" });
    };


  // Form Submission Logic
  const processSubmit = async (data) => {
    setIsSubmitting(true);
    // Structure data before sending to server action
    const submittedData = {
        answers: data // data directly contains the { q_id_type: value } structure
    };
    console.log("Submitting structured report data:", JSON.stringify(submittedData, null, 2));

     // --- Validation (Client-side, basic) ---
     let isValid = true;
     surveyQuestions.forEach(q => {
         const fieldName = getFieldName(q);
         const value = data[fieldName];
         if (q.isRequired) {
             if (q.type === 'checkboxes') {
                 // Check if the value object exists and if at least one checkbox is true
                 if (!value || !Object.values(value).some(v => v === true)) {
                    form.setError(fieldName, { type: 'required', message: 'Please select at least one option.' });
                    isValid = false;
                 }
             } else if (value === undefined || value === null || value === '') { // Check for empty/null/undefined values
                 form.setError(fieldName, { type: 'required', message: 'This field is required.' });
                 isValid = false;
             }
         }
         // Add more specific validation if needed (e.g., text length for 'text' type)
     });


     if (!isValid) {
        toast({ variant: "destructive", title: "Validation Error", description: "Please fill in all required fields." });
        setIsSubmitting(false);
        return;
     }
     // --- End Validation ---


    try {
        // Call the server action passed as a prop
        await onSubmitAction(submittedData, mission.id, mockUser.id);

        toast({
            title: "Report Submitted Successfully!",
            description: `Your report for "${mission.title}" has been submitted.`,
            variant: "default", // Use default style for success
          });
        // Redirect to a success page or mission list after successful submission
        router.push('/missions/completed'); // Adjust route as needed
    } catch (error) {
        console.error("Submission failed:", error);
        toast({
            title: "Submission Failed",
            description: error.message || "Could not submit the report. Please try again.", // Show server action error message if available
            variant: "destructive",
          });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary">Submit Report: {mission.title}</CardTitle>
            <CardDescription>Complete the survey questions below for mission ID: {mission.id}</CardDescription>
        </CardHeader>
        <Form {...form}>
            {/* Use RHF's handleSubmit to trigger validation and then call processSubmit */}
            <form onSubmit={form.handleSubmit(processSubmit)} className="space-y-8">
                <CardContent className="space-y-6">
                {surveyQuestions.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No survey questions found for this mission.</p>
                )}
                {surveyQuestions.map((q, index) => {
                     const fieldName = getFieldName(q);
                     return (
                        <FormField
                            control={form.control}
                            name={fieldName} // Use the main field name for the top-level Field
                            rules={{ required: q.isRequired }}
                            key={q.id}
                            render={({ field }) => ( // field here represents the top-level RHF field state
                                <FormItem className="border-t pt-6 first:border-t-0 first:pt-0">
                                    {/* Question Label with Type Icon */}
                                    <FormLabel className="font-semibold text-md flex items-center gap-2">
                                        {getIconForType(q.type)}
                                        {index + 1}. {q.text}
                                        {q.isRequired && <span className="text-destructive text-xs ml-1">*</span>}
                                    </FormLabel>
                                    {/* Optional Description */}
                                    {q.description && (
                                        <FormDescription className="text-sm ml-6">{q.description}</FormDescription>
                                    )}

                                    {/* Render input based on question type */}
                                    <FormControl className="pl-6 mt-2">
                                        {/* Wrap content in a div to receive props from Slot */}
                                        <div>
                                            {q.type === 'text' && (
                                                <Textarea placeholder="Your answer..." {...field} />
                                            )}

                                            {q.type === 'rating' && (
                                                <div className="flex space-x-1 items-center">
                                                    <span className="text-xs mr-2 text-muted-foreground">{q.minLabel || 'Poor'}</span>
                                                    {[...Array(q.maxRating || 5).keys()].map((i) => {
                                                        const ratingValue = i + 1;
                                                        return (
                                                            <Button
                                                                key={ratingValue}
                                                                type="button"
                                                                variant={field.value >= ratingValue ? "default" : "outline"}
                                                                size="icon"
                                                                className={`h-8 w-8 ${field.value >= ratingValue ? 'bg-accent text-accent-foreground border-accent' : 'text-muted-foreground'} hover:bg-accent/80 hover:text-accent-foreground transition-colors`}
                                                                onClick={() => form.setValue(fieldName, ratingValue, { shouldValidate: true })} // Use form.setValue to trigger RHF update
                                                            >
                                                                <Star className="w-5 h-5" fill={field.value >= ratingValue ? 'currentColor' : 'none'} />
                                                            </Button>
                                                        );
                                                    })}
                                                    <span className="text-xs ml-2 text-muted-foreground">{q.maxLabel || 'Excellent'}</span>
                                                </div>
                                            )}

                                            {q.type === 'multiple_choice' && (
                                                <RadioGroup
                                                    onValueChange={field.onChange} // RHF's onChange handles the update
                                                    value={field.value} // RHF controls the value
                                                    className="space-y-2"
                                                >
                                                    {q.options?.map((opt) => (
                                                        <FormItem key={opt.id} className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value={opt.text} />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">{opt.text}</FormLabel>
                                                        </FormItem>
                                                    ))}
                                                </RadioGroup>
                                            )}

                                            {q.type === 'checkboxes' && (
                                                <div className="space-y-2">
                                                    {q.options?.map((opt) => (
                                                        <FormField
                                                            key={opt.id}
                                                            control={form.control}
                                                            name={`${fieldName}.${opt.id}`} // Nested field name
                                                            render={({ field: checkboxField }) => ( // Use a different name for nested field
                                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={checkboxField.value || false}
                                                                            onCheckedChange={checkboxField.onChange}
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">{opt.text}</FormLabel>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {q.type === 'image_upload' && (
                                                <div className="space-y-3">
                                                    <Input
                                                        id={`q-img-${q.id}`}
                                                        type="file"
                                                        accept="image/*"
                                                        multiple={q.allowMultiple ?? true} // Default to true if undefined
                                                        onChange={(e) => handleImageChange(e, q.id, q.maxImages ?? 5, q.allowMultiple ?? true)}
                                                        disabled={(imagePreviews[q.id]?.length || 0) >= (q.maxImages ?? 5) && q.allowMultiple}
                                                        className="block w-full max-w-xs text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                                    />
                                                    {(imagePreviews[q.id]?.length || 0) > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {(imagePreviews[q.id] || []).map((url, index) => (
                                                                <div key={index} className="relative group">
                                                                    <Image
                                                                        src={url}
                                                                        alt={`Preview ${index + 1}`}
                                                                        width={100}
                                                                        height={75}
                                                                        className="rounded-md object-cover border"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="icon"
                                                                        className="absolute top-0 right-0 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        onClick={() => removeImage(q.id, index)}
                                                                    >
                                                                        <Trash2 className="h-3 w-3"/>
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <FormDescription className="text-xs">
                                                        {q.allowMultiple ? `Upload up to ${q.maxImages ?? 5} images.` : `Upload 1 image.`} Allowed types: JPG, PNG.
                                                    </FormDescription>
                                                    {/* Hidden input managed internally by RHF */}
                                                </div>
                                            )}

                                            {q.type === 'gps_capture' && (
                                                <div className="space-y-2">
                                                    <Button type="button" variant="outline" onClick={() => handleGpsCapture(q.id)} disabled={gpsCoords[q.id] === 'loading'}>
                                                        <MapPin className="w-4 h-4 mr-2"/>
                                                        {gpsCoords[q.id] === 'loading' && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                                                        {gpsCoords[q.id] && typeof gpsCoords[q.id] === 'object' ? 'Recapture Location' : 'Capture Current Location'}
                                                    </Button>
                                                    {gpsCoords[q.id] && typeof gpsCoords[q.id] === 'object' && (
                                                        <p className="text-sm text-green-600">Location captured: Lat {gpsCoords[q.id].lat.toFixed(4)}, Lng {gpsCoords[q.id].lng.toFixed(4)}</p>
                                                    )}
                                                    {gpsCoords[q.id] === 'error' && (
                                                        <p className="text-sm text-destructive">Could not capture location.</p>
                                                    )}
                                                    {/* Hidden input managed internally by RHF */}
                                                </div>
                                            )}

                                            {q.type === 'audio_recording' && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => startRecording(q.id, q.maxDurationSeconds ?? 60)}
                                                            disabled={audioData[q.id]?.status === 'recording' || !!audioData[q.id]?.url}
                                                        >
                                                            <Mic className="w-4 h-4 mr-2"/> Start Recording
                                                        </Button>
                                                        {audioData[q.id]?.status === 'recording' && (
                                                            <>
                                                                <Button type="button" variant="destructive" onClick={() => stopRecording(q.id)}>
                                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin"/> Stop Recording
                                                                </Button>
                                                                <span className="text-xs text-muted-foreground italic">Recording...</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {audioData[q.id]?.url && (
                                                         <div className="flex items-center gap-2 p-2 border rounded bg-secondary">
                                                             {/* Check if it's a simulated URL before rendering the player */}
                                                             {audioData[q.id].url.startsWith('/audio/simulated_') ? (
                                                                 <div className="flex items-center gap-2 text-muted-foreground text-sm italic flex-grow">
                                                                     <Mic className="w-4 h-4" />
                                                                     <span>Audio recorded (simulation: {audioData[q.id].url.split('/').pop()})</span>
                                                                 </div>
                                                             ) : (
                                                                 <audio controls src={audioData[q.id].url} className="w-full max-w-xs h-10 flex-grow">
                                                                     Your browser does not support the audio element.
                                                                 </audio>
                                                             )}
                                                             <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeAudio(q.id)}>
                                                                 <Trash2 className="w-4 h-4"/>
                                                             </Button>
                                                         </div>
                                                    )}
                                                    {audioData[q.id]?.status === 'error' && (
                                                        <p className="text-sm text-destructive">Audio recording failed.</p>
                                                    )}
                                                    <FormDescription className="text-xs">
                                                        Record audio up to {q.maxDurationSeconds ?? 60} seconds.
                                                    </FormDescription>
                                                    {/* Hidden input managed internally by RHF */}
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    {/* Validation Message */}
                                    <FormMessage className="pl-6" />
                                </FormItem>
                            )}
                        />
                     );
                })}
                </CardContent>
                <CardFooter>
                 <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                        <>
                         <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                        </>
                    ) : (
                        <>
                         <Send className="w-4 h-4 mr-2" /> Submit Report
                        </>
                    )}
                </Button>
                </CardFooter>
            </form>
        </Form>
         {/* Global error for permissions if needed */}
         {/* Example: Display if camera/mic/location is generally denied */}
         {/* <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Permissions Required</AlertTitle>
            <AlertDescription>
                 Please ensure location, microphone, and camera permissions are enabled in your browser settings to use all features.
            </AlertDescription>
         </Alert> */}
    </Card>
  );
}

