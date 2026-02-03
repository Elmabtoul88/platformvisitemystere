"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge"; // Import Badge component
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Save,
  PlusCircle,
  Trash2,
  GripVertical,
  Loader2,
  ListOrdered,
  TextCursorInput,
  Star,
  Circle, // Basic types
  Image as ImageIcon,
  MapPin,
  Mic,
  CheckSquare as CheckSquareIcon,
  Columns,
  Info, // Added correct CheckSquare icon
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { saveSurvey } from "@/app/actions/survey-actions"; // Import the correct server action using alias
import { useAuth } from "@/context/auth-context"; // Import useAuth
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Import RadioGroup
import { fetchMissions, postMissions } from "@/services/fetchData";

const QUESTION_TYPES = {
  TEXT: "text",
  MULTIPLE_CHOICE: "multiple_choice",
  CHECKBOXES: "checkboxes",
  RATING: "rating",
  IMAGE_UPLOAD: "image_upload",
  GPS_CAPTURE: "gps_capture",
  AUDIO_RECORDING: "audio_recording",
  SECTION_HEADER: "section_header",
  INFO_TEXT: "info_text",
};

// Function to get icon based on type
const getIconForType = (type) => {
  switch (type) {
    case QUESTION_TYPES.TEXT:
      return <TextCursorInput className="w-4 h-4 mr-1" />;
    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return <ListOrdered className="w-4 h-4 mr-1" />;
    case QUESTION_TYPES.CHECKBOXES:
      return <CheckSquareIcon className="w-4 h-4 mr-1" />; // Use imported icon
    case QUESTION_TYPES.RATING:
      return <Star className="w-4 h-4 mr-1" />;
    case QUESTION_TYPES.IMAGE_UPLOAD:
      return <ImageIcon className="w-4 h-4 mr-1" />;
    case QUESTION_TYPES.GPS_CAPTURE:
      return <MapPin className="w-4 h-4 mr-1" />;
    case QUESTION_TYPES.AUDIO_RECORDING:
      return <Mic className="w-4 h-4 mr-1" />;
    case QUESTION_TYPES.SECTION_HEADER:
      return <Columns className="w-4 h-4 mr-1" />;
    case QUESTION_TYPES.INFO_TEXT:
      return <Info className="w-4 h-4 mr-1" />;
    default:
      return null;
  }
};

// Initial empty question structure based on type
const createNewQuestion = (type, id) => {
  // HEADER
  if (type === QUESTION_TYPES.SECTION_HEADER) {
    return {
      id,
      type,
      title: "", // titre de section
    };
  }

  // INFO TEXT
  if (type === QUESTION_TYPES.INFO_TEXT) {
    return {
      id,
      type,
      content: "", // texte explicatif
    };
  }

  // QUESTIONS NORMALES
  const base = { id, type, text: "", isRequired: false };

  if (
    type === QUESTION_TYPES.MULTIPLE_CHOICE ||
    type === QUESTION_TYPES.CHECKBOXES
  ) {
    base.options = [{ id: Date.now(), text: "" }];
  }

  if (type === QUESTION_TYPES.RATING) {
    base.maxRating = 5;
    base.minLabel = "Poor";
    base.maxLabel = "Excellent";
  }

  if (type === QUESTION_TYPES.IMAGE_UPLOAD) {
    base.maxImages = 5;
    base.allowMultiple = true;
  }

  if (type === QUESTION_TYPES.AUDIO_RECORDING) {
    base.maxDurationSeconds = 60;
  }

  return base;
};

export default function CreateSurveyPage() {
  const router = useRouter();
  const params = useParams();
  const missionId = params.missionId;
  const { toast } = useToast();
  const { token } = useAuth(); // Get token for API call
  const [questions, setQuestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // For fetching existing survey/mission title
  const [missionTitle, setMissionTitle] = useState("Loading..."); // Placeholder
  const [currentUser, setCureentUser] = useState(null);
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://api.embertongroup.com/api/";
  // Fetch existing survey data and mission title (Simulation for now)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const user = localStorage.getItem("missionViewAuth");
      const parsedUser = user ? JSON.parse(user) : null;

      console.log(`🔍 Fetching data for mission: ${missionId}`);

      try {
        const [m, sq] = await Promise.all([
          fetchMissions(
            "admin-missions" + missionId,
            API_BASE_URL + "missions/" + missionId,
          ),
          fetchMissions(
            "surveyQuestions" + missionId,
            API_BASE_URL + "surveyQuestions/surveyqBymission/" + missionId,
          ),
        ]);
        console.log("fetch questions:", sq);
        if (m && sq) {
          sq.forEach((q) => {
            if (q.type === "multiple_choice" || q.type === "checkboxes") {
            }
          });

          setQuestions(sq);
          setMissionTitle(m[0]?.title || `Mission ${missionId}`);
        }
        setCureentUser(parsedUser.user.id);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error Loading Data",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (missionId) {
      fetchData();
    }
  }, [missionId, toast]);

  const addQuestion = (type) => {
    setQuestions((prev) => [...prev, createNewQuestion(type, Date.now())]);
  };

  const removeQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  };

  const handleNumericInputChange = (questionId, field, rawValue) => {
    const parsedValue = parseInt(rawValue, 10);
    // Allow empty string to clear the field, otherwise validate if it's a number
    if (rawValue === "") {
      updateQuestion(questionId, field, ""); // Set to empty string if input is cleared
    } else if (!isNaN(parsedValue)) {
      updateQuestion(questionId, field, parsedValue);
    }
    // If it's not a number and not empty, do nothing (prevents invalid characters)
  };

  const updateQuestionOption = (questionId, optionId, value) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map((opt) =>
              opt.id === optionId ? { ...opt, text: value } : opt,
            ),
          };
        }
        return q;
      }),
    );
  };

  const addQuestionOption = (questionId) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (
          q.id === questionId &&
          (q.type === QUESTION_TYPES.MULTIPLE_CHOICE ||
            q.type === QUESTION_TYPES.CHECKBOXES)
        ) {
          return {
            ...q,
            options: [...q.options, { id: Date.now(), text: "" }],
          };
        }
        return q;
      }),
    );
  };

  const removeQuestionOption = (questionId, optionId) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.options.length > 1) {
          // Only allow removal if more than one option exists
          return {
            ...q,
            options: q.options.filter((opt) => opt.id !== optionId),
          };
        }
        return q;
      }),
    );
  };

  const handleSaveSurvey = async () => {
    setIsSaving(true);

    if (questions.length === 0) {
      toast({
        variant: "destructive",
        title: "Survey Empty",
        description: "Please add at least one question.",
      });
      setIsSaving(false);
      return;
    }

    // 1️⃣ Sanitize questions
    const sanitizedQuestions = questions.map((q) => {
      const sanitizedQ = { ...q };

      if (q.type === "multiple_choice" || q.type === "checkboxes") {
        if (q.options && Array.isArray(q.options)) {
          sanitizedQ.options = q.options.filter(
            (opt) => opt.text && opt.text.trim() !== "",
          );
        } else {
          sanitizedQ.options = [];
        }
      }

      if (sanitizedQ.type === "image_upload") {
        sanitizedQ.maxImages = parseInt(sanitizedQ.maxImages, 10) || 1;
      }
      if (sanitizedQ.type === "audio_recording") {
        sanitizedQ.maxDurationSeconds =
          parseInt(sanitizedQ.maxDurationSeconds, 10) || 60;
      }
      if (sanitizedQ.type === "rating") {
        sanitizedQ.maxRating = parseInt(sanitizedQ.maxRating, 10) || 5;
      }

      return sanitizedQ;
    });

    // 2️⃣ Regrouper par section (utile côté frontend)
    const groupedQuestions = groupQuestionsBySection(sanitizedQuestions);

    // 3️⃣ Aplatir les questions pour le backend
    const flattenedQuestions = groupedQuestions.flatMap((section) => {
      // Create section header object
      const sectionHeader = {
        type: "section_header",
        title: section.title,
        text: section.title, // required for DB NOT NULL
        isRequired: false,
      };
      // Then append actual questions in this section
      const questionsWithSection = section.questions.map((q) => ({
        ...q,
        sectionTitle: section.title,
      }));
      return [sectionHeader, ...questionsWithSection];
    });

    // 4️⃣ Préparer les données à envoyer
    const data = {
      mission_id: parseInt(missionId),
      user_id: currentUser,
      questions: flattenedQuestions,
    };

    console.log("📤 Data sent to API (flattened):", data);

    // 5️⃣ Envoi vers le backend
    try {
      const baseUrl = API_BASE_URL + "surveyQuestions";
      const result = await postMissions(
        baseUrl,
        data,
        "surveyQuestions" + missionId,
        baseUrl + "/" + missionId,
      );

      if (result.status === 200) {
        toast({
          title: "Survey Saved Successfully",
          description: result.message,
        });
        router.push("/admin/missions");
      } else {
        throw new Error(result.message || "Failed to save survey");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Save Survey",
        description: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("questionIndex", index);
  };

  const handleDrop = (e, index) => {
    const draggedIndex = parseInt(e.dataTransfer.getData("questionIndex"), 10);
    if (draggedIndex === index) return;

    const newQuestions = [...questions];
    const [draggedItem] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(index, 0, draggedItem);
    setQuestions(newQuestions);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const groupQuestionsBySection = (questions) => {
    const grouped = [];
    let currentSection = null;

    questions.forEach((q) => {
      if (q.type === "section_header") {
        currentSection = {
          id: q.id,
          title: q.title || "Untitled section",
          questions: [],
        };
        grouped.push(currentSection);
      } else {
        if (!currentSection) {
          currentSection = {
            id: "default",
            title: "General",
            questions: [],
          };
          grouped.push(currentSection);
        }
        currentSection.questions.push(q);
      }
    });

    return grouped;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading Survey Editor...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button asChild variant="outline" size="sm" className="mb-4">
        {/* Link back to the specific mission or mission list */}
        <Link href="/admin/missions">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Missions
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary">
            Create/Edit Survey
          </CardTitle>
          <CardDescription>
            Build or modify the survey questions for:{" "}
            <span className="font-medium">{missionTitle}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {questions.length === 0 && (
            <p className="text-center text-muted-foreground py-6">
              No questions added yet. Add questions using the buttons below.
            </p>
          )}
          {questions.map((q, index) => (
            <Card
              key={q.id}
              className="p-4 border bg-card shadow-sm relative"
              draggable // Enable dragging
              onDragStart={(e) => handleDragStart(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragOver={handleDragOver}
            >
              {/* Drag Handle (optional visual cue) */}
              <GripVertical className="absolute left-1 top-1/2 transform -translate-y-1/2 text-muted-foreground cursor-move h-5 w-5" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => removeQuestion(q.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove Question</span>
              </Button>

              <div className="pl-6 space-y-3">
                {" "}
                <div className="space-y-1">
                  <Label htmlFor={`q-text-${q.id}`}>Question {index + 1}</Label>
                  <Input
                    id={`q-text-${q.id}`}
                    placeholder="Enter your question or instructions"
                    value={q.text ?? ""}
                    onChange={(e) =>
                      updateQuestion(q.id, "text", e.target.value)
                    }
                  />
                </div>
                {/* ===== SECTION HEADER ===== */}
                {q.type === QUESTION_TYPES.SECTION_HEADER && (
                  <div className="space-y-2">
                    <Label className="font-semibold text-primary flex items-center gap-1">
                      <Columns className="w-4 h-4" />
                      Section title
                    </Label>
                    <Input
                      placeholder="Ex: Informations personnelles"
                      value={q.title ?? ""}
                      onChange={(e) =>
                        updateQuestion(q.id, "title", e.target.value)
                      }
                      className="text-lg font-bold"
                    />
                  </div>
                )}
                {/* ===== INFO TEXT ===== */}
                {q.type === QUESTION_TYPES.INFO_TEXT && (
                  <div className="space-y-2">
                    <Label className="font-medium text-sky-700 flex items-center gap-1">
                      <Info className="w-4 h-4" />
                      Information text
                    </Label>
                    <Textarea
                      placeholder="Texte informatif pour l'utilisateur"
                      value={q.content ?? ""}
                      onChange={(e) =>
                        updateQuestion(q.id, "content", e.target.value)
                      }
                      className="min-h-[80px]"
                    />
                  </div>
                )}
                {/* Question Type Indicator (Readonly) */}
                <Badge variant="secondary" className="capitalize">
                  {getIconForType(q.type)}
                  {q.type.replace(/_/g, " ")} Question
                </Badge>
                {/* Options for Multiple Choice / Checkboxes */}
                {(q.type === QUESTION_TYPES.MULTIPLE_CHOICE ||
                  q.type === QUESTION_TYPES.CHECKBOXES) && (
                  <div className="space-y-2 pl-4 border-l ml-2">
                    <Label className="text-sm font-medium">Options</Label>
                    {q.options?.map(
                      (
                        opt,
                        optIndex, // Added optional chaining
                      ) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          {/* Visual indicator only, RadioGroup/Checkbox handles actual selection */}
                          {q.type === QUESTION_TYPES.MULTIPLE_CHOICE && (
                            <Circle className="h-4 w-4 text-muted-foreground opacity-50" />
                          )}
                          {q.type === QUESTION_TYPES.CHECKBOXES && (
                            <Checkbox
                              checked={false}
                              disabled
                              className="opacity-50"
                            />
                          )}
                          <Input
                            placeholder={`Option ${optIndex + 1}`}
                            value={opt.text}
                            onChange={(e) =>
                              updateQuestionOption(q.id, opt.id, e.target.value)
                            }
                            className="flex-grow h-8"
                          />
                          {q.options.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => removeQuestionOption(q.id, opt.id)}
                              type="button"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ),
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addQuestionOption(q.id)}
                    >
                      <PlusCircle className="w-4 h-4 mr-1" /> Add Option
                    </Button>
                  </div>
                )}
                {/* Settings for Rating */}
                {q.type === QUESTION_TYPES.RATING && (
                  <div className="space-y-3 pl-4 border-l ml-2">
                    <Label className="text-sm font-medium">Rating Scale</Label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <Button
                          key={num}
                          type="button"
                          variant={
                            num <= (q.maxRating ?? 5) ? "default" : "outline"
                          } // Handle undefined maxRating
                          size="icon"
                          className={`h-7 w-7 opacity-50 ${
                            num <= (q.maxRating ?? 5)
                              ? "bg-accent text-accent-foreground border-accent"
                              : ""
                          }`}
                          disabled // Make visual only
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <Label
                        htmlFor={`q-rating-max-${q.id}`}
                        className="text-xs col-span-1"
                      >
                        Max Rating:
                      </Label>
                      <Select
                        value={String(q.maxRating ?? 5)} // Default to 5 if undefined
                        onValueChange={(val) =>
                          updateQuestion(q.id, "maxRating", parseInt(val, 10))
                        }
                      >
                        <SelectTrigger
                          id={`q-rating-max-${q.id}`}
                          className="h-8 text-xs col-span-2"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <SelectItem key={num} value={String(num)}>
                              {num} Stars
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <Label
                        htmlFor={`q-rating-minlabel-${q.id}`}
                        className="text-xs col-span-1"
                      >
                        Min Label:
                      </Label>
                      <Input
                        id={`q-rating-minlabel-${q.id}`}
                        value={q.minLabel || ""} // Handle undefined
                        onChange={(e) =>
                          updateQuestion(q.id, "minLabel", e.target.value)
                        }
                        className="h-8 text-xs col-span-2"
                        placeholder="e.g., Poor"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <Label
                        htmlFor={`q-rating-maxlabel-${q.id}`}
                        className="text-xs col-span-1"
                      >
                        Max Label:
                      </Label>
                      <Input
                        id={`q-rating-maxlabel-${q.id}`}
                        value={q.maxLabel || ""} // Handle undefined
                        onChange={(e) =>
                          updateQuestion(q.id, "maxLabel", e.target.value)
                        }
                        className="h-8 text-xs col-span-2"
                        placeholder="e.g., Excellent"
                      />
                    </div>
                  </div>
                )}
                {/* Settings for Image Upload */}
                {q.type === QUESTION_TYPES.IMAGE_UPLOAD && (
                  <div className="space-y-3 pl-4 border-l ml-2">
                    <Label className="text-sm font-medium">
                      Image Upload Options
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`q-img-multiple-${q.id}`}
                        checked={q.allowMultiple ?? true} // Default to true
                        onCheckedChange={(checked) =>
                          updateQuestion(q.id, "allowMultiple", checked)
                        }
                      />
                      <Label
                        htmlFor={`q-img-multiple-${q.id}`}
                        className="text-xs"
                      >
                        Allow Multiple Images
                      </Label>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <Label
                        htmlFor={`q-img-max-${q.id}`}
                        className="text-xs col-span-1"
                      >
                        Max Images:
                      </Label>
                      <Input
                        id={`q-img-max-${q.id}`}
                        type="number"
                        min="1"
                        max="10" // Sensible upper limit
                        value={q.maxImages ?? ""} // Use ?? for default handling
                        onChange={(e) =>
                          handleNumericInputChange(
                            q.id,
                            "maxImages",
                            e.target.value,
                          )
                        }
                        className="h-8 text-xs col-span-2"
                        disabled={!(q.allowMultiple ?? true)} // Disable if allowMultiple is false
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Shopper will be prompted to upload photos.
                    </p>
                  </div>
                )}
                {/* Settings for GPS Capture */}
                {q.type === QUESTION_TYPES.GPS_CAPTURE && (
                  <div className="pl-4 border-l ml-2">
                    <p className="text-xs text-muted-foreground">
                      Shopper will be prompted to capture their current
                      location.
                    </p>
                  </div>
                )}
                {/* Settings for Audio Recording */}
                {q.type === QUESTION_TYPES.AUDIO_RECORDING && (
                  <div className="space-y-3 pl-4 border-l ml-2">
                    <Label className="text-sm font-medium">
                      Audio Recording Options
                    </Label>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <Label
                        htmlFor={`q-audio-max-${q.id}`}
                        className="text-xs col-span-1"
                      >
                        Max Duration (sec):
                      </Label>
                      <Input
                        id={`q-audio-max-${q.id}`}
                        type="number"
                        min="5"
                        max="300" // 5 minutes max?
                        value={q.maxDurationSeconds ?? ""} // Use ?? for default handling
                        onChange={(e) =>
                          handleNumericInputChange(
                            q.id,
                            "maxDurationSeconds",
                            e.target.value,
                          )
                        }
                        className="h-8 text-xs col-span-2"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Shopper will be able to record audio directly.
                    </p>
                  </div>
                )}
                {/* Required Toggle */}
                <div className="flex items-center justify-end space-x-2 pt-2">
                  <Checkbox
                    id={`q-required-${q.id}`}
                    checked={q.isRequired}
                    onCheckedChange={(checked) =>
                      updateQuestion(q.id, "isRequired", checked)
                    }
                  />
                  <Label htmlFor={`q-required-${q.id}`} className="text-xs">
                    Required
                  </Label>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-4 pt-6 border-t">
          <p className="text-sm font-medium text-primary">Add New Question</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => addQuestion(QUESTION_TYPES.SECTION_HEADER)}
            >
              <Columns className="w-4 h-4 mr-1" />
              Section Header
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => addQuestion(QUESTION_TYPES.INFO_TEXT)}
            >
              <Info className="w-4 h-4 mr-1" />
              Info Text
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => addQuestion(QUESTION_TYPES.TEXT)}
            >
              {getIconForType(QUESTION_TYPES.TEXT)} Text
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => addQuestion(QUESTION_TYPES.MULTIPLE_CHOICE)}
            >
              {getIconForType(QUESTION_TYPES.MULTIPLE_CHOICE)} Multiple Choice
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => addQuestion(QUESTION_TYPES.CHECKBOXES)}
            >
              {getIconForType(QUESTION_TYPES.CHECKBOXES)} Checkboxes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => addQuestion(QUESTION_TYPES.RATING)}
            >
              {getIconForType(QUESTION_TYPES.RATING)} Rating
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => addQuestion(QUESTION_TYPES.IMAGE_UPLOAD)}
            >
              {getIconForType(QUESTION_TYPES.IMAGE_UPLOAD)} Image Upload
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => addQuestion(QUESTION_TYPES.GPS_CAPTURE)}
            >
              {getIconForType(QUESTION_TYPES.GPS_CAPTURE)} GPS Location
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => addQuestion(QUESTION_TYPES.AUDIO_RECORDING)}
            >
              {getIconForType(QUESTION_TYPES.AUDIO_RECORDING)} Audio Recording
            </Button>
          </div>
          <Button
            onClick={handleSaveSurvey}
            disabled={isSaving}
            className="w-full max-w-xs mt-6"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                Survey...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Survey
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
