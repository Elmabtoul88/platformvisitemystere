"use client";

import type { Mission, ReportInput } from '@/types/mission';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reportSchema } from "@/lib/validators";
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
import { Star, Upload, Send } from "lucide-react";
import { useState } from "react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";


interface ReportSubmissionFormProps {
  mission: Mission;
  onSubmit: (data: ReportInput) => Promise<void>; // Simulate async submission
}

export function ReportSubmissionForm({ mission, onSubmit }: ReportSubmissionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

   const form = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      rating: 3, // Default rating
      comments: "",
      photoUrl: "",
    },
  });

  // Simulate photo upload and get URL
  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
     const file = event.target.files?.[0];
    if (file) {
        // Basic preview
         const reader = new FileReader();
         reader.onloadend = () => {
           setPreviewUrl(reader.result as string);
         };
         reader.readAsDataURL(file);

        // In a real app: upload file to Firebase Storage or similar
        // For now, just set a placeholder URL after a delay
        console.log("Simulating photo upload...");
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        const placeholderUrl = `https://picsum.photos/400/300?random=${Math.random()}`;
        form.setValue("photoUrl", placeholderUrl);
        console.log("Simulated upload complete:", placeholderUrl);
         toast({ title: "Photo Uploaded (Simulated)", description: "Placeholder URL generated." });
    } else {
         setPreviewUrl(null);
         form.setValue("photoUrl", "");
    }
  };

  const handleSubmit = async (data: ReportInput) => {
    setIsSubmitting(true);
    console.log("Submitting report:", data);
    try {
        await onSubmit(data); // Call the passed onSubmit function
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
            description: "Could not submit the report. Please try again.",
            variant: "destructive",
          });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary">Submit Report: {mission.title}</CardTitle>
            <CardDescription>Complete the form below for mission ID: {mission.id}</CardDescription>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-accent" /> Overall Rating (1-5)
                        </FormLabel>
                        <FormControl>
                             <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Button
                                    key={star}
                                    type="button"
                                    variant={field.value >= star ? "default" : "outline"}
                                    size="icon"
                                    className={`
                                      ${field.value >= star ? 'bg-accent text-accent-foreground border-accent' : 'text-muted-foreground'}
                                      hover:bg-accent/80 hover:text-accent-foreground transition-colors
                                    `}
                                    onClick={() => field.onChange(star)}
                                  >
                                    <Star className="w-5 h-5" fill={field.value >= star ? 'currentColor' : 'none'} />
                                    <span className="sr-only">{star} Star</span>
                                  </Button>
                                ))}
                              </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Comments</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Describe your experience in detail..."
                            className="resize-y min-h-[100px]"
                            {...field}
                        />
                        </FormControl>
                        <FormDescription>
                        Provide specific details about your observations. (Min. 10 characters)
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                 <FormField
                    control={form.control}
                    name="photoUrl"
                    render={({ field }) => ( // Use field from render prop for hidden input if needed
                    <FormItem>
                        <FormLabel className="flex items-center gap-1">
                            <Upload className="w-4 h-4" /> Upload Photo (Optional)
                        </FormLabel>
                        <FormControl>
                             <Input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange} // Trigger simulation on change
                                className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary/10 file:text-primary
                                hover:file:bg-primary/20"
                            />
                        </FormControl>
                         {previewUrl && (
                          <div className="mt-4">
                            <Image
                              src={previewUrl}
                              alt="Photo preview"
                              width={200}
                              height={150}
                              className="rounded-md object-cover border"
                            />
                          </div>
                        )}
                         {/* Hidden input to store the URL from the simulation */}
                        <input type="hidden" {...field} />
                        <FormDescription>
                        Upload a relevant photo (e.g., storefront, product, receipt).
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </CardContent>
                <CardFooter>
                 <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                        <>
                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                         Submitting...
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
    </Card>
  );
}
