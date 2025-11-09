"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { coverLetterSchema } from "@/app/lib/schema";
import { generateCoverLetter, enhanceCoverLetter } from "@/actions/cover-Letter";
import useFetch from "@/hook/use-Fetch";

export default function CoverLetterGenerator() {
  const router = useRouter();

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(coverLetterSchema),
  });

  // Generate cover letter hook
  const {
    loading: generating,
    fn: generateLetterFn,
    data: generatedLetter,
  } = useFetch(generateCoverLetter);

  // Enhance cover letter hook
  const {
    loading: enhancing,
    fn: enhanceLetterFn,
    data: enhancedLetterData,
  } = useFetch(enhanceCoverLetter);

  // Local state for enhancer textarea and output
  const [coverLetterToEnhance, setCoverLetterToEnhance] = useState("");
  const [enhancedLetter, setEnhancedLetter] = useState("");

  useEffect(() => {
    if (generatedLetter) {
      toast.success("Cover letter generated successfully!");
      router.push(`/ai-cover-letter`); // Redirect to main cover letter list page
      reset();
    }
  }, [generatedLetter]);

  useEffect(() => {
    if (enhancedLetterData?.content) {
      setEnhancedLetter(enhancedLetterData.content);
      toast.success("Cover letter enhanced!");
    }
  }, [enhancedLetterData]);

  // Generate cover letter submit
  const onSubmit = async (data) => {
    try {
      await generateLetterFn(data);
    } catch (error) {
      toast.error(error.message || "Failed to generate cover letter");
    }
  };

  // Enhance cover letter button handler
  const handleEnhance = async () => {
    if (!coverLetterToEnhance.trim()) {
      toast.error("Please enter a cover letter to enhance.");
      return;
    }
    try {
      await enhanceLetterFn({ existingLetter: coverLetterToEnhance });
    } catch (error) {
      toast.error(error.message || "Enhancement failed.");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Provide information about the position you're applying for.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Company Name & Job Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  {...register("companyName")}
                />
                {errors.companyName && (
                  <p className="text-sm text-red-500">
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="Enter job title"
                  {...register("jobTitle")}
                />
                {errors.jobTitle && (
                  <p className="text-sm text-red-500">
                    {errors.jobTitle.message}
                  </p>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description here"
                className="h-32"
                {...register("jobDescription")}
              />
              {errors.jobDescription && (
                <p className="text-sm text-red-500">
                  {errors.jobDescription.message}
                </p>
              )}
            </div>

            {/* AI Enhancer Section Below Job Description */}
            <div className="space-y-2">
              <Label htmlFor="enhanceLetter">Enhance Cover Letter (Paste text here)</Label>
              <Textarea
                id="enhanceLetter"
                placeholder="Paste your existing cover letter or text to enhance"
                className="h-32"
                value={coverLetterToEnhance}
                onChange={(e) => setCoverLetterToEnhance(e.target.value)}
              />

              <div className="flex justify-end mb-2">
                <Button onClick={handleEnhance} disabled={enhancing}>
                  {enhancing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    "Enhance Cover Letter"
                  )}
                </Button>
              </div>

              {enhancedLetter && (
                <>
                  <Label>Enhanced Cover Letter Output</Label>
                  <Textarea
                    readOnly
                    className="h-32"
                    value={enhancedLetter}
                  />
                </>
              )}
            </div>

            {/* Submit button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Cover Letter"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
