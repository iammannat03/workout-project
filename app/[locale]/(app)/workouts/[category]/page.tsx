import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getI18n } from "locales/server";
import { Locale } from "locales/types";
import { prisma } from "@/shared/lib/prisma";
import { getServerUrl } from "@/shared/lib/server-url";
import { SiteConfig } from "@/shared/config/site-config";
import { CategoryExercisesPage } from "@/features/workout-builder/ui/category-exercises-page";
import { EQUIPMENT_CONFIG } from "@/features/workout-builder/model/equipment-config";

interface CategoryPageProps {
  params: Promise<{ locale: string; category: string }>;
}

// Map category slugs to equipment enum values (matching database - uppercase)
function getEquipmentFromSlug(slug: string): string | null {
  const slugToEquipment: Record<string, string> = {
    "body-only": "BODY_ONLY",
    bodyweight: "BODY_ONLY",
    dumbbell: "DUMBBELL",
    dumbbells: "DUMBBELL",
    barbell: "BARBELL",
    barbells: "BARBELL",
    kettlebell: "KETTLEBELLS",
    kettlebells: "KETTLEBELLS",
    band: "BANDS",
    bands: "BANDS",
    "resistance-band": "BANDS",
    "resistance-bands": "BANDS",
    plate: "WEIGHT_PLATE",
    plates: "WEIGHT_PLATE",
    "weight-plate": "WEIGHT_PLATE",
    "pull-up-bar": "PULLUP_BAR",
    "pullup-bar": "PULLUP_BAR",
    pullup_bar: "PULLUP_BAR",
    bench: "BENCH",
  };

  return slugToEquipment[slug.toLowerCase()] || null;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, category } = await params;
  const t = await getI18n();
  const equipmentValue = getEquipmentFromSlug(category);

  if (!equipmentValue) {
    return {
      title: "Category Not Found",
    };
  }

  // Find equipment config by matching the enum value (database stores uppercase enum values)
  const equipment = EQUIPMENT_CONFIG.find((eq) => {
    return eq.value === equipmentValue;
  });
  const equipmentLabel = equipment?.label || category;

  const isEnglish = locale === "en";
  const title = isEnglish ? `${equipmentLabel} Exercises - Workout Library` : `Exercices ${equipmentLabel} - Bibliothèque d'entraînement`;
  const description = isEnglish
    ? `Discover ${equipmentLabel.toLowerCase()} exercises with detailed instructions, videos, and workout tips.`
    : `Découvrez des exercices ${equipmentLabel.toLowerCase()} avec des instructions détaillées, des vidéos et des conseils d'entraînement.`;

  return {
    title,
    description,
    keywords: isEnglish
      ? [`${equipmentLabel} exercises`, "workout", "fitness", "training", "exercise library"]
      : [`exercices ${equipmentLabel}`, "entraînement", "fitness", "exercices"],
    openGraph: {
      title: `${title} | ${SiteConfig.title}`,
      description,
      images: [
        {
          url: `${getServerUrl()}/images/default-og-image_${locale}.jpg`,
          width: SiteConfig.seo.ogImage.width,
          height: SiteConfig.seo.ogImage.height,
          alt: title,
        },
      ],
    },
    twitter: {
      title: `${title} | ${SiteConfig.title}`,
      description,
      images: [`${getServerUrl()}/images/default-og-image_${locale}.jpg`],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, category } = await params;
  const t = await getI18n();
  const equipmentValue = getEquipmentFromSlug(category);

  if (!equipmentValue) {
    notFound();
  }

  // Fetch exercises for this equipment type using nested query (limit to 10)
  // Matching your database structure with TEXT values
  let exercises;
  try {
    exercises = (await prisma.exercise.findMany({
      where: {
        attributes: {
          some: {
            attributeName: {
              name: "EQUIPMENT",
            },
            attributeValue: {
              value: equipmentValue,
            },
          },
        },
      },
      include: {
        attributes: {
          include: {
            attributeName: true,
            attributeValue: true,
          },
        },
      },
      take: 10,
      orderBy: {
        name: "asc",
      },
    })) as any;
  } catch (error) {
    console.error("Database connection error:", error);
    // Return empty array if database is not available
    exercises = [];
  }

  // Find equipment config by matching the enum value (database stores uppercase enum values)
  const equipment = EQUIPMENT_CONFIG.find((eq) => {
    return eq.value === equipmentValue;
  });

  if (!equipment) {
    notFound();
  }

  return <CategoryExercisesPage exercises={exercises} equipment={equipment} locale={locale as Locale} />;
}
