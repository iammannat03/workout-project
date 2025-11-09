"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";
import { ExerciseAttributeNameEnum } from "@prisma/client";

import { useI18n } from "locales/client";
import { getExerciseAttributesValueOf } from "@/entities/exercise/shared/muscles";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExerciseWithAttributes } from "../types";

interface CategoryExerciseCardProps {
  exercise: ExerciseWithAttributes;
  onPlayVideo: (exercise: ExerciseWithAttributes) => void;
}

export function CategoryExerciseCard({ exercise, onPlayVideo }: CategoryExerciseCardProps) {
  const t = useI18n();
  const [imageError, setImageError] = useState(false);

  // Use string literals directly to avoid client-side enum bundling issues
  // The function compares strings, so this works the same way
  const equipmentAttributes = getExerciseAttributesValueOf(
    exercise,
    "EQUIPMENT" as ExerciseAttributeNameEnum,
  );
  const typeAttributes = getExerciseAttributesValueOf(exercise, "TYPE" as ExerciseAttributeNameEnum);

  return (
    <Card className="group relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-800">
      <CardHeader className="relative p-0">
        {/* Image/Video thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-200 dark:from-slate-700 dark:to-slate-800">
          {exercise.fullVideoImageUrl && !imageError ? (
            <>
              <Image
                alt={exercise.name}
                className="object-cover transition-transform group-hover:scale-105"
                fill
                loading="lazy"
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={exercise.fullVideoImageUrl}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  className="bg-white/90 text-slate-900 hover:bg-white"
                  onClick={() => onPlayVideo(exercise)}
                  size="small"
                  variant="secondary"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {t("workout_builder.exercise.watch_video")}
                </Button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-slate-400 dark:text-slate-500">
                <Play className="h-12 w-12" />
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Exercise Name */}
        <h3 className="font-semibold text-slate-900 dark:text-slate-200 text-base leading-tight mb-2 line-clamp-2">
          {exercise.name}
        </h3>

        {/* Description/Introduction */}
        {exercise.introduction && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
            {exercise.introduction}
          </p>
        )}

        {/* Equipment Tags */}
        {equipmentAttributes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {equipmentAttributes.slice(0, 2).map((equip, index) => (
              <Badge className="text-xs px-2 py-0.5" key={index} variant="outline">
                {equip.replace("_", " ")}
              </Badge>
            ))}
          </div>
        )}

        {/* Type Tags */}
        {typeAttributes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {typeAttributes.slice(0, 2).map((type, index) => (
              <Badge
                className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
                key={index}
                variant="default"
              >
                {type}
              </Badge>
            ))}
          </div>
        )}

        {/* Watch Video Button */}
        {exercise.fullVideoUrl && (
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => onPlayVideo(exercise)}
            size="small"
          >
            <Play className="h-4 w-4 mr-2" />
            {t("workout_builder.exercise.watch_video")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

