"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { useI18n, useCurrentLocale } from "locales/client";
import { Locale } from "locales/types";
import { ExerciseVideoModal } from "./exercise-video-modal";
import { CategoryExerciseCard } from "./category-exercise-card";
import { EquipmentItem } from "../types";
import { ExerciseWithAttributes } from "../types";

interface CategoryExercisesPageProps {
  exercises: ExerciseWithAttributes[];
  equipment: EquipmentItem;
  locale: Locale;
}

export function CategoryExercisesPage({ exercises, equipment, locale }: CategoryExercisesPageProps) {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  const [selectedExercise, setSelectedExercise] = useState<ExerciseWithAttributes | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  const handlePlayVideo = (exercise: ExerciseWithAttributes) => {
    setSelectedExercise(exercise);
    setShowVideo(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${currentLocale}`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("commons.go_back")}
        </Link>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20">
            <Image
              alt={equipment.label}
              className="object-contain"
              fill
              src={equipment.icon}
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              {equipment.label} {t("workout_builder.categories.exercises")}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-1">
              {equipment.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span>
            {exercises.length} {t("workout_builder.categories.exercises_found")}
          </span>
        </div>
      </div>

      {/* Exercises Grid */}
      {exercises.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {t("workout_builder.categories.no_exercises")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {exercises.map((exercise) => (
            <CategoryExerciseCard
              key={exercise.id}
              exercise={exercise}
              onPlayVideo={handlePlayVideo}
            />
          ))}
        </div>
      )}

      {/* Video Modal */}
      {selectedExercise && selectedExercise.fullVideoUrl && (
        <ExerciseVideoModal
          exercise={selectedExercise}
          onOpenChange={setShowVideo}
          open={showVideo}
        />
      )}
    </div>
  );
}

